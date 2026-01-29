/**
 * Runtime AJV Validators
 *
 * These validators compile schemas on-demand using AJV and cache the compiled
 * validators for performance. This replaces the standalone codegen approach.
 */

import type { ValidateFunction } from 'ajv'
import { ajv } from './ajv-instance'
import { extractSchema } from '@open-form/schemas'

// Cache for compiled validators
const validatorCache = new Map<string, ValidateFunction>()

/**
 * Get a compiled validator for a schema, compiling and caching if needed.
 *
 * @param schemaName - Schema name in $defs (e.g., "Form", "Field", "Coordinate")
 * @returns Compiled AJV validator function
 */
function getValidator(schemaName: string): ValidateFunction {
	if (!validatorCache.has(schemaName)) {
		// Check if AJV already has this schema compiled (from pre-loading)
		// The schema was added with its name as the key in ajv-instance.ts
		let validator = ajv.getSchema(schemaName)

		if (!validator) {
			// Schema not yet compiled, extract and compile it
			const schema = extractSchema(schemaName)
			// Remove $id temporarily to avoid conflicts since we're managing it via addSchema
			const schemaId = schema.$id as string | undefined
			if (schemaId) {
				delete schema.$id
			}
			validator = ajv.compile(schema)
			// Restore $id if it was removed
			if (schemaId) {
				schema.$id = schemaId
			}
		}

		validatorCache.set(schemaName, validator)
	}
	return validatorCache.get(schemaName)!
}

// Map schema names from $defs (PascalCase) to validator keys (camelCase)
const schemaNameMap: Record<string, string> = {
	// Artifacts
	Form: 'form',
	Document: 'document',
	Bundle: 'bundle',
	BundleContentItem: 'bundleContentItem',
	Checklist: 'checklist',
	ChecklistItem: 'checklistItem',
	// Blocks (design-time form components)
	FormField: 'formField',
	FormAnnex: 'formAnnex',
	FormFieldset: 'formFieldset',
	FormParty: 'formParty',
	// Note: FormSignature is not here - it's inlined in FormParty schema
	Layer: 'layer',
	// Runtime types
	Signature: 'signature',
	Attachment: 'attachment',
	// Primitives (only those available in bundled schema)
	Address: 'address',
	Bbox: 'bbox',
	Coordinate: 'coordinate',
	Duration: 'duration',
	Identification: 'identification',
	Metadata: 'metadata',
	Money: 'money',
	Organization: 'organization',
	Person: 'person',
	Phone: 'phone',
}

/**
 * Helper to create a validator function that exposes errors
 */
function createValidator(schemaName: string): ((data: unknown) => boolean) & { errors?: unknown[] } {
	const fn = function(data: unknown): boolean {
		const validator = getValidator(schemaName)
		const result = validator(data)
		// Expose errors on the function for access after validation
		;(fn as { errors?: unknown[] }).errors = validator.errors || undefined
		return result
	} as ((data: unknown) => boolean) & { errors?: unknown[] }
	return fn
}

// Create validator functions for each schema
// These functions validate and expose errors via the validator's .errors property

// Artifacts
export const validateForm = createValidator('Form')
export const validateDocument = createValidator('Document')
export const validateBundle = createValidator('Bundle')
export const validateChecklist = createValidator('Checklist')

// Blocks (design-time form components)
export const validateFormField = createValidator('FormField')
export const validateFormAnnex = createValidator('FormAnnex')
export const validateFormFieldset = createValidator('FormFieldset')
export const validateFormParty = createValidator('FormParty')
// Note: validateFormSignature removed - FormSignature is inlined in FormParty
export const validateLayer = createValidator('Layer')
export const validateChecklistItem = createValidator('ChecklistItem')
export const validateBundleContentItem = createValidator('BundleContentItem')

// Runtime types
export const validateSignature = createValidator('Signature')
export const validateAttachment = createValidator('Attachment')

// Primitives (only those available in bundled schema)
export const validateAddress = createValidator('Address')
export const validateBbox = createValidator('Bbox')
export const validateCoordinate = createValidator('Coordinate')
export const validateDuration = createValidator('Duration')
export const validateIdentification = createValidator('Identification')
export const validateMetadata = createValidator('Metadata')
export const validateMoney = createValidator('Money')
export const validateOrganization = createValidator('Organization')
export const validatePerson = createValidator('Person')
export const validatePhone = createValidator('Phone')
// Note: File, FileContent, ResourceRef, TextContent not in bundled schema


// Export function to get errors for a validator by schema name
// This accesses the .errors property on the compiled validator
export function getValidatorErrors(validatorName: string): unknown[] | null | undefined {
	const schemaName = Object.entries(schemaNameMap).find(([, key]) => key === validatorName)?.[0]
	if (!schemaName) return null
	const validator = getValidator(schemaName)
	return validator.errors || null
}
