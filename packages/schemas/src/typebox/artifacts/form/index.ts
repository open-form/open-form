import { schemaId } from '../../config';
import { Type } from '@sinclair/typebox';
import { ArtifactSchema } from '../shared/base';

// Re-export all form-related schemas
export { FormFieldSchema, FieldsetFieldSchema } from './field';
export { FormFieldsetSchema } from './fieldset';
export { FormAnnexSchema } from './annex';
export { FormPartySchema } from './party';

export const FormSchema = Type.Intersect(
	[
		ArtifactSchema,
		Type.Object({
			kind: Type.Literal('form'),
			logic: Type.Optional(Type.Ref('LogicSection')),
			fields: Type.Optional(
				Type.Record(
					Type.String({
						minLength: 1,
						maxLength: 100,
						description: 'Field identifier',
					}),
					Type.Ref('FormField'),
					{
						description:
							'Form field definitions keyed by field identifier. Fields define the input structure and validation rules for the form',
					},
				),
			),
			layers: Type.Optional(
				Type.Record(
					Type.String({
						minLength: 1,
						maxLength: 100,
						description: 'Layer identifier (user-defined key)',
					}),
					Type.Ref('Layer'),
					{
						description:
							'Named layers for rendering this form into different formats. Keys are user-defined identifiers (e.g., markdown, pdf, html)',
					},
				),
			),
			defaultLayer: Type.Optional(
				Type.String({
					minLength: 1,
					maxLength: 100,
					description:
						'Key of the default layer to use when none specified at render time',
				}),
			),
			allowAdditionalAnnexes: Type.Optional(
				Type.Boolean({
					default: false,
					description:
						'Whether additional ad-hoc annexes can be attached beyond those defined in the annexes record',
				}),
			),
			annexes: Type.Optional(
				Type.Record(
					Type.String({
						minLength: 1,
						maxLength: 100,
						pattern: '^[a-zA-Z0-9][a-zA-Z0-9_-]*$',
						description: 'Annex identifier (e.g., exhibit-a, schedule-1)',
					}),
					Type.Ref('FormAnnex'),
					{
						description:
							'Predefined annex slots keyed by identifier. Each slot can be marked as required (must be filled at runtime) or optional',
					},
				),
			),
			parties: Type.Optional(
				Type.Record(
					Type.String({
						minLength: 1,
						maxLength: 50,
						pattern: '^[a-z][a-z0-9_-]*$',
						description: 'Party role identifier (e.g., buyer, seller, landlord)',
					}),
					Type.Ref('FormParty'),
					{
						description:
							'Party role definitions keyed by role identifier. Each role specifies constraints on who can fill it (person/organization) and signature requirements.',
					},
				),
			),
		}),
	],
	{
		unevaluatedProperties: false,
		$id: schemaId('form'),
		$schema: 'https://json-schema.org/draft/2020-12/schema',
		title: 'Form',
		description:
			'A form artifact that defines a data contract with field definitions, optional layers for rendering, and optional annexes. Forms are the primary artifact type for structured data collection and document generation.',
	},
);
