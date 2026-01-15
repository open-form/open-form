import { Type } from '@sinclair/typebox';

export const MetadataSchema = Type.Record(
	Type.String({
		minLength: 1,
		maxLength: 100,
		pattern: '^[A-Za-z0-9]([A-Za-z0-9]|-[A-Za-z0-9])*$',
		description:
			'Metadata key identifier. Must start with alphanumeric character and can contain alphanumeric characters and hyphens',
	}),
	Type.Union([
		Type.String({
			maxLength: 500,
			description: 'Metadata value as a string (max 500 characters)',
		}),
		Type.Number({ description: 'Metadata value as a number' }),
		Type.Boolean({ description: 'Metadata value as a boolean' }),
		Type.Null({ description: 'Metadata value as null' }),
	]),
	{
		title: 'Metadata',
		description:
			'Custom key-value pairs for storing domain-specific or organizational metadata. Keys must be alphanumeric with hyphens, values can be strings, numbers, booleans, or null',
	},
);
