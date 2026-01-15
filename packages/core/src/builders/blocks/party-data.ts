import { coerceTypes } from '@/validators/coerce';
import { validateParty } from '@/validators';
import { type Party } from '@open-form/types';
import { extractSchema } from '@/schemas/extract';

const schema = extractSchema('Party') as Record<string, unknown>;

/**
 * Filter out undefined values from an object
 * JSON Schema validators don't handle undefined well
 */
function filterUndefined(obj: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined) {
			result[key] = value;
		}
	}
	return result;
}

function parse(input: unknown): Party {
	// Filter undefined values since Party uses anyOf without type:object
	const cleaned = typeof input === 'object' && input !== null
		? filterUndefined(input as Record<string, unknown>)
		: input;
	const coerced = coerceTypes(schema, cleaned) as Record<string, unknown>;

	// Validate - need to call the function to get errors
	const isValid = validateParty(coerced);
	if (!isValid) {
		// Get errors from the validator function
		// The validator function has an .errors property set after validation
		const validator = validateParty as unknown as { errors?: Array<{ message?: string; instancePath?: string; schemaPath?: string }> };
		const errors = validator.errors || [];
		const errorMessage = errors[0]?.message || 'validation failed';
		const errorPath = errors[0]?.instancePath ? ` at ${errors[0].instancePath}` : '';
		const schemaPath = errors[0]?.schemaPath ? ` (schema: ${errors[0].schemaPath})` : '';
		throw new Error(`Invalid Party: ${errorMessage}${errorPath}${schemaPath}`);
	}
	return coerced as unknown as Party;
}

class PersonPartyDataBuilder {
	private _def: Record<string, unknown> = { type: 'person' };

	from(partyValue: Party): this {
		const parsed = parse(partyValue);
		if (parsed.type !== 'person') {
			throw new Error('Party must be of type "person" to use PersonPartyDataBuilder.from');
		}
		this._def = { ...parsed };
		return this;
	}

	fullName(value: string): this {
		this._def.fullName = value;
		return this;
	}

	title(value: string | undefined): this {
		this._def.title = value;
		return this;
	}

	firstName(value: string | undefined): this {
		this._def.firstName = value;
		return this;
	}

	middleName(value: string | undefined): this {
		this._def.middleName = value;
		return this;
	}

	lastName(value: string | undefined): this {
		this._def.lastName = value;
		return this;
	}

	suffix(value: string | undefined): this {
		this._def.suffix = value;
		return this;
	}

	signature(value: string | undefined): this {
		this._def.signature = value;
		return this;
	}

	build(): Party {
		return parse(this._def);
	}
}

class OrganizationPartyDataBuilder {
	private _def: Record<string, unknown> = { type: 'organization' };

	from(partyValue: Party): this {
		const parsed = parse(partyValue);
		if (parsed.type !== 'organization') {
			throw new Error(
				'Party must be of type "organization" to use OrganizationPartyDataBuilder.from',
			);
		}
		this._def = { ...parsed };
		return this;
	}

	name(value: string): this {
		this._def.name = value;
		return this;
	}

	legalName(value: string | undefined): this {
		this._def.legalName = value;
		return this;
	}

	domicile(value: string | undefined): this {
		this._def.domicile = value;
		return this;
	}

	entityType(value: string | undefined): this {
		this._def.entityType = value;
		return this;
	}

	entityId(value: string | undefined): this {
		this._def.entityId = value;
		return this;
	}

	taxId(value: string | undefined): this {
		this._def.taxId = value;
		return this;
	}

	signature(value: string | undefined): this {
		this._def.signature = value;
		return this;
	}

	build(): Party {
		return parse(this._def);
	}
}

type PartyDataAPI = {
	(): PersonPartyDataBuilder;
	(input: Party): Party;
	person(): PersonPartyDataBuilder;
	organization(): OrganizationPartyDataBuilder;
	parse(input: unknown): Party;
	safeParse(
		input: unknown,
	): { success: true; data: Party } | { success: false; error: Error };
};

function partyDataImpl(): PersonPartyDataBuilder;
function partyDataImpl(input: Party): Party;
function partyDataImpl(input?: Party): PersonPartyDataBuilder | Party {
	if (input !== undefined) {
		return parse(input);
	}
	return new PersonPartyDataBuilder();
}

/**
 * Runtime party data builder.
 *
 * Use this to create actual party data that fills a party role at runtime.
 * For defining party roles in a form schema, use `party()` instead.
 *
 * @example
 * ```ts
 * // Create a person party
 * const buyer = partyData.person()
 *   .fullName('John Smith')
 *   .firstName('John')
 *   .lastName('Smith')
 *   .build()
 *
 * // Create an organization party
 * const seller = partyData.organization()
 *   .name('Acme Corp')
 *   .legalName('Acme Corporation Inc.')
 *   .build()
 * ```
 */
export const partyData: PartyDataAPI = Object.assign(partyDataImpl, {
	person: () => new PersonPartyDataBuilder(),
	organization: () => new OrganizationPartyDataBuilder(),
	parse,
	safeParse: (
		input: unknown,
	): { success: true; data: Party } | { success: false; error: Error } => {
		try {
			return { success: true, data: parse(input) };
		} catch (err) {
			return { success: false, error: err as Error };
		}
	},
});
