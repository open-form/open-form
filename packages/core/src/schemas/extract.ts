/**
 * Schema Extraction Utility
 *
 * Extracts individual schemas from the bundled OpenForm schema's $defs.
 * This replaces the need to import individual *JsonSchema exports.
 */

// Import schema - tsup will mark this as external so it's not bundled
// The schema will be loaded from @open-form/schemas package at runtime
import bundledSchema from '@open-form/schemas/schema.json' with { type: 'json' }

/**
 * Recursively strip absolute URI $id values and $schema from a JSON Schema.
 * - Strip absolute URIs (http/https) from $id to avoid "Duplicate schema URI" errors
 * - Keep relative anchors like "T0" for internal $ref resolution
 * - Strip $schema to avoid meta-schema resolution issues
 */
function stripAbsoluteIds(schema: unknown): unknown {
	if (typeof schema !== 'object' || schema === null) {
		return schema
	}

	if (Array.isArray(schema)) {
		return schema.map(stripAbsoluteIds)
	}

	const result: Record<string, unknown> = {}
	for (const [key, value] of Object.entries(schema)) {
		// Strip $schema meta-schema references
		if (key === '$schema') {
			continue
		}
		// Strip absolute URI $id values
		if (
			key === '$id' &&
			typeof value === 'string' &&
			(value.startsWith('http://') || value.startsWith('https://'))
		) {
			continue
		}
		result[key] = stripAbsoluteIds(value)
	}
	return result
}

/**
 * Transform JSON Pointer $ref values (#/$defs/Name) to bare names (Name).
 * AJV resolves bare name refs when schemas are pre-loaded by their names.
 *
 * Note: $anchor and #anchor refs (like #T0) are kept as-is for AJV's native support.
 * AJV 8.x supports JSON Schema 2020-12 anchors natively.
 */
function transformJsonPointerRefs(schema: unknown): unknown {
	if (typeof schema !== 'object' || schema === null) {
		return schema
	}

	if (Array.isArray(schema)) {
		return schema.map(transformJsonPointerRefs)
	}

	const result: Record<string, unknown> = {}
	for (const [key, value] of Object.entries(schema)) {
		if (key === '$ref' && typeof value === 'string') {
			// Transform #/$defs/Name to Name for AJV schema resolution
			if (value.startsWith('#/$defs/')) {
				result[key] = value.replace('#/$defs/', '')
			} else {
				// Keep other refs as-is (including #anchor refs like #T0)
				result[key] = value
			}
		} else {
			// Keep $anchor as-is - AJV 8.x supports it natively
			result[key] = transformJsonPointerRefs(value)
		}
	}
	return result
}

/**
 * Recursively fix additionalProperties in schemas with allOf composition.
 * When a schema has allOf with additionalProperties: false, properties defined
 * in allOf subschemas are incorrectly rejected.
 */
function fixAdditionalProperties(schema: unknown): unknown {
	if (typeof schema !== 'object' || schema === null) {
		return schema
	}

	if (Array.isArray(schema)) {
		return schema.map(fixAdditionalProperties)
	}

	const obj = schema as Record<string, unknown>
	const result: Record<string, unknown> = {}

	for (const [key, value] of Object.entries(obj)) {
		if (key === 'additionalProperties' && value === false) {
			if ('allOf' in obj || 'anyOf' in obj || 'oneOf' in obj || 'unevaluatedProperties' in obj) {
				continue
			}
		}
		result[key] = fixAdditionalProperties(value)
	}

	return result
}

/**
 * Preprocess a JSON Schema for AJV standalone code generation.
 */
function preprocessSchema(schema: Record<string, unknown>): Record<string, unknown> {
	let processed = stripAbsoluteIds(schema) as Record<string, unknown>
	processed = fixAdditionalProperties(processed) as Record<string, unknown>
	processed = transformJsonPointerRefs(processed) as Record<string, unknown>
	return processed
}

/**
 * Extract a schema from the bundled schema's $defs by name.
 * Also supports extracting nested schemas from parent definitions.
 *
 * @param name - Schema name in $defs (e.g., "Form", "Field", "CaseContentItem")
 * @returns Preprocessed schema ready for AJV
 * @throws Error if schema not found in $defs
 */
export function extractSchema(name: string): Record<string, unknown> {
	const $defs = (bundledSchema as { $defs?: Record<string, unknown> }).$defs || {}
	
	// Try direct lookup first
	let schema = $defs[name]
	
	// If not found, try extracting from parent schemas
	if (!schema) {
		if (name === 'CaseContentItem') {
			const caseSchema = $defs.Case as Record<string, unknown>
			if (caseSchema) {
				const contents = (caseSchema as { allOf?: Array<Record<string, unknown>> })?.allOf?.[1] as
					| { properties?: { contents?: { items?: Record<string, unknown> } } }
					| undefined
				schema = contents?.properties?.contents?.items
			}
		} else if (name === 'PacketContentItem') {
			const packetSchema = $defs.Packet as Record<string, unknown>
			if (packetSchema) {
				const contents = (packetSchema as { allOf?: Array<Record<string, unknown>> })?.allOf?.[1] as
					| { properties?: { contents?: { items?: Record<string, unknown> } } }
					| undefined
				schema = contents?.properties?.contents?.items
			}
		} else if (name === 'ChecklistItem') {
			// ChecklistItem is now in $defs, so this should not be needed
			// Keeping for backwards compatibility
			const checklistSchema = $defs.Checklist as Record<string, unknown>
			if (checklistSchema) {
				const contents = (checklistSchema as { allOf?: Array<Record<string, unknown>> })?.allOf?.[1] as
					| { properties?: { items?: { items?: Record<string, unknown> } } }
					| undefined
				schema = contents?.properties?.items?.items
			}
		}
	}

	if (!schema) {
		throw new Error(
			`Schema "${name}" not found in bundled schema $defs. Available schemas: ${Object.keys($defs).join(', ')}`
		)
	}

	return preprocessSchema(schema as Record<string, unknown>)
}

/**
 * Get all schemas from the bundled schema's $defs.
 *
 * @returns Map of schema names to preprocessed schemas
 */
export function getAllSchemas(): Record<string, Record<string, unknown>> {
	const $defs = (bundledSchema as { $defs?: Record<string, unknown> }).$defs || {}
	const result: Record<string, Record<string, unknown>> = {}

	for (const [name, schema] of Object.entries($defs)) {
		result[name] = preprocessSchema(schema as Record<string, unknown>)
	}

	return result
}

