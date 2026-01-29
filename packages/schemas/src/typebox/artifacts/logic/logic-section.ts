import { Type } from '@sinclair/typebox';
import { LogicExpressionSchema } from './logic-expression';

/**
 * Logic Section Schema
 *
 * A record of named computed values with type information and metadata.
 * Keys are expression identifiers, values are typed logic expressions.
 *
 * Example:
 * {
 *   "isEligible": {
 *     "type": "boolean",
 *     "label": "Eligibility Status",
 *     "description": "Whether the applicant meets age requirements",
 *     "value": "fields.age.value >= 18"
 *   },
 *   "totalAmount": {
 *     "type": "money",
 *     "label": "Total Amount",
 *     "description": "Quantity times unit price",
 *     "value": {
 *       "amount": "fields.quantity.value * fields.unitPrice.value.amount",
 *       "currency": "fields.unitPrice.value.currency"
 *     }
 *   }
 * }
 */
export const LogicSectionSchema = Type.Record(
	Type.String({
		description: 'Logic expression identifier',
		minLength: 1,
		maxLength: 100,
		pattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
	}),
	LogicExpressionSchema,
	{
		title: 'LogicSection',
		description:
			'Named computed values with type information that can be referenced in conditional expressions',
	},
);
