/**
 * Artifact Parsers
 *
 * Ready-to-use parse functions for all OpenForm artifacts and blocks.
 * These handle coercion, validation, and error formatting.
 */

import type {
	Form,
	FormField,
	FormAnnex,
	FormFieldset,
	FormParty,
	Layer,
	Bundle,
	BundleContentItem,
	Document,
	Checklist,
	ChecklistItem,
} from '@open-form/types'
import { extractSchema } from '@open-form/schemas'
import { coerceTypes } from './coerce'
import {
	validateForm,
	validateFormField,
	validateFormAnnex,
	validateFormFieldset,
	validateFormParty,
	validateLayer,
	validateBundle,
	validateBundleContentItem,
	validateDocument,
	validateChecklist,
	validateChecklistItem,
} from './validators'

type ValidatorFn = ((data: unknown) => boolean) & { errors?: unknown[] }

/**
 * Extract error message from AJV validator
 */
function getErrorMessage(validator: ValidatorFn): string {
	const firstError = validator.errors?.[0] as { message?: string } | undefined
	return firstError?.message || 'validation failed'
}

/**
 * Factory to create a parser function for artifact schemas
 */
function createArtifactParser<T>(
	schemaName: string,
	validator: ValidatorFn,
): (input: unknown) => T {
	// Lazy schema extraction - cached by extractSchema internally
	let schema: Record<string, unknown> | null = null

	return (input: unknown): T => {
		if (!schema) {
			schema = extractSchema(schemaName) as Record<string, unknown>
		}

		const coerced = coerceTypes(schema, input) as Record<string, unknown>

		// Run AJV validation
		if (!validator(coerced)) {
			throw new Error(`Invalid ${schemaName}: ${getErrorMessage(validator)}`)
		}

		return coerced as unknown as T
	}
}

// ─────────────────────────────────────────────────────────────
// Artifact Parsers
// ─────────────────────────────────────────────────────────────

export const parseForm = createArtifactParser<Form>('Form', validateForm)

export const parseBundle = createArtifactParser<Bundle>('Bundle', validateBundle)

export const parseDocument = createArtifactParser<Document>('Document', validateDocument)

export const parseChecklist = createArtifactParser<Checklist>('Checklist', validateChecklist)

// ─────────────────────────────────────────────────────────────
// Block Parsers (Form components)
// ─────────────────────────────────────────────────────────────

export const parseFormField = createArtifactParser<FormField>('FormField', validateFormField)

export const parseFormAnnex = createArtifactParser<FormAnnex>('FormAnnex', validateFormAnnex)

export const parseFormFieldset = createArtifactParser<FormFieldset>('FormFieldset', validateFormFieldset)

export const parseFormParty = createArtifactParser<FormParty>('FormParty', validateFormParty)

export const parseLayer = createArtifactParser<Layer>('Layer', validateLayer)

// ─────────────────────────────────────────────────────────────
// Collection Item Parsers
// ─────────────────────────────────────────────────────────────

export const parseBundleContentItem = createArtifactParser<BundleContentItem>(
	'BundleContentItem',
	validateBundleContentItem,
)

export const parseChecklistItem = createArtifactParser<ChecklistItem>(
	'ChecklistItem',
	validateChecklistItem,
)
