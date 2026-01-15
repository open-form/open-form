import { Type } from '@sinclair/typebox';

export const PhoneSchema = Type.Object(
	{
		number: Type.String({
			description:
				'Phone number in E.164 international format (e.g., +14155552671)',
			pattern: '^\\+[1-9]\\d{1,14}$',
			minLength: 8,
			maxLength: 16,
		}),
		type: Type.Optional(
			Type.String({
				description:
					'Type or category of phone number (e.g., mobile, work, home)',
				minLength: 1,
				maxLength: 50,
			}),
		),
		extension: Type.Optional(
			Type.String({
				description: 'Phone extension or extension number',
				minLength: 1,
				maxLength: 20,
			}),
		),
	},
	{
		title: 'Phone',
		description:
			'Phone number in E.164 international format with optional type and extension',
		additionalProperties: false,
	},
);
