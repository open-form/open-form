import { z } from 'zod';
import { LogicExpressionSchema } from './logic-expression';

/**
 * Logic Section Schema
 *
 * A record of named computed values with type information and metadata.
 * Keys are expression identifiers, values are typed logic expressions.
 */
export const LogicSectionSchema = z.record(
	z.string()
		.min(1)
		.max(100)
		.regex(/^[a-zA-Z][a-zA-Z0-9_]*$/)
		.describe('Logic expression identifier'),
	LogicExpressionSchema,
).meta({
	title: 'LogicSection',
	description: 'Named computed values with type information that can be referenced in conditional expressions',
});
