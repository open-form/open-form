import { Type, type Static } from '@sinclair/typebox';

/**
 * Conditional Expression Schema
 *
 * A CondExpr can be:
 * - A boolean literal (true/false) for static conditions
 * - A string expression that evaluates to boolean at runtime
 *
 * String expressions can be:
 * - A reference to a logic key (e.g., 'isBusinessAccount')
 * - An inline expression (e.g., 'fields.age.value >= 18')
 */
export const CondExprSchema = Type.Union(
	[
		Type.Boolean({ description: 'Literal boolean value' }),
		Type.String({
			description:
				'Expression string - either inline expression or reference to a logic key',
			minLength: 1,
			maxLength: 2000,
		}),
	],
	{
		title: 'CondExpr',
		description: 'Conditional expression: boolean literal or expression string',
	},
);

export type CondExprRaw = Static<typeof CondExprSchema>;

/**
 * A conditional expression that evaluates to boolean.
 * Can be a literal boolean or a string expression.
 */
export type CondExpr = boolean | string;
