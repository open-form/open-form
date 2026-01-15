import { Type } from '@sinclair/typebox';

export const OrganizationSchema = Type.Object(
	{
		name: Type.String({
			description: 'Organization name',
			minLength: 1,
			maxLength: 200,
		}),
		legalName: Type.Optional(
			Type.String({
				description: 'Legal or registered name of the organization',
				minLength: 1,
				maxLength: 200,
			}),
		),
		domicile: Type.Optional(
			Type.String({
				description: 'Domicile',
				minLength: 1,
				maxLength: 100,
			}),
		),
		entityType: Type.Optional(
			Type.String({
				description: 'Legal entity type of the organization',
				minLength: 1,
				maxLength: 100,
			}),
		),
		entityId: Type.Optional(
			Type.String({
				description: 'Business identification number',
				minLength: 1,
				maxLength: 100,
			}),
		),
		taxId: Type.Optional(
			Type.String({
				description: 'Tax identification number',
				minLength: 1,
				maxLength: 100,
			}),
		),
	},
	{
		title: 'Organization',
		description: 'Organization with legal details and identification',
		// Note: additionalProperties is NOT set here because Organization is used as a
		// component in Party (Intersect). The Party schema uses unevaluatedProperties: false
		// to enforce no additional properties across the entire intersection.
	},
);
