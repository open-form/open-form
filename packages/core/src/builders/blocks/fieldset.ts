import { coerceTypes } from '@/validators/coerce';
import { validateFieldset, validateField } from '@/validators';
import { type Field, type Fieldset } from '@open-form/types';
import { extractSchema } from '@/schemas/extract';

const fieldsetSchema = extractSchema('Fieldset') as Record<string, unknown>;
const fieldSchema = extractSchema('Field') as Record<string, unknown>;

function parseFieldset(input: unknown): Fieldset {
	const coerced = coerceTypes(fieldsetSchema, input) as Record<string, unknown>;
	if (!validateFieldset(coerced)) {
		const errors = (validateFieldset as unknown as { errors: Array<{ message?: string }> }).errors;
		throw new Error(`Invalid Fieldset: ${errors?.[0]?.message || 'validation failed'}`);
	}
	return coerced as unknown as Fieldset;
}

function parseField(input: unknown): Field {
	const coerced = coerceTypes(fieldSchema, input) as Record<string, unknown>;
	if (!validateField(coerced)) {
		const errors = (validateField as unknown as { errors: Array<{ message?: string }> }).errors;
		throw new Error(`Invalid Field: ${errors?.[0]?.message || 'validation failed'}`);
	}
	return coerced as unknown as Field;
}

class FieldsetBuilder {
	private _def: Record<string, unknown>;

	constructor(id: string) {
		this._def = { id, fields: {} };
	}

	from(fieldsetValue: Fieldset): this {
		this._def = { ...parseFieldset(fieldsetValue) };
		return this;
	}

	title(value: string | undefined): this {
		this._def.title = value;
		return this;
	}

	description(value: string | undefined): this {
		this._def.description = value;
		return this;
	}

	field(id: string, fieldDef: Field): this {
		const fields = (this._def.fields as Record<string, Field>) || {};
		fields[id] = parseField(fieldDef);
		this._def.fields = fields;
		return this;
	}

	fields(fieldsObj: Record<string, Field>): this {
		const fields = (this._def.fields as Record<string, Field>) || {};
		for (const [id, fieldDef] of Object.entries(fieldsObj)) {
			fields[id] = parseField(fieldDef);
		}
		this._def.fields = fields;
		return this;
	}

	required(value: boolean = true): this {
		this._def.required = value;
		return this;
	}

	order(value: number | undefined): this {
		this._def.order = value;
		return this;
	}

	build(): Fieldset {
		return parseFieldset(this._def);
	}
}

type FieldsetAPI = {
	(id: string): FieldsetBuilder;
	(fieldsObj: Record<string, Field>): FieldsetBuilder;
	(input: Fieldset): Fieldset;
	parse(input: unknown): Fieldset;
	safeParse(
		input: unknown,
	): { success: true; data: Fieldset } | { success: false; error: Error };
};

function fieldsetImpl(id: string): FieldsetBuilder;
function fieldsetImpl(fieldsObj: Record<string, Field>): FieldsetBuilder;
function fieldsetImpl(input: Fieldset): Fieldset;
function fieldsetImpl(
	input: string | Record<string, Field> | Fieldset,
): FieldsetBuilder | Fieldset {
	if (typeof input === 'string') {
		return new FieldsetBuilder(input);
	}
	if (typeof input === 'object' && input !== null && !('id' in input)) {
		// It's a fields object, create a builder with empty id and set fields
		const builder = new FieldsetBuilder('');
		return builder.fields(input as Record<string, Field>);
	}
	return parseFieldset(input);
}

export const fieldset: FieldsetAPI = Object.assign(fieldsetImpl, {
	parse: parseFieldset,
	safeParse: (
		input: unknown,
	): { success: true; data: Fieldset } | { success: false; error: Error } => {
		try {
			return { success: true, data: parseFieldset(input) };
		} catch (err) {
			return { success: false, error: err as Error };
		}
	},
});
