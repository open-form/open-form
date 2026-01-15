import { Type, type Static } from '@sinclair/typebox';

/**
 * Logic Section Schema
 *
 * A record of named expressions that can be referenced by CondExpr strings.
 * Keys are expression identifiers, values are expression strings.
 *
 * Example:
 * {
 *   "isBusinessAccount": "fields.accountType.value == 'business'",
 *   "hasValidAge": "fields.age.value >= 18 && fields.age.value <= 120",
 *   "requiresW9": "isBusinessAccount && fields.country.value == 'US'"
 * }
 */
export const LogicSectionSchema = Type.Record(
	Type.String({
		description: 'Logic expression identifier',
		minLength: 1,
		maxLength: 100,
		pattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
	}),
	Type.String({
		description: 'Expression string to evaluate',
		minLength: 1,
		maxLength: 2000,
	}),
	{
		title: 'LogicSection',
		description:
			'Named expressions that can be referenced in conditional expressions',
	},
);

export type LogicSectionRaw = Static<typeof LogicSectionSchema>;

/**
 * A record of named expressions.
 * Keys are expression identifiers, values are expression strings.
 */
export type LogicSection = Record<string, string>;
