import { Type } from '@sinclair/typebox';

export const AnnexSchema = Type.Object(
	{
		id: Type.String({
			description:
				'Unique identifier for the annex (e.g., exhibit-a, schedule-1)',
			minLength: 1,
			maxLength: 100,
			pattern: '^[a-zA-Z0-9][a-zA-Z0-9_-]*$',
		}),
		title: Type.String({
			description: 'Title or heading for the annex slot',
			minLength: 1,
			maxLength: 200,
		}),
		description: Type.Optional(
			Type.String({
				description: 'Description of what document should be attached',
				minLength: 1,
				maxLength: 1000,
			}),
		),
		required: Type.Optional(Type.Ref('CondExpr')),
		visible: Type.Optional(Type.Ref('CondExpr')),
	},
	{
		title: 'Annex',
		additionalProperties: false,
		description:
			'Defines an annex slot where a document must or may be attached at runtime',
	},
);
