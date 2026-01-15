import { coerceTypes } from '@/validators/coerce';
import { validateAddress } from '@/validators';
import { type Address } from '@open-form/types';
import { extractSchema } from '@/schemas/extract';

const schema = extractSchema('Address') as Record<string, unknown>;

function parse(input: unknown): Address {
	const coerced = coerceTypes(schema, input) as Record<string, unknown>;
	if (!validateAddress(coerced)) {
		const errors = (validateAddress as unknown as { errors: Array<{ message?: string }> }).errors;
		throw new Error(`Invalid Address: ${errors?.[0]?.message || 'validation failed'}`);
	}
	return coerced as unknown as Address;
}

class AddressBuilder {
	private _def: Partial<Address> = {};

	from(address: Address): this {
		this._def = { ...parse(address) };
		return this;
	}

	line1(value: string): this {
		this._def.line1 = value;
		return this;
	}

	line2(value: string | undefined): this {
		this._def.line2 = value;
		return this;
	}

	locality(value: string): this {
		this._def.locality = value;
		return this;
	}

	region(value: string): this {
		this._def.region = value;
		return this;
	}

	postalCode(value: string): this {
		this._def.postalCode = value;
		return this;
	}

	country(value: string): this {
		this._def.country = value;
		return this;
	}

	build(): Address {
		return parse(this._def);
	}
}

type AddressAPI = {
	(): AddressBuilder;
	(input: Address): Address;
	parse(input: unknown): Address;
	safeParse(
		input: unknown,
	): { success: true; data: Address } | { success: false; error: Error };
};

function addressImpl(): AddressBuilder;
function addressImpl(input: Address): Address;
function addressImpl(input?: Address): AddressBuilder | Address {
	if (input !== undefined) {
		return parse(input);
	}
	return new AddressBuilder();
}

export const address: AddressAPI = Object.assign(addressImpl, {
	parse,
	safeParse: (
		input: unknown,
	): { success: true; data: Address } | { success: false; error: Error } => {
		try {
			return { success: true, data: parse(input) };
		} catch (err) {
			return { success: false, error: err as Error };
		}
	},
});
