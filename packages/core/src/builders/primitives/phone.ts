import { coerceTypes } from '@/validators/coerce';
import { validatePhone } from '@/validators';
import { type Phone } from '@open-form/types';
import { extractSchema } from '@/schemas/extract';

const schema = extractSchema('Phone') as Record<string, unknown>;

function parse(input: unknown): Phone {
	const coerced = coerceTypes(schema, input) as Record<string, unknown>;
	if (!validatePhone(coerced)) {
		const errors = (validatePhone as unknown as { errors: Array<{ message?: string }> }).errors;
		throw new Error(`Invalid Phone: ${errors?.[0]?.message || 'validation failed'}`);
	}
	return coerced as unknown as Phone;
}

class PhoneBuilder {
	private _def: Partial<Phone> = {};

	from(phoneValue: Phone): this {
		this._def = { ...parse(phoneValue) };
		return this;
	}

	number(value: string): this {
		this._def.number = value;
		return this;
	}

	type(value: string | undefined): this {
		this._def.type = value;
		return this;
	}

	extension(value: string | undefined): this {
		this._def.extension = value;
		return this;
	}

	build(): Phone {
		return parse(this._def);
	}
}

type PhoneAPI = {
	(): PhoneBuilder;
	(input: Phone): Phone;
	parse(input: unknown): Phone;
	safeParse(
		input: unknown,
	): { success: true; data: Phone } | { success: false; error: Error };
};

function phoneImpl(): PhoneBuilder;
function phoneImpl(input: Phone): Phone;
function phoneImpl(input?: Phone): PhoneBuilder | Phone {
	if (input !== undefined) {
		return parse(input);
	}
	return new PhoneBuilder();
}

export const phone: PhoneAPI = Object.assign(phoneImpl, {
	parse,
	safeParse: (
		input: unknown,
	): { success: true; data: Phone } | { success: false; error: Error } => {
		try {
			return { success: true, data: parse(input) };
		} catch (err) {
			return { success: false, error: err as Error };
		}
	},
});
