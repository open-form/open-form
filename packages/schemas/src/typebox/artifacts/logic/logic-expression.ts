import { Type } from '@sinclair/typebox';

/**
 * Logic Expression Schema
 *
 * Defines typed computed values with metadata for the logic section.
 * Supports both scalar types (where value is a single expression string)
 * and object types (where value contains expression strings for each property).
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

// ============================================================================
// Base Schema with Common Metadata
// ============================================================================

const BaseLogicExpressionSchema = Type.Object({
	label: Type.Optional(
		Type.String({
			description: 'Display label for the computed value',
			minLength: 1,
			maxLength: 200,
		}),
	),
	description: Type.Optional(
		Type.String({
			description: 'Description or documentation of the computed value',
			minLength: 1,
			maxLength: 1000,
		}),
	),
});

// Expression string constraints
const ExpressionString = Type.String({
	description: 'Expression string to evaluate',
	minLength: 1,
	maxLength: 2000,
});

const OptionalExpressionString = Type.Optional(ExpressionString);

// ============================================================================
// Scalar Types (value is a single expression string)
// ============================================================================

const BooleanLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('boolean'),
		value: Type.String({
			description: 'Expression that evaluates to a boolean',
			minLength: 1,
			maxLength: 2000,
		}),
	}),
]);

const StringLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('string'),
		value: Type.String({
			description: 'Expression that evaluates to a string',
			minLength: 1,
			maxLength: 2000,
		}),
	}),
]);

const NumberLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('number'),
		value: Type.String({
			description: 'Expression that evaluates to a number',
			minLength: 1,
			maxLength: 2000,
		}),
	}),
]);

const IntegerLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('integer'),
		value: Type.String({
			description: 'Expression that evaluates to an integer',
			minLength: 1,
			maxLength: 2000,
		}),
	}),
]);

const PercentageLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('percentage'),
		value: Type.String({
			description: 'Expression that evaluates to a percentage (0-100)',
			minLength: 1,
			maxLength: 2000,
		}),
	}),
]);

const RatingLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('rating'),
		value: Type.String({
			description: 'Expression that evaluates to a rating value',
			minLength: 1,
			maxLength: 2000,
		}),
	}),
]);

const DateLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('date'),
		value: Type.String({
			description: 'Expression that evaluates to an ISO 8601 date (YYYY-MM-DD)',
			minLength: 1,
			maxLength: 2000,
		}),
	}),
]);

const TimeLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('time'),
		value: Type.String({
			description: 'Expression that evaluates to a time (HH:MM:SS)',
			minLength: 1,
			maxLength: 2000,
		}),
	}),
]);

const DatetimeLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('datetime'),
		value: Type.String({
			description: 'Expression that evaluates to an ISO 8601 datetime',
			minLength: 1,
			maxLength: 2000,
		}),
	}),
]);

const DurationLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('duration'),
		value: Type.String({
			description: 'Expression that evaluates to an ISO 8601 duration string',
			minLength: 1,
			maxLength: 2000,
		}),
	}),
]);

// ============================================================================
// Object Types (value is an object with expression strings for each property)
// ============================================================================

const MoneyLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('money'),
		value: Type.Object(
			{
				amount: ExpressionString,
				currency: ExpressionString,
			},
			{ description: 'Money object with amount and currency expressions' },
		),
	}),
]);

const AddressLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('address'),
		value: Type.Object(
			{
				line1: ExpressionString,
				line2: OptionalExpressionString,
				locality: ExpressionString,
				region: ExpressionString,
				postalCode: ExpressionString,
				country: ExpressionString,
			},
			{ description: 'Address object with component expressions' },
		),
	}),
]);

const PhoneLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('phone'),
		value: Type.Object(
			{
				number: ExpressionString,
				type: OptionalExpressionString,
				extension: OptionalExpressionString,
			},
			{ description: 'Phone object with number and optional type/extension expressions' },
		),
	}),
]);

const CoordinateLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('coordinate'),
		value: Type.Object(
			{
				lat: ExpressionString,
				lon: ExpressionString,
			},
			{ description: 'Coordinate object with latitude and longitude expressions' },
		),
	}),
]);

const BboxLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('bbox'),
		value: Type.Object(
			{
				north: ExpressionString,
				south: ExpressionString,
				east: ExpressionString,
				west: ExpressionString,
			},
			{ description: 'Bounding box with north, south, east, west boundary expressions' },
		),
	}),
]);

const PersonLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('person'),
		value: Type.Object(
			{
				fullName: ExpressionString,
				title: OptionalExpressionString,
				firstName: OptionalExpressionString,
				middleName: OptionalExpressionString,
				lastName: OptionalExpressionString,
				suffix: OptionalExpressionString,
			},
			{ description: 'Person object with name component expressions' },
		),
	}),
]);

const OrganizationLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('organization'),
		value: Type.Object(
			{
				name: ExpressionString,
				legalName: OptionalExpressionString,
				domicile: OptionalExpressionString,
				entityType: OptionalExpressionString,
				entityId: OptionalExpressionString,
				taxId: OptionalExpressionString,
			},
			{ description: 'Organization object with component expressions' },
		),
	}),
]);

const IdentificationLogicExpressionSchema = Type.Intersect([
	BaseLogicExpressionSchema,
	Type.Object({
		type: Type.Literal('identification'),
		value: Type.Object(
			{
				type: ExpressionString,
				number: ExpressionString,
				issuer: OptionalExpressionString,
				issueDate: OptionalExpressionString,
				expiryDate: OptionalExpressionString,
			},
			{ description: 'Identification object with type, number, and optional issuer/date expressions' },
		),
	}),
]);

// ============================================================================
// Discriminated Union
// ============================================================================

/**
 * Logic Expression Union Schema
 *
 * A discriminated union of all supported logic expression types.
 * The `type` property determines which schema variant applies.
 */
