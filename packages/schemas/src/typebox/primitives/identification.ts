import { Type } from '@sinclair/typebox';

export const IdentificationSchema = Type.Object(
	{
		type: Type.String({
			description:
				'Type of identification document (e.g., ssn, passport, license, ein)',
			minLength: 1,
			maxLength: 50,
		}),
		number: Type.String({
			description: 'Identification number or identifier',
			minLength: 1,
			maxLength: 100,
		}),
		issuer: Type.Optional(
			Type.String({
				description: 'Issuing authority, country, or state (e.g., US, CA, DMV)',
				minLength: 1,
				maxLength: 100,
			}),
		),
		issueDate: Type.Optional(
			Type.String({
				format: 'date',
				description: 'Issue date in ISO 8601 format (YYYY-MM-DD)',
				minLength: 10,
				maxLength: 10,
			}),
		),
		expiryDate: Type.Optional(
			Type.String({
				format: 'date',
				description: 'Expiry date in ISO 8601 format (YYYY-MM-DD)',
				minLength: 10,
				maxLength: 10,
			}),
		),
	},
	{
		title: 'Identification',
		description:
			'Identification document with type, number, issuer, and optional issue and expiry dates',
		additionalProperties: false,
	},
);
