import { Type } from '@sinclair/typebox';

// Renamed from AnnexSchema to FormAnnexSchema
// This is the design-time annex slot definition, not the runtime attached document
export const FormAnnexSchema = Type.Object(
	{
		title: Type.Optional(
			Type.String({
				description: 'Title or heading for the annex slot',
				minLength: 1,
				maxLength: 200,
			}),
		),
		description: Type.Optional(
			Type.String({
				description: 'Description of what document should be attached',
				minLength: 1,
				maxLength: 1000,
			}),
		),
		required: Type.Optional(Type.Ref('CondExpr')),
		visible: Type.Optional(Type.Ref('CondExpr')),
		order: Type.Optional(
			Type.Number({
				minimum: 0,
				description: 'Display order for rendering',
			}),
		),
	},
	{
		title: 'FormAnnex',
		additionalProperties: false,
		description:
			'Defines an annex slot where a document must or may be attached at runtime',
	},
);
