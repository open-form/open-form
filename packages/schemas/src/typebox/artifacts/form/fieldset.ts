import { Type } from '@sinclair/typebox';

// Renamed from FieldsetSchema to FormFieldsetSchema
export const FormFieldsetSchema = Type.Object(
	{
		id: Type.String({
			description: 'Unique identifier for the fieldset (e.g., address-section, personal-info)',
			minLength: 1,
			maxLength: 100,
			pattern: '^[a-zA-Z0-9][a-zA-Z0-9_-]*$',
		}),
		title: Type.Optional(
			Type.String({
				description: 'Title or heading for the fieldset',
				minLength: 1,
				maxLength: 200,
			}),
		),
		description: Type.Optional(
			Type.String({
				description: 'Description or summary of the fieldset',
				minLength: 1,
				maxLength: 1000,
			}),
		),
		fields: Type.Record(
			Type.String({
				minLength: 1,
				maxLength: 100,
				description: 'Field identifier',
			}),
			Type.Ref('FormField'),
		), // FormFieldSchema now includes FieldsetField, so nesting is supported
		required: Type.Optional(
			Type.Boolean({ description: 'Whether fieldset is required' }),
		),
		order: Type.Optional(
			Type.Number({
				description: 'Display order (lower numbers appear first)',
				minimum: 0,
			}),
		),
	},
	{
		title: 'FormFieldset',
		additionalProperties: false,
		description:
			'Grouped collection of fields that can be nested. Fields are keyed by their identifier',
	},
);
