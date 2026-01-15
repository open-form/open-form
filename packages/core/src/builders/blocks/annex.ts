import { coerceTypes } from '@/validators/coerce'
import { validateAnnex } from '@/validators'
import { type Annex } from '@open-form/types'
import { extractSchema } from '@/schemas/extract'
import type { CondExpr } from '@/logic'

const schema = extractSchema('Annex') as Record<string, unknown>

function parse(input: unknown): Annex {
	const coerced = coerceTypes(schema, input) as Record<string, unknown>
	if (!validateAnnex(coerced)) {
		const errors = (validateAnnex as unknown as { errors: Array<{ message?: string }> }).errors
		throw new Error(`Invalid Annex: ${errors?.[0]?.message || 'validation failed'}`)
	}
	return coerced as unknown as Annex
}

/**
 * Builder for Annex - design-time annex slot definitions.
 *
 * Annex defines a slot for supplementary documents that can be attached to a form.
 *
 * @example
 * ```ts
 * const photoIdAnnex = annex()
 *   .id('photoId')
 *   .title('Photo ID')
 *   .description('Upload a government-issued photo ID')
 *   .required(true)
 *   .build()
 * ```
 */
class AnnexBuilder {
	private _def: Record<string, unknown> = {}

	from(annexValue: Annex): this {
		this._def = { ...parse(annexValue) }
		return this
	}

	/**
	 * Set the annex identifier (slug format)
	 */
	id(value: string): this {
		this._def.id = value
		return this
	}

	/**
	 * Set the display title for this annex slot
	 */
	title(value: string): this {
		this._def.title = value
		return this
	}

	/**
	 * Set an optional description for this annex
	 */
	description(value: string): this {
		this._def.description = value
		return this
	}

	/**
	 * Sets whether the annex is required.
	 * @param value - Boolean or expression string. Defaults to true.
	 */
	required(value: CondExpr = true): this {
		this._def.required = value
		return this
	}

	/**
	 * Sets whether the annex is visible.
	 * @param value - Boolean or expression string. Defaults to true.
	 */
	visible(value: CondExpr = true): this {
		this._def.visible = value
		return this
	}

	build(): Annex {
		return parse(this._def)
	}
}

type AnnexAPI = {
	(): AnnexBuilder
	(input: Annex): Annex
	parse(input: unknown): Annex
	safeParse(input: unknown): { success: true; data: Annex } | { success: false; error: Error }
}

function annexImpl(): AnnexBuilder
function annexImpl(input: Annex): Annex
function annexImpl(input?: Annex): AnnexBuilder | Annex {
	if (input !== undefined) {
		return parse(input)
	}
	return new AnnexBuilder()
}

export const annex: AnnexAPI = Object.assign(annexImpl, {
	parse,
	safeParse: (input: unknown): { success: true; data: Annex } | { success: false; error: Error } => {
		try {
			return { success: true, data: parse(input) }
		} catch (err) {
			return { success: false, error: err as Error }
		}
	},
})
