import { coerceTypes } from '@/validators/coerce';
import { validateMetadata } from '@/validators';
import { type Metadata } from '@open-form/types';
import { extractSchema } from '@/schemas/extract';

const schema = extractSchema('Metadata') as Record<string, unknown>;

function parse(input: unknown): Metadata {
	const coerced = coerceTypes(schema, input) as Record<string, unknown>;
	if (!validateMetadata(coerced)) {
		const errors = (validateMetadata as unknown as { errors: Array<{ message?: string }> }).errors;
		throw new Error(`Invalid Metadata: ${errors?.[0]?.message || 'validation failed'}`);
	}
	return coerced as unknown as Metadata;
}

type MetadataValue = Metadata[string];

export class MetadataBuilder {
	private _def: Metadata = {};

	from(metadataValue: Metadata): this {
		this._def = { ...parse(metadataValue) };
		return this;
	}

	set(key: string, value: MetadataValue): this {
		this._def[key] = value;
		return this;
	}

	unset(key: string): this {
		delete this._def[key];
		return this;
	}

	merge(values: Metadata): this {
		this._def = { ...this._def, ...values };
		return this;
	}

	build(): Metadata {
		return parse(this._def);
	}
}

type MetadataAPI = {
	(): MetadataBuilder;
	(input: Metadata): Metadata;
	parse(input: unknown): Metadata;
	safeParse(
		input: unknown,
	): { success: true; data: Metadata } | { success: false; error: Error };
};

function metadataImpl(): MetadataBuilder;
function metadataImpl(input: Metadata): Metadata;
function metadataImpl(input?: Metadata): MetadataBuilder | Metadata {
	if (input !== undefined) {
		return parse(input);
	}
	return new MetadataBuilder();
}

export const metadata: MetadataAPI = Object.assign(metadataImpl, {
	parse,
	safeParse: (
		input: unknown,
	): { success: true; data: Metadata } | { success: false; error: Error } => {
		try {
			return { success: true, data: parse(input) };
		} catch (err) {
			return { success: false, error: err as Error };
		}
	},
});
