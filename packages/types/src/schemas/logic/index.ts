/**
 * Logic types for conditional expressions and logic sections
 */

/**
 * A conditional expression that can be used in `include`, `required`, `visible` fields.
 * Can be a boolean literal or a string containing a logic expression.
 */
export type CondExpr = boolean | string

/**
 * Logic section for named logic expressions.
 * Keys are expression names, values are the expression strings.
 */
export interface LogicSection {
	/** Named logic expressions that can be referenced in field/annex conditions. */
	[key: string]: string
}
