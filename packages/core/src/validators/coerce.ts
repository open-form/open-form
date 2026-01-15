/**
 * Type Coercion Utilities
 *
 * Pure TypeScript utilities for coercing values to match JSON Schema types.
 * No external dependencies - these work with any JSON Schema validator.
 */

import bundledSchema from '@open-form/schemas/schema.json' with { type: 'json' }
import { deepClone } from '../utils/clone'

/**
 * Build an index of all schemas with $id or $anchor references
 * This is needed to resolve inline references like "T0" used in recursive schemas.
 * JSON Schema 2020-12 uses $anchor for plain name fragment identifiers.
 */
function buildIdIndex(schema: unknown, index: Map<string, Record<string, unknown>>): void {
	if (!schema || typeof schema !== 'object') return
	const obj = schema as Record<string, unknown>

	// If this schema has an $id or $anchor, add it to the index
	// $anchor is the JSON Schema 2020-12 way to create named anchors
	if (typeof obj.$id === 'string') {
		index.set(obj.$id, obj)
	}
	if (typeof obj.$anchor === 'string') {
		index.set(obj.$anchor, obj)
	}

	// Recursively scan all properties
	for (const value of Object.values(obj)) {
		if (Array.isArray(value)) {
			for (const item of value) {
				buildIdIndex(item, index)
			}
		} else if (value && typeof value === 'object') {
			buildIdIndex(value, index)
		}
	}
}

// Build the $id index at module load time
const schemaIdIndex = new Map<string, Record<string, unknown>>()
buildIdIndex(bundledSchema, schemaIdIndex)

/**
 * Resolve a $ref reference to the actual schema
 */