export const LogicExpressionSchema = Type.Union(
	[
		// Scalar types
		BooleanLogicExpressionSchema,
		StringLogicExpressionSchema,
		NumberLogicExpressionSchema,
		IntegerLogicExpressionSchema,
		PercentageLogicExpressionSchema,
		RatingLogicExpressionSchema,
		DateLogicExpressionSchema,
		TimeLogicExpressionSchema,
		DatetimeLogicExpressionSchema,
		DurationLogicExpressionSchema,
		// Object types
		MoneyLogicExpressionSchema,
		AddressLogicExpressionSchema,
		PhoneLogicExpressionSchema,
		CoordinateLogicExpressionSchema,
		BboxLogicExpressionSchema,
		PersonLogicExpressionSchema,
		OrganizationLogicExpressionSchema,
		IdentificationLogicExpressionSchema,
	],
	{
		title: 'LogicExpression',
		description:
			'A typed computed value with optional metadata (label, description). The type property determines the expected result type and value schema.',
	},
);

// ============================================================================
// Type Exports for Internal Use
// ============================================================================

/** Scalar logic expression types (value is a string expression) */
export const SCALAR_LOGIC_TYPES = [
	'boolean',
	'string',
	'number',
	'integer',
	'percentage',
	'rating',
	'date',
	'time',
	'datetime',
	'duration',
] as const;

/** Object logic expression types (value is an object with property expressions) */
export const OBJECT_LOGIC_TYPES = [
	'money',
	'address',
	'phone',
	'coordinate',
	'bbox',
	'person',
	'organization',
	'identification',
] as const;

/** All supported logic expression types */
export const ALL_LOGIC_TYPES = [...SCALAR_LOGIC_TYPES, ...OBJECT_LOGIC_TYPES] as const;

export type ScalarLogicType = (typeof SCALAR_LOGIC_TYPES)[number];
export type ObjectLogicType = (typeof OBJECT_LOGIC_TYPES)[number];
export type LogicExpressionType = (typeof ALL_LOGIC_TYPES)[number];
