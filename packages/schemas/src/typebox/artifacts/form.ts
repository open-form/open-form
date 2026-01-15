import { schemaId } from '../config';

import { Type } from '@sinclair/typebox';
import { ArtifactSchema } from './artifact';

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
					Type.Ref('Field'),
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
			allowAnnexes: Type.Optional(
				Type.Boolean({
					default: false,
					description:
						'Whether additional ad-hoc annexes can be attached beyond those defined in the annexes array',
				}),
			),
			annexes: Type.Optional(
				Type.Array(Type.Ref('Annex'), {
					minItems: 0,
					description:
						'Predefined annex slots for supplementary documents. Each slot can be marked as required (must be filled at runtime) or optional',
				}),
			),
			parties: Type.Optional(
				Type.Array(Type.Ref('FormParty'), {
					minItems: 0,
					description:
						'Party role definitions. Each role specifies constraints on who can fill it (person/organization) and signature requirements.',
				}),
			),
			witnesses: Type.Optional(Type.Ref('WitnessRequirement')),
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
