import { z } from 'zod';

/**
 * Logic Expression Schema
 *
 * Defines typed computed values with metadata for the logic section.
 * Supports both scalar types (where value is a single expression string)
 * and object types (where value contains expression strings for each property).
 */

// ============================================================================
// Base Schema with Common Metadata
// ============================================================================

const BaseLogicExpressionSchema = z.object({
	label: z.string()
		.min(1)
		.max(200)
		.describe('Display label for the computed value')
		.optional(),
	description: z.string()
		.min(1)
		.max(1000)
		.describe('Description or documentation of the computed value')
		.optional(),
});

// Expression string constraints
const ExpressionString = z.string()
	.min(1)
	.max(2000)
	.describe('Expression string to evaluate');

const OptionalExpressionString = ExpressionString.optional();

// ============================================================================
// Scalar Types (value is a single expression string)
// ============================================================================

const BooleanLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('boolean'),
	value: z.string()
		.min(1)
		.max(2000)
		.describe('Expression that evaluates to a boolean'),
});

const StringLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('string'),
	value: z.string()
		.min(1)
		.max(2000)
		.describe('Expression that evaluates to a string'),
});

const NumberLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('number'),
	value: z.string()
		.min(1)
		.max(2000)
		.describe('Expression that evaluates to a number'),
});

const IntegerLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('integer'),
	value: z.string()
		.min(1)
		.max(2000)
		.describe('Expression that evaluates to an integer'),
});

const PercentageLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('percentage'),
	value: z.string()
		.min(1)
		.max(2000)
		.describe('Expression that evaluates to a percentage (0-100)'),
});

const RatingLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('rating'),
	value: z.string()
		.min(1)
		.max(2000)
		.describe('Expression that evaluates to a rating value'),
});

const DateLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('date'),
	value: z.string()
		.min(1)
		.max(2000)
		.describe('Expression that evaluates to an ISO 8601 date (YYYY-MM-DD)'),
});

const TimeLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('time'),
	value: z.string()
		.min(1)
		.max(2000)
		.describe('Expression that evaluates to a time (HH:MM:SS)'),
});

const DatetimeLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('datetime'),
	value: z.string()
		.min(1)
		.max(2000)
		.describe('Expression that evaluates to an ISO 8601 datetime'),
});

const DurationLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('duration'),
	value: z.string()
		.min(1)
		.max(2000)
		.describe('Expression that evaluates to an ISO 8601 duration string'),
});

// ============================================================================
// Object Types (value is an object with expression strings for each property)
// ============================================================================

const MoneyLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('money'),
	value: z.object({
		amount: ExpressionString,
		currency: ExpressionString,
	}).describe('Money object with amount and currency expressions'),
});

const AddressLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('address'),
	value: z.object({
		line1: ExpressionString,
		line2: OptionalExpressionString,
		locality: ExpressionString,
		region: ExpressionString,
		postalCode: ExpressionString,
		country: ExpressionString,
	}).describe('Address object with component expressions'),
});

const PhoneLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('phone'),
	value: z.object({
		number: ExpressionString,
		type: OptionalExpressionString,
		extension: OptionalExpressionString,
	}).describe('Phone object with number and optional type/extension expressions'),
});

const CoordinateLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('coordinate'),
	value: z.object({
		lat: ExpressionString,
		lon: ExpressionString,
	}).describe('Coordinate object with latitude and longitude expressions'),
});

const BboxLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('bbox'),
	value: z.object({
		north: ExpressionString,
		south: ExpressionString,
		east: ExpressionString,
		west: ExpressionString,
	}).describe('Bounding box with north, south, east, west boundary expressions'),
});

const PersonLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('person'),
	value: z.object({
		fullName: ExpressionString,
		title: OptionalExpressionString,
		firstName: OptionalExpressionString,
		middleName: OptionalExpressionString,
		lastName: OptionalExpressionString,
		suffix: OptionalExpressionString,
	}).describe('Person object with name component expressions'),
});

const OrganizationLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('organization'),
	value: z.object({
		name: ExpressionString,
		legalName: OptionalExpressionString,
		domicile: OptionalExpressionString,
		entityType: OptionalExpressionString,
		entityId: OptionalExpressionString,
		taxId: OptionalExpressionString,
	}).describe('Organization object with component expressions'),
});

const IdentificationLogicExpressionSchema = BaseLogicExpressionSchema.extend({
	type: z.literal('identification'),
	value: z.object({
		type: ExpressionString,
		number: ExpressionString,
		issuer: OptionalExpressionString,
		issueDate: OptionalExpressionString,
		expiryDate: OptionalExpressionString,
	}).describe('Identification object with type, number, and optional issuer/date expressions'),
});

// ============================================================================
// Discriminated Union
// ============================================================================

/**
 * Logic Expression Union Schema
 *
 * A discriminated union of all supported logic expression types.
 * The `type` property determines which schema variant applies.
 */
export const LogicExpressionSchema = z.discriminatedUnion('type', [
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
]).meta({
	title: 'LogicExpression',
	description: 'A typed computed value with optional metadata (label, description). The type property determines the expected result type and value schema.',
});

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
