import { Type } from '@sinclair/typebox';

const BaseFieldSchema = Type.Object({
	label: Type.Optional(
		Type.String({
			description: 'Display label for the field',
			minLength: 1,
			maxLength: 200,
		}),
	),
	description: Type.Optional(
		Type.String({
			description: 'Description or help text for the field',
			minLength: 1,
			maxLength: 1000,
		}),
	),
	required: Type.Optional(Type.Ref('CondExpr')),
	visible: Type.Optional(Type.Ref('CondExpr')),
});

const TextFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('text'),
		minLength: Type.Optional(Type.Number({ description: 'Minimum length' })),
		maxLength: Type.Optional(Type.Number({ description: 'Maximum length' })),
		pattern: Type.Optional(
			Type.String({
				description: 'Regular expression pattern for validation',
				minLength: 1,
				maxLength: 500,
			}),
		),
		default: Type.Optional(Type.String({ description: 'Default value' })),
	}),
]);

const BooleanFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('boolean'),
		default: Type.Optional(Type.Boolean({ description: 'Default value' })),
	}),
]);

const NumberFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('number'),
		min: Type.Optional(Type.Number({ description: 'Minimum value' })),
		max: Type.Optional(Type.Number({ description: 'Maximum value' })),
		default: Type.Optional(Type.Number({ description: 'Default value' })),
	}),
]);

const CoordinateFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('coordinate'),
		default: Type.Optional(Type.Ref('Coordinate')),
	}),
]);

const BboxFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('bbox'),
		default: Type.Optional(Type.Ref('Bbox')),
	}),
]);

const MoneyFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('money'),
		min: Type.Optional(Type.Number({ description: 'Minimum amount' })),
		max: Type.Optional(Type.Number({ description: 'Maximum amount' })),
		default: Type.Optional(Type.Ref('Money')),
	}),
]);

const AddressFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('address'),
		default: Type.Optional(Type.Ref('Address')),
	}),
]);

const PhoneFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('phone'),
		default: Type.Optional(Type.Ref('Phone')),
	}),
]);

const DurationFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('duration'),
		default: Type.Optional(Type.Ref('Duration')),
	}),
]);

const EmailFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('email'),
		minLength: Type.Optional(Type.Number({ description: 'Minimum length' })),
		maxLength: Type.Optional(Type.Number({ description: 'Maximum length' })),
		default: Type.Optional(Type.String({ description: 'Default value' })),
	}),
]);

const UuidFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('uuid'),
		minLength: Type.Optional(Type.Number({ description: 'Minimum length' })),
		maxLength: Type.Optional(Type.Number({ description: 'Maximum length' })),
		pattern: Type.Optional(
			Type.String({
				description: 'Regular expression pattern for validation',
				minLength: 1,
				maxLength: 500,
			}),
		),
		default: Type.Optional(Type.String({ description: 'Default value' })),
	}),
]);

const UriFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('uri'),
		minLength: Type.Optional(Type.Number({ description: 'Minimum length' })),
		maxLength: Type.Optional(Type.Number({ description: 'Maximum length' })),
		pattern: Type.Optional(
			Type.String({
				description: 'Regular expression pattern for validation',
				minLength: 1,
				maxLength: 500,
			}),
		),
		default: Type.Optional(Type.String({ description: 'Default value' })),
	}),
]);

const EnumFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('enum'),
		enum: Type.Array(
			Type.Union([Type.String(), Type.Number()]),
			{
				description: 'Array of allowed values for the enum field',
				minItems: 1,
			},
		),
		default: Type.Optional(
			Type.Union([Type.String(), Type.Number()], { description: 'Default value' }),
		),
	}),
]);

// ============================================================================
// New Field Types: Temporal, Entity, Selection, Numeric
// ============================================================================

const DateFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('date'),
		min: Type.Optional(
			Type.String({
				format: 'date',
				description: 'Minimum date (ISO 8601: YYYY-MM-DD)',
			}),
		),
		max: Type.Optional(
			Type.String({
				format: 'date',
				description: 'Maximum date (ISO 8601: YYYY-MM-DD)',
			}),
		),
		default: Type.Optional(Type.String({ format: 'date', description: 'Default value' })),
	}),
]);

const DatetimeFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('datetime'),
		min: Type.Optional(
			Type.String({
				format: 'date-time',
				description: 'Minimum datetime (ISO 8601)',
			}),
		),
		max: Type.Optional(
			Type.String({
				format: 'date-time',
				description: 'Maximum datetime (ISO 8601)',
			}),
		),
		default: Type.Optional(Type.String({ format: 'date-time', description: 'Default value' })),
	}),
]);

const TimeFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('time'),
		min: Type.Optional(Type.String({ description: 'Minimum time (HH:MM:SS)' })),
		max: Type.Optional(Type.String({ description: 'Maximum time (HH:MM:SS)' })),
		default: Type.Optional(Type.String({ description: 'Default value' })),
	}),
]);

const PersonFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('person'),
		default: Type.Optional(Type.Ref('Person')),
	}),
]);

const OrganizationFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('organization'),
		default: Type.Optional(Type.Ref('Organization')),
	}),
]);

const IdentificationFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('identification'),
		allowedTypes: Type.Optional(
			Type.Array(Type.String(), {
				description: 'Allowed ID types (e.g., passport, drivers_license)',
			}),
		),
		default: Type.Optional(Type.Ref('Identification')),
	}),
]);

const MultiselectFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('multiselect'),
		options: Type.Array(Type.Union([Type.String(), Type.Number()]), {
			description: 'Available options',
			minItems: 1,
		}),
		min: Type.Optional(Type.Number({ description: 'Minimum selections required' })),
		max: Type.Optional(Type.Number({ description: 'Maximum selections allowed' })),
		default: Type.Optional(
			Type.Array(Type.Union([Type.String(), Type.Number()]), {
				description: 'Default selected values',
			}),
		),
	}),
]);

const PercentageFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('percentage'),
		min: Type.Optional(Type.Number({ description: 'Minimum value (default: 0)' })),
		max: Type.Optional(Type.Number({ description: 'Maximum value (default: 100)' })),
		precision: Type.Optional(Type.Number({ description: 'Decimal places (default: 2)' })),
		default: Type.Optional(Type.Number({ description: 'Default value' })),
	}),
]);

const RatingFieldSchema = Type.Intersect([
	BaseFieldSchema,
	Type.Object({
		type: Type.Literal('rating'),
		min: Type.Optional(Type.Number({ description: 'Minimum value (default: 1)' })),
		max: Type.Optional(Type.Number({ description: 'Maximum value (default: 5)' })),
		step: Type.Optional(
			Type.Number({ description: 'Increment step (e.g., 0.5 for half stars, default: 1)' }),
		),
		default: Type.Optional(Type.Number({ description: 'Default value' })),
	}),
]);

// Define base field types (non-recursive)
const BaseFieldSchemaTypes = Type.Union([
	TextFieldSchema,
	BooleanFieldSchema,
	NumberFieldSchema,
	CoordinateFieldSchema,
	BboxFieldSchema,
	MoneyFieldSchema,
	AddressFieldSchema,
	PhoneFieldSchema,
	DurationFieldSchema,
	EmailFieldSchema,
	UuidFieldSchema,
	UriFieldSchema,
	EnumFieldSchema,
	// New field types:
	DateFieldSchema,
	DatetimeFieldSchema,
	TimeFieldSchema,
	PersonFieldSchema,
	OrganizationFieldSchema,
	IdentificationFieldSchema,
	MultiselectFieldSchema,
	PercentageFieldSchema,
	RatingFieldSchema,
]);

// FieldsetFieldSchema - a field that contains nested fields (recursive)
// The $id option sets a proper identifier for the recursive reference
export const FieldsetFieldSchema = Type.Recursive(
	(Self) =>
		Type.Intersect([
			BaseFieldSchema,
			Type.Object({
				type: Type.Literal('fieldset'),
				fields: Type.Record(
					Type.String({
						minLength: 1,
						maxLength: 100,
						description: 'Nested field identifier',
					}),
					Type.Union([BaseFieldSchemaTypes, Self]),
				),
			}),
		]),
	{ $id: 'FieldsetField' },
);

// Complete Field union including FieldsetFieldSchema
export const FieldSchema = Type.Union(
	[BaseFieldSchemaTypes, FieldsetFieldSchema],
	{
		title: 'Field',
		description:
			'Single input/data element. Fields are keyed by their identifier and can be of various types (text, number, boolean, address, phone, etc.) or nested fieldsets',
	},
);
