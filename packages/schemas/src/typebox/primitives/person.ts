import { Type } from '@sinclair/typebox';

export const PersonSchema = Type.Object(
	{
		fullName: Type.String({
			description: "Person's full name (complete name as a single string)",
			minLength: 1,
			maxLength: 200,
		}),
		title: Type.Optional(
			Type.String({
				description: 'Name prefix or title (e.g., Mr., Mrs., Dr., Prof.)',
				minLength: 1,
				maxLength: 50,
			}),
		),
		firstName: Type.Optional(
			Type.String({
				description: "Person's first or given name",
				minLength: 1,
				maxLength: 100,
			}),
		),
		middleName: Type.Optional(
			Type.String({
				description: "Person's middle name or initial",
				minLength: 1,
				maxLength: 100,
			}),
		),
		lastName: Type.Optional(
			Type.String({
				description: "Person's last name or surname",
				minLength: 1,
				maxLength: 100,
			}),
		),
		suffix: Type.Optional(
			Type.String({
				description: 'Name suffix (e.g., Jr., Sr., III, Esq.)',
				minLength: 1,
				maxLength: 50,
			}),
		),
	},
	{
		title: 'Person',
		description:
			'Person with full name (required) and optional name components (title, first name, middle name, last name, suffix)',
		// Note: additionalProperties is NOT set here because Person is used as a
		// component in Party (Intersect). The Party schema uses unevaluatedProperties: false
		// to enforce no additional properties across the entire intersection.
	},
);
