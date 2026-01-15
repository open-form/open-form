import { coerceTypes } from '@/validators/coerce';
import { validateIdentification } from '@/validators';
import { type Identification } from '@open-form/types';
import { extractSchema } from '@/schemas/extract';

const schema = extractSchema('Identification') as Record<string, unknown>;

function parse(input: unknown): Identification {
	const coerced = coerceTypes(schema, input) as Record<string, unknown>;
	if (!validateIdentification(coerced)) {
		const errors = (validateIdentification as unknown as { errors: Array<{ message?: string }> }).errors;
		throw new Error(`Invalid Identification: ${errors?.[0]?.message || 'validation failed'}`);
	}
	return coerced as unknown as Identification;
}

class IdentificationBuilder {
	private _def: Partial<Identification> = {};

	from(identification: Identification): this {
		this._def = { ...parse(identification) };
		return this;
	}

	type(val: string): this {
		this._def.type = val;
		return this;
	}

	number(val: string): this {
		this._def.number = val;
		return this;
	}

	issuer(val: string | undefined): this {
		this._def.issuer = val;
		return this;
	}

	issueDate(val: string | undefined): this {
		this._def.issueDate = val;
		return this;
	}

	expiryDate(val: string | undefined): this {
		this._def.expiryDate = val;
		return this;
	}

	build(): Identification {
		return parse(this._def);
	}
}

type IdentificationAPI = {
	(): IdentificationBuilder;
	(input: Identification): Identification;
	parse(input: unknown): Identification;
	safeParse(
		input: unknown,
	): { success: true; data: Identification } | { success: false; error: Error };
};

function identificationImpl(): IdentificationBuilder;
function identificationImpl(input: Identification): Identification;
function identificationImpl(
	input?: Identification,
): IdentificationBuilder | Identification {
	if (input !== undefined) {
		return parse(input);
	}
	return new IdentificationBuilder();
}

export const identification: IdentificationAPI = Object.assign(
	identificationImpl,
	{
		parse,
		safeParse: (
			input: unknown,
		): { success: true; data: Identification } | { success: false; error: Error } => {
			try {
				return { success: true, data: parse(input) };
			} catch (err) {
				return { success: false, error: err as Error };
			}
		},
	},
);
