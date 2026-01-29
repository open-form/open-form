/**
 * Closure-based fieldset builder for artifacts.
 *
 * Uses factory function and object literal instead of class.
 */

import type { FormField, FormFieldset } from '@open-form/types';
import { extractSchema } from '@open-form/schemas';
import { coerceTypes } from '@/validation/coerce';
import { validateFormFieldset, validateFormField } from '@/validation';

// ============================================================================
// Validation
// ============================================================================

const fieldsetSchema = extractSchema('FormFieldset') as Record<string, unknown>;
const fieldSchema = extractSchema('FormField') as Record<string, unknown>;

function parseFieldset(input: unknown): FormFieldset {
	const coerced = coerceTypes(fieldsetSchema, input) as Record<string, unknown>;
	if (!validateFormFieldset(coerced)) {
		const errors = (validateFormFieldset as unknown as { errors: Array<{ message?: string }> }).errors;
		throw new Error(`Invalid FormFieldset: ${errors?.[0]?.message || 'validation failed'}`);
	}
	return coerced as unknown as FormFieldset;
}

function parseField(input: unknown): FormField {
	const coerced = coerceTypes(fieldSchema, input) as Record<string, unknown>;
	if (!validateFormField(coerced)) {
		const errors = (validateFormField as unknown as { errors: Array<{ message?: string }> }).errors;
		throw new Error(`Invalid FormField: ${errors?.[0]?.message || 'validation failed'}`);
	}
	return coerced as unknown as FormField;
}

// ============================================================================
// Builder Type
// ============================================================================

export interface FieldsetBuilder {
	/** Initialize from existing FormFieldset */
	from(value: FormFieldset): FieldsetBuilder;
	/** Set the title for this fieldset */
	title(value: string | undefined): FieldsetBuilder;
	/** Set an optional description for this fieldset */
	description(value: string | undefined): FieldsetBuilder;
	/** Add a single field to the fieldset */
	field(id: string, fieldDef: FormField): FieldsetBuilder;
	/** Add multiple fields to the fieldset */
	fields(fieldsObj: Record<string, FormField>): FieldsetBuilder;
	/** Set whether the fieldset is required */
	required(value?: boolean): FieldsetBuilder;
	/** Set the display order */
	order(value: number | undefined): FieldsetBuilder;
	/** Build the FormFieldset definition */
	build(): FormFieldset;
}

// ============================================================================
// Factory Function
// ============================================================================

export function fieldsetBuilder(id: string): FieldsetBuilder {
	const _def: Record<string, unknown> = { id, fields: {} };

	const self: FieldsetBuilder = {
		from(value: FormFieldset) {
			Object.assign(_def, parseFieldset(value));
			return self;
		},
		title(value: string | undefined) {
			_def.title = value;
			return self;
		},
		description(value: string | undefined) {
			_def.description = value;
			return self;
		},
		field(fieldId: string, fieldDef: FormField) {
			const fields = (_def.fields as Record<string, FormField>) || {};
			fields[fieldId] = parseField(fieldDef);
			_def.fields = fields;
			return self;
		},
		fields(fieldsObj: Record<string, FormField>) {
			const fields = (_def.fields as Record<string, FormField>) || {};
			for (const [fieldId, fieldDef] of Object.entries(fieldsObj)) {
				fields[fieldId] = parseField(fieldDef);
			}
			_def.fields = fields;
			return self;
		},
		required(value = true) {
			_def.required = value;
			return self;
		},
		order(value: number | undefined) {
			_def.order = value;
			return self;
		},
		build() {
			return parseFieldset(_def);
		},
	};

	return self;
}

// ============================================================================
// Fieldset API
// ============================================================================

export type FieldsetAPI = {
	(id: string): FieldsetBuilder;
	(fieldsObj: Record<string, FormField>): FieldsetBuilder;
	(input: FormFieldset): FormFieldset;
	parse(input: unknown): FormFieldset;
	safeParse(input: unknown): { success: true; data: FormFieldset } | { success: false; error: Error };
};

function fieldsetImpl(id: string): FieldsetBuilder;
function fieldsetImpl(fieldsObj: Record<string, FormField>): FieldsetBuilder;
function fieldsetImpl(input: FormFieldset): FormFieldset;
function fieldsetImpl(input: string | Record<string, FormField> | FormFieldset): FieldsetBuilder | FormFieldset {
	if (typeof input === 'string') {
		return fieldsetBuilder(input);
	}
	if (typeof input === 'object' && input !== null && !('id' in input)) {
		// It's a fields object, create a builder with empty id and set fields
		const builder = fieldsetBuilder('');
		return builder.fields(input as Record<string, FormField>);
	}
	return parseFieldset(input);
}

/**
 * Fieldset builder for grouping related fields.
 *
 * @example
 * ```ts
 * const addressFieldset = fieldset('address')
 *   .title('Address')
 *   .fields({
 *     street: { type: 'text', label: 'Street' },
 *     city: { type: 'text', label: 'City' },
 *   })
 *   .build()
 * ```
 */
export const fieldset: FieldsetAPI = Object.assign(fieldsetImpl, {
	parse: parseFieldset,
	safeParse: (input: unknown): { success: true; data: FormFieldset } | { success: false; error: Error } => {
		try {
			return { success: true, data: parseFieldset(input) };
		} catch (err) {
			return { success: false, error: err as Error };
		}
	},
});
