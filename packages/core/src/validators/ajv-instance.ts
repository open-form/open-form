/**
 * Shared AJV Instance for Artifact Validation
 *
 * This module provides a shared AJV instance configured for artifact validation.
 * All schemas from the bundled schema are pre-loaded for $ref resolution.
 * Validators are compiled on-demand and cached for performance.
 */

import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { getAllSchemas } from '../schemas/extract'

// Initialize AJV instance for artifact validation
const ajv = new Ajv({
	strict: false,
	allErrors: true,
	verbose: true,
})

// Add format validators (date, email, uri, uuid, etc.)
addFormats(ajv)

// Pre-load all schemas for $ref resolution
// This ensures that when we compile a schema, all its $ref references are available
// Check if schemas are already loaded to avoid "already exists" errors in tests
const allSchemas = getAllSchemas()
for (const [name, schema] of Object.entries(allSchemas)) {
	// Use PascalCase names matching $defs for $ref resolution
	// Only add if not already present (handles module re-imports in tests)
	if (!ajv.getSchema(name)) {
		ajv.addSchema(schema, name)
	}
}

// Also register inline schemas that are not in $defs but are used for validation
// These are extracted from parent schemas (e.g., ChecklistItem from Checklist)
import { extractSchema } from '../schemas/extract'

const inlineSchemas = ['ChecklistItem', 'CaseContentItem', 'PacketContentItem']
for (const schemaName of inlineSchemas) {
	if (!ajv.getSchema(schemaName)) {
		try {
			const schema = extractSchema(schemaName)
			ajv.addSchema(schema, schemaName)
		} catch (_e) {
			// Schema might not exist, skip it
			// This can happen if the schema structure changes
		}
	}
}

export { ajv }

