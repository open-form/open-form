import { coerceTypes } from '@/validators/coerce'
import { validateWitnessRequirement } from '@/validators'
import type { WitnessRequirement } from '@open-form/types'
import { extractSchema } from '@/schemas/extract'

const schema = extractSchema('WitnessRequirement') as Record<string, unknown>

function parse(input: unknown): WitnessRequirement {
	const coerced = coerceTypes(schema, input) as Record<string, unknown>
	if (!validateWitnessRequirement(coerced)) {
		const errors = (validateWitnessRequirement as unknown as { errors: Array<{ message?: string }> }).errors
		throw new Error(`Invalid WitnessRequirement: ${errors?.[0]?.message || 'validation failed'}`)
	}
	return coerced as unknown as WitnessRequirement
}

/**
 * Builder for WitnessRequirement - defines witness requirements for form execution.
 *
 * @example
 * ```ts
 * const witnessReq = witnessRequirement()
 *   .required()
 *   .min(1)
 *   .max(2)
 *   .notarized(false)
 *   .build()
 * ```
 */
class WitnessRequirementBuilder {
	private _def: Record<string, unknown> = {}

	from(value: WitnessRequirement): this {
		const parsed = parse(value)
		this._def = { ...parsed }
		return this
	}

	/**
	 * Set whether witnesses are required
	 */
	required(value: boolean = true): this {
		this._def.required = value
		return this
	}

	/**
	 * Set minimum number of witnesses required
	 */
	min(value: number): this {
		this._def.min = value
		return this
	}

	/**
	 * Set maximum number of witnesses allowed
	 */
	max(value: number): this {
		this._def.max = value
		return this
	}

	/**
	 * Set whether notarization is required
	 */
	notarized(value: boolean = true): this {
		this._def.notarized = value
		return this
	}

	build(): WitnessRequirement {
		// Ensure required has a default value
		if (this._def.required === undefined) {
			this._def.required = true
		}
		return parse(this._def)
	}
}

type WitnessRequirementAPI = {
	(): WitnessRequirementBuilder
	(input: WitnessRequirement): WitnessRequirement
	parse(input: unknown): WitnessRequirement
	safeParse(input: unknown): { success: true; data: WitnessRequirement } | { success: false; error: Error }
}

function witnessRequirementImpl(): WitnessRequirementBuilder
function witnessRequirementImpl(input: WitnessRequirement): WitnessRequirement
function witnessRequirementImpl(input?: WitnessRequirement): WitnessRequirementBuilder | WitnessRequirement {
	if (input !== undefined) {
		return parse(input)
	}
	return new WitnessRequirementBuilder()
}

export const witnessRequirement: WitnessRequirementAPI = Object.assign(witnessRequirementImpl, {
	parse,
	safeParse: (input: unknown): { success: true; data: WitnessRequirement } | { success: false; error: Error } => {
		try {
			return { success: true, data: parse(input) }
		} catch (err) {
			return { success: false, error: err as Error }
		}
	},
})
