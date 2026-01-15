import { Type } from '@sinclair/typebox';

export const MoneySchema = Type.Object(
	{
		amount: Type.Number({
			description:
				'Monetary amount in the smallest currency unit (e.g., cents for USD) or as a decimal (e.g., 99.99 for USD). Negative values allowed for debts/credits',
		}),
		currency: Type.String({
			description: 'ISO 4217 alpha-3 currency code (e.g., USD, EUR, GBP)',
			minLength: 3,
			maxLength: 3,
			pattern: '^[A-Z]{3}$',
		}),
	},
	{
		title: 'Money',
		description:
			'Monetary value with currency code. Represents an amount in a specific currency, supporting both positive and negative values',
		additionalProperties: false,
	},
);