function resolveRef(ref: string): Record<string, unknown> | undefined {
	// Handle local references like "#/$defs/Coordinate", just "Coordinate", or "#T0" (anchor refs)
	let refName = ref.replace(/^#\/\$defs\//, '').replace(/^#\//, '')
	// Also handle anchor refs like "#T0" -> "T0"
	if (refName.startsWith('#')) {
		refName = refName.slice(1)
	}

	// First check the $id index (for inline recursive schemas like T0)
	const indexedSchema = schemaIdIndex.get(refName)
	if (indexedSchema) {
		return indexedSchema
	}

	// Fall back to $defs lookup
	const $defs = (bundledSchema as { $defs?: Record<string, unknown> }).$defs || {}
	return $defs[refName] as Record<string, unknown> | undefined
}

/**
 * Collect all properties from a schema including from allOf/anyOf/oneOf
 * Resolves $ref references recursively
 * 
 * @param schema - The schema to collect properties from
 * @param data - Optional data object to help determine which anyOf/oneOf branch to use
 */
function collectAllProperties(
  schema: Record<string, unknown>,
  data?: unknown
): Record<string, Record<string, unknown>> {
  const allProperties: Record<string, Record<string, unknown>> = {}

  // Handle $ref references
  if (schema.$ref && typeof schema.$ref === 'string') {
    const resolvedSchema = resolveRef(schema.$ref)
    if (resolvedSchema) {
      return collectAllProperties(resolvedSchema, data)
    }
    return allProperties
  }

  // Get direct properties
  const properties = schema.properties as Record<string, Record<string, unknown>> | undefined
  if (properties) {
    Object.assign(allProperties, properties)
  }

  // Collect from allOf
  const allOf = schema.allOf as Array<Record<string, unknown>> | undefined
  if (allOf) {
    for (const subSchema of allOf) {
      Object.assign(allProperties, collectAllProperties(subSchema, data))
    }
  }

  // Collect from anyOf - try to match based on discriminator if data provided
  const anyOf = schema.anyOf as Array<Record<string, unknown>> | undefined
  if (anyOf) {
    if (data && typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>
      // Try to find matching branch based on common discriminator fields (type, kind, etc.)
      let matchedBranch: Record<string, unknown> | undefined

      // Common discriminator field names to check
      const discriminatorFields = ['type', 'kind', 'variant', 'discriminator']

      for (const branch of anyOf) {
        // Check branch's direct properties first
        const branchProps = branch.properties as Record<string, Record<string, unknown>> | undefined
        if (branchProps) {
          for (const field of discriminatorFields) {
            const prop = branchProps[field] as Record<string, unknown> | undefined
            if (prop?.const && obj[field] === prop.const) {
              matchedBranch = branch
              break
            }
          }
        }
        if (matchedBranch) break

        // Then check allOf subschemas
        const allOf = branch.allOf as Array<Record<string, unknown>> | undefined
        if (allOf) {
          for (const subSchema of allOf) {
            const props = subSchema.properties as Record<string, Record<string, unknown>> | undefined
            if (props) {
              for (const field of discriminatorFields) {
                const prop = props[field] as Record<string, unknown> | undefined
                if (prop?.const && obj[field] === prop.const) {
                  matchedBranch = branch
                  break
                }
              }
            }
            if (matchedBranch) break
          }
        }
        if (matchedBranch) break
      }
      // If we found a matching branch, only collect from that branch
      if (matchedBranch) {
        Object.assign(allProperties, collectAllProperties(matchedBranch, data))
      } else {
        // Otherwise, merge all branches (fallback)
        for (const subSchema of anyOf) {
          Object.assign(allProperties, collectAllProperties(subSchema, data))
        }
      }
    } else {
      // No data to match against, merge all branches
      for (const subSchema of anyOf) {
        Object.assign(allProperties, collectAllProperties(subSchema, data))
      }
    }
  }

  // Collect from oneOf - same logic as anyOf
  const oneOf = schema.oneOf as Array<Record<string, unknown>> | undefined
  if (oneOf) {
    if (data && typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>
      let matchedBranch: Record<string, unknown> | undefined

      // Common discriminator field names to check
      const discriminatorFields = ['type', 'kind', 'variant', 'discriminator']

      for (const branch of oneOf) {
        // Check branch's direct properties first
        const branchProps = branch.properties as Record<string, Record<string, unknown>> | undefined
        if (branchProps) {
          for (const field of discriminatorFields) {
            const prop = branchProps[field] as Record<string, unknown> | undefined
            if (prop?.const && obj[field] === prop.const) {
              matchedBranch = branch
              break
            }
          }
        }
        if (matchedBranch) break

        // Then check allOf subschemas
        const allOf = branch.allOf as Array<Record<string, unknown>> | undefined
        if (allOf) {
          for (const subSchema of allOf) {
            const props = subSchema.properties as Record<string, Record<string, unknown>> | undefined
            if (props) {
              for (const field of discriminatorFields) {
                const prop = props[field] as Record<string, unknown> | undefined
                if (prop?.const && obj[field] === prop.const) {
                  matchedBranch = branch
                  break
                }
              }
            }
            if (matchedBranch) break
          }
        }
        if (matchedBranch) break
      }
      if (matchedBranch) {
        Object.assign(allProperties, collectAllProperties(matchedBranch, data))
      } else {
        for (const subSchema of oneOf) {
          Object.assign(allProperties, collectAllProperties(subSchema, data))
        }
      }
    } else {
      for (const subSchema of oneOf) {
        Object.assign(allProperties, collectAllProperties(subSchema, data))
      }
    }
  }

  return allProperties
}

/**
 * Collect all default values from a schema including from allOf/anyOf/oneOf
 * Resolves $ref references recursively
 */
function collectAllDefaults(schema: Record<string, unknown>): Record<string, unknown> {
  const allDefaults: Record<string, unknown> = {}

  // Handle $ref references
  if (schema.$ref && typeof schema.$ref === 'string') {
    const resolvedSchema = resolveRef(schema.$ref)
    if (resolvedSchema) {
      return collectAllDefaults(resolvedSchema)
    }
    return allDefaults
  }

  // Get direct property defaults
  const properties = schema.properties as Record<string, Record<string, unknown>> | undefined
  if (properties) {
    for (const [key, propSchema] of Object.entries(properties)) {
      if ('default' in propSchema) {
        allDefaults[key] = propSchema.default
      }
    }
  }

  // Collect from allOf
  const allOf = schema.allOf as Array<Record<string, unknown>> | undefined
  if (allOf) {
    for (const subSchema of allOf) {
      Object.assign(allDefaults, collectAllDefaults(subSchema))
    }
  }

  // Collect from anyOf (merge defaults from all branches)
  const anyOf = schema.anyOf as Array<Record<string, unknown>> | undefined
  if (anyOf) {
    for (const subSchema of anyOf) {
      Object.assign(allDefaults, collectAllDefaults(subSchema))
    }
  }

  // Collect from oneOf (merge defaults from all branches)
  const oneOf = schema.oneOf as Array<Record<string, unknown>> | undefined
  if (oneOf) {
    for (const subSchema of oneOf) {
      Object.assign(allDefaults, collectAllDefaults(subSchema))
    }
  }

  return allDefaults
}

/**
 * Coerce and clean values to match expected types based on JSON Schema.
 * This replicates TypeBox's Value.Parse behavior:
 * - Coerces types (string "123" -> number 123)
 * - Strips additional properties when additionalProperties: false
 * - Applies default values from schema
 * - Handles nested objects and arrays
 * - Properly handles allOf/anyOf/oneOf composition
 *
 * @param schema - JSON Schema object
 * @param data - Data to coerce
 * @returns Coerced and cleaned data
 */
export function coerceTypes(schema: Record<string, unknown>, data: unknown): unknown {
  if (data === null || data === undefined) {
    return data
  }

  // Handle $ref references
  if (schema.$ref && typeof schema.$ref === 'string') {
    const resolvedSchema = resolveRef(schema.$ref)
    if (resolvedSchema) {
      return coerceTypes(resolvedSchema, data)
    }
    // If ref can't be resolved, return data as-is
    return data
  }

  // Handle anyOf at top level (e.g., Party schema, StatusSpec)
  const anyOf = schema.anyOf as Array<Record<string, unknown>> | undefined
  if (anyOf && !schema.type) {
    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>

      // Try to determine which branch to use based on common discriminator fields
      // Common patterns: "type" for Party, "kind" for StatusSpec
      let selectedBranch: Record<string, unknown> | undefined

      // Common discriminator field names to check
      const discriminatorFields = ['type', 'kind', 'variant', 'discriminator']

      for (const branch of anyOf) {
        // Check branch's direct properties first
        const branchProps = branch.properties as Record<string, Record<string, unknown>> | undefined
        if (branchProps) {
          for (const field of discriminatorFields) {
            const prop = branchProps[field] as Record<string, unknown> | undefined
            if (prop?.const && obj[field] === prop.const) {
              selectedBranch = branch
              break
            }
          }
        }
        if (selectedBranch) break

        // Then check allOf subschemas
        const allOf = branch.allOf as Array<Record<string, unknown>> | undefined
        if (allOf) {
          for (const subSchema of allOf) {
            const properties = subSchema.properties as Record<string, Record<string, unknown>> | undefined
            if (properties) {
              for (const field of discriminatorFields) {
                const prop = properties[field] as Record<string, unknown> | undefined
                if (prop?.const && obj[field] === prop.const) {
                  selectedBranch = branch
                  break
                }
              }
            }
            if (selectedBranch) break
          }
        }
        if (selectedBranch) break
      }
      
      // If we found a matching branch, use it; otherwise merge all branches
      const branchToUse = selectedBranch || schema
      const allProperties = collectAllProperties(branchToUse, data)
      const allDefaults = collectAllDefaults(branchToUse)
      const result: Record<string, unknown> = {}
      
      // Apply defaults
      for (const [key, defaultValue] of Object.entries(allDefaults)) {
        if (!(key in obj) || obj[key] === undefined) {
          result[key] = typeof defaultValue === 'object' && defaultValue !== null
            ? deepClone(defaultValue)
            : defaultValue
        }
      }
      
      // Process known properties - only include properties that are in allProperties
      for (const [key, propSchema] of Object.entries(allProperties)) {
        if (key in obj && obj[key] !== undefined) {
          result[key] = coerceTypes(propSchema, obj[key])
        }
      }
      
      // Strip additional properties if the selected branch has additionalProperties: false
      // We need to ensure result only contains properties from allProperties
      if (selectedBranch) {
        const hasPatternProperties = 'patternProperties' in selectedBranch && selectedBranch.patternProperties !== undefined
        const explicitlyAllowsAdditional =
          selectedBranch.additionalProperties === true ||
          (typeof selectedBranch.additionalProperties === 'object' && selectedBranch.additionalProperties !== null)
        
        if (!hasPatternProperties && !explicitlyAllowsAdditional && selectedBranch.additionalProperties === false) {
          // Create a new object with only allowed properties from allProperties
          // This ensures we don't include any properties that aren't in the merged schema
          const filtered: Record<string, unknown> = {}
          for (const key of Object.keys(allProperties)) {
            const propSchema = allProperties[key]
            if (!propSchema) continue // Skip if property schema is undefined
            if (key in result) {
              filtered[key] = result[key]
            } else if (key in obj) {
              // Also include properties from input that are in allProperties
              filtered[key] = coerceTypes(propSchema, obj[key])
            }
          }
          return filtered
        }
      }
      
      return result
    }
    return data
  }

  const schemaType = schema.type as string | undefined

  // Handle type coercion based on schema type
  if (schemaType === 'number' || schemaType === 'integer') {
    if (typeof data === 'string') {
      const num = Number(data)
      if (!isNaN(num)) {
        // Convert -0 to 0 (TypeBox behavior)
        return Object.is(num, -0) ? 0 : num
      }
    }
    // Convert -0 to 0 for numbers (TypeBox behavior)
    if (typeof data === 'number' && Object.is(data, -0)) {
      return 0
    }
    return data
  }

  if (schemaType === 'boolean') {
    if (typeof data === 'string') {
      if (data === 'true') return true
      if (data === 'false') return false
    }
    if (typeof data === 'number') {
      return data !== 0
    }
    return data
  }

  if (schemaType === 'string') {
    if (typeof data === 'number' || typeof data === 'boolean') {
      return String(data)
    }
    return data
  }

  if (schemaType === 'object' && typeof data === 'object' && data !== null) {
    // Collect all properties from the schema and any allOf/anyOf/oneOf subschemas
    // Pass data to help determine which anyOf/oneOf branch to use
    const allProperties = collectAllProperties(schema, data)
    const allDefaults = collectAllDefaults(schema)
    const obj = data as Record<string, unknown>

    // Create a new object with coerced properties
    const result: Record<string, unknown> = {}

    // First, apply defaults for properties that are missing
    for (const [key, defaultValue] of Object.entries(allDefaults)) {
      if (!(key in obj) || obj[key] === undefined) {
        // Deep clone the default value to avoid mutation
        result[key] =
          typeof defaultValue === 'object' && defaultValue !== null
            ? deepClone(defaultValue)
            : defaultValue
      }
    }

    // Process known properties with coercion, filtering out undefined values
    for (const [key, propSchema] of Object.entries(allProperties)) {
      if (key in obj && obj[key] !== undefined) {
        result[key] = coerceTypes(propSchema, obj[key])
      }
    }

    // Handle extra properties based on schema
    // - If schema has patternProperties, copy extra properties (they're matched by pattern)
    // - If schema has additionalProperties: true or additionalProperties: {schema}, copy extra properties
    // - Otherwise, strip extra properties (TypeBox's Value.Parse behavior)
    const hasPatternProperties =
      'patternProperties' in schema && schema.patternProperties !== undefined
    const explicitlyAllowsAdditional =
      schema.additionalProperties === true ||
      (typeof schema.additionalProperties === 'object' && schema.additionalProperties !== null)

    if (hasPatternProperties || explicitlyAllowsAdditional) {
      for (const key of Object.keys(obj)) {
        if (!(key in allProperties) && obj[key] !== undefined) {
          // For patternProperties, we should recursively coerce if there's a matching pattern schema
          if (hasPatternProperties) {
            const patterns = schema.patternProperties as Record<string, Record<string, unknown>>
            // Find a matching pattern schema
            let patternSchema: Record<string, unknown> | undefined
            for (const pattern of Object.keys(patterns)) {
              if (new RegExp(pattern).test(key)) {
                patternSchema = patterns[pattern]
                break
              }
            }
            result[key] = patternSchema ? coerceTypes(patternSchema, obj[key]) : obj[key]
          } else {
            result[key] = obj[key]
          }
        }
      }
    }
    // If neither condition is met (strict mode), extra properties are stripped

    return result
  }

  if (schemaType === 'array' && Array.isArray(data)) {
    const items = schema.items as Record<string, unknown> | undefined
    if (items) {
      return data.map((item) => coerceTypes(items, item))
    }
    return data
  }

  return data
}
