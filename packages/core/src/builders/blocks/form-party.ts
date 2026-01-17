import { coerceTypes } from '@/validators/coerce'
import { validateFormParty } from '@/validators'
import type { FormParty, SignatureRequirement } from '@open-form/types'
import { extractSchema } from '@/schemas/extract'
import { type Buildable, resolveBuildable } from '../utils/buildable'

const schema = extractSchema('FormParty') as Record<string, unknown>

function parse(input: unknown): FormParty {
	const coerced = coerceTypes(schema, input) as Record<string, unknown>
	if (!validateFormParty(coerced)) {
		const errors = (validateFormParty as unknown as { errors: Array<{ message?: string }> }).errors
		throw new Error(`Invalid FormParty: ${errors?.[0]?.message || 'validation failed'}`)
	}
	return coerced as unknown as FormParty
}

/**
 * Builder for SignatureRequirement (nested in FormParty)
 */
class SignatureRequirementBuilder {
	private _def: Partial<SignatureRequirement> = {}

	required(value: boolean = true): this {
		this._def.required = value
		return this
	}

	type(value: 'electronic' | 'wet' | 'any'): this {
		this._def.type = value
		return this
	}

	order(value: number): this {
		this._def.order = value
		return this
	}

	build(): SignatureRequirement {
		if (this._def.required === undefined) {
			this._def.required = true
		}
		return this._def as SignatureRequirement
	}
}

/**
 * Builder for party role definitions (design-time).
 *
 * Defines a role that can be filled at runtime (e.g., buyer, seller).
 * The role identifier (key) is set when adding the party to a form via .party(roleId, builder)
 * or .parties({ buyer: builder, seller: builder })
 *
 * At runtime, use `partyData.person()` or `partyData.organization()` to
 * create the actual party data that fills this role.
 *
 * @example
 * ```ts
 * // Definition-time: define the role
 * const buyerRole = party()
 *   .label('Buyer')
 *   .partyType('any')
 *   .signature(sig => sig.required().order(2))
 *   .build()
 *
 * // Add to form with role identifier
 * form.party('buyer', buyerRole)
 *
 * // Runtime: fill the role with actual data
 * const buyerData = partyData.person().fullName('John Smith').build()
 * ```
 */
class PartyBuilder {
	private _def: Record<string, unknown> = {}

	from(value: FormParty): this {
		const parsed = parse(value)
		this._def = { ...parsed }
		return this
	}

	/**
	 * Set the display label for this role
	 */
	label(value: string): this {
		this._def.label = value
		return this
	}

	/**
	 * Set an optional description for this role
	 */
	description(value: string): this {
		this._def.description = value
		return this
	}

	/**
	 * Constrain what type of party can fill this role
	 */
	partyType(value: 'person' | 'organization' | 'any'): this {
		this._def.partyType = value
		return this
	}

	/**
	 * Allow multiple parties to fill this role
	 */
	multiple(value: boolean = true): this {
		this._def.multiple = value
		return this
	}

	/**
	 * Set minimum number of parties required (when multiple=true)
	 */
	min(value: number): this {
		this._def.min = value
		return this
	}

	/**
	 * Set maximum number of parties allowed (when multiple=true)
	 */
	max(value: number): this {
		this._def.max = value
		return this
	}

	/**
	 * Set whether this role is required (can be boolean or condition expression)
	 */
	required(value: boolean | string = true): this {
		this._def.required = value
		return this
	}

	/**
	 * Set signature requirements using a builder callback or object
	 */
	signature(value: Buildable<SignatureRequirement> | ((builder: SignatureRequirementBuilder) => SignatureRequirementBuilder)): this {
		if (typeof value === 'function') {
			this._def.signature = value(new SignatureRequirementBuilder()).build()
		} else {
			this._def.signature = resolveBuildable(value)
		}
		return this
	}

	build(): FormParty {
		return parse(this._def)
	}
}

type PartyAPI = {
	(): PartyBuilder
	(input: FormParty): FormParty
	parse(input: unknown): FormParty
	safeParse(input: unknown): { success: true; data: FormParty } | { success: false; error: Error }
	signature(): SignatureRequirementBuilder
}

function partyImpl(): PartyBuilder
function partyImpl(input: FormParty): FormParty
function partyImpl(input?: FormParty): PartyBuilder | FormParty {
	if (input !== undefined) {
		return parse(input)
	}
	return new PartyBuilder()
}

/**
 * Definition-time party role builder.
 *
 * Use this to define party roles when creating a form schema.
 * At runtime, use `partyData.person()` or `partyData.organization()` to fill roles.
 */
export const party: PartyAPI = Object.assign(partyImpl, {
	parse,
	safeParse: (input: unknown): { success: true; data: FormParty } | { success: false; error: Error } => {
		try {
			return { success: true, data: parse(input) }
		} catch (err) {
			return { success: false, error: err as Error }
		}
	},
	signature: () => new SignatureRequirementBuilder(),
})

// Keep formParty as an alias for backwards compatibility
export const formParty = party
