import { Type } from '@sinclair/typebox';

export const PartySchema = Type.Union(
	[
		Type.Intersect(
			[
				Type.Ref('Person'),
				Type.Object({
					type: Type.Literal('person'),
					signature: Type.Optional(
						Type.String({
							description:
								'Signature identifier or reference (e.g., signature image URI, signature ID)',
							minLength: 1,
							maxLength: 500,
						}),
					),
				}),
			],
			{ unevaluatedProperties: false },
		),
		Type.Intersect(
			[
				Type.Ref('Organization'),
				Type.Object({
					type: Type.Literal('organization'),
					signature: Type.Optional(
						Type.String({
							description:
								'Signature identifier or reference (e.g., signature image URI, signature ID)',
							minLength: 1,
							maxLength: 500,
						}),
					),
				}),
			],
			{ unevaluatedProperties: false },
		),
	],
	{
		title: 'Party',
		description:
			'Party definition: either a person (with full name and optional name components) or an organization (with name and optional legal/entity details). May include an optional signature reference',
	},
);
