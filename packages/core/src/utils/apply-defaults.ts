/**
 * Apply default values from a JSON Schema to data
 *
 * This utility walks a JSON Schema and applies default values to data
 * where they are missing. It's a lightweight replacement for TypeBox's Value.Default().
 */

import { deepClone } from './clone'

type JsonSchema = {
  type?: string | string[]
  default?: unknown
  properties?: Record<string, JsonSchema>
  items?: JsonSchema | JsonSchema[]
  anyOf?: JsonSchema[]
  oneOf?: JsonSchema[]
  allOf?: JsonSchema[]
  $ref?: string
  $defs?: Record<string, JsonSchema>
  [key: string]: unknown
}

/**
 * Apply default values from a JSON Schema to data
 *
 * This function recursively walks the schema and applies defaults where
 * the corresponding data value is undefined.
 *
 * @param schema - JSON Schema with default values
 * @param data - Data object to apply defaults to (mutated in place)
 * @returns The data with defaults applied
 *
 * @example
 * ```typescript
 * const schema = {
 *   type: 'object',
 *   properties: {
 *     name: { type: 'string', default: 'Anonymous' },
 *     age: { type: 'number' }
 *   }
 * }
 *
 * const data = { age: 25 }
 * applyDefaults(schema, data)
 * // data is now { name: 'Anonymous', age: 25 }
 * ```
 */
export function applyDefaults<T extends Record<string, unknown>>(
  schema: JsonSchema,
  data: T
): T {
  if (!schema || typeof schema !== 'object') {
    return data
  }

  // Handle $defs references if present
  const defs = schema.$defs || {}

  return applyDefaultsInternal(schema, data, defs) as T
}

function applyDefaultsInternal(
  schema: JsonSchema,
  data: unknown,
  defs: Record<string, JsonSchema>
): unknown {
  // Handle $ref
  if (schema.$ref) {
    const refPath = schema.$ref.replace('#/$defs/', '')
    const refSchema = defs[refPath]
    if (refSchema) {
      return applyDefaultsInternal(refSchema, data, defs)
    }
    return data
  }

  // Handle allOf - merge defaults from all schemas
  if (schema.allOf) {
    let result = data
    for (const subSchema of schema.allOf) {
      result = applyDefaultsInternal(subSchema, result, defs)
    }
    return result
  }

  // Handle anyOf/oneOf - use first schema that has a default
  if (schema.anyOf || schema.oneOf) {
    // For union types, we can't reliably determine which variant applies
    // Just check if the schema itself has a default
    if (data === undefined && schema.default !== undefined) {
      return deepClone(schema.default)
    }
    return data
  }

  // Apply default if data is undefined
  if (data === undefined && schema.default !== undefined) {
    return deepClone(schema.default)
  }

  // Handle object type
  if (schema.type === 'object' && schema.properties) {
    // If data is undefined or null, start with empty object
    const obj = (data ?? {}) as Record<string, unknown>

    for (const [key, propSchema] of Object.entries(schema.properties)) {
      const currentValue = obj[key]
      const newValue = applyDefaultsInternal(propSchema, currentValue, defs)

      // Only set if we got a new value (including default)
      if (newValue !== undefined) {
        obj[key] = newValue
      }
    }

    return obj
  }

  // Handle array type
  if (schema.type === 'array' && schema.items && Array.isArray(data)) {
    const itemSchema = Array.isArray(schema.items) ? schema.items[0] : schema.items
    if (itemSchema) {
      return data.map((item) => applyDefaultsInternal(itemSchema, item, defs))
    }
  }

  return data
}

/**
 * Create a new object with defaults applied (non-mutating version)
 *
 * @param schema - JSON Schema with default values
 * @param data - Data object to apply defaults to
 * @returns New object with defaults applied
 */
export function withDefaults<T extends Record<string, unknown>>(
  schema: JsonSchema,
  data: T
): T {
  const cloned = deepClone(data)
  return applyDefaults(schema, cloned)
}
