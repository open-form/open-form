import { schemaId } from '../../config';
import { Type } from '@sinclair/typebox';
import { ArtifactSchema } from '../shared/base';

// Re-export item schema
export { ChecklistItemSchema } from './item';

// --- Checklist artifact (template-time) ---

export const ChecklistSchema = Type.Intersect(
	[
		ArtifactSchema,
		Type.Object({
			kind: Type.Literal('checklist'),
			items: Type.Array(Type.Ref('ChecklistItem'), {
				description:
					'Array of checklist items. Each item represents a task, step, or requirement.',
			}),
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
							'Named layers for rendering this checklist into different formats. Keys are user-defined identifiers (e.g., markdown, pdf, html)',
					}
				)
			),
			defaultLayer: Type.Optional(
				Type.String({
					minLength: 1,
					maxLength: 100,
					description:
						'Key of the default layer to use when none specified at render time',
				})
			),
		}),
	],
	{
		unevaluatedProperties: false,
		$id: schemaId('checklist'),
		$schema: 'https://json-schema.org/draft/2020-12/schema',
		title: 'Checklist',
		description:
			'A checklist artifact containing an ordered list of items to track. Each item may define how its status should be represented at runtime (boolean or enum).',
	},
);
