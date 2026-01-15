import { Type } from '@sinclair/typebox';

export const AddressSchema = Type.Object(
	{
		line1: Type.String({
			description: 'Primary address line',
			minLength: 1,
			maxLength: 200,
		}),
		line2: Type.Optional(
			Type.String({
				description: 'Secondary address line',
				minLength: 1,
				maxLength: 200,
			}),
		),
		locality: Type.String({
			description: 'City or locality name',
			minLength: 1,
			maxLength: 200,
		}),
		region: Type.String({
			description: 'State, province, or region name',
			minLength: 1,
			maxLength: 100,
		}),
		postalCode: Type.String({
			description: 'Postal or ZIP code',
			minLength: 3,
			maxLength: 20,
			pattern: '^[A-Z0-9\\s-]+$',
		}),
		country: Type.String({
			description:
				'ISO 3166-1 country code (e.g., "US", "GB", "FRA") or full country name',
			minLength: 2,
			maxLength: 100,
		}),
	},
	{
		title: 'Address',
		description:
			'Physical address with street, locality, region, postal code, and country',
		additionalProperties: false,
	},
);
