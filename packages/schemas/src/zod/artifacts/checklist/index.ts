import { z } from 'zod';
import { schemaId } from '../../config';
import { ArtifactSchema } from '../shared/base';
import { LayerSchema } from '../shared/layer';
import { ChecklistItemSchema } from './item';

// Re-export item schema
export { ChecklistItemSchema } from './item';

export const ChecklistSchema = ArtifactSchema.extend({
	kind: z.literal('checklist'),
	items: z.array(ChecklistItemSchema)
		.describe('Array of checklist items. Each item represents a task, step, or requirement.'),
	layers: z.record(
		z.string()
			.min(1)
			.max(100)
			.describe('Layer identifier (user-defined key)'),
		LayerSchema,
	).describe('Named layers for rendering this checklist into different formats. Keys are user-defined identifiers (e.g., markdown, pdf, html)')
		.optional(),
	defaultLayer: z.string()
		.min(1)
		.max(100)
		.describe('Key of the default layer to use when none specified at render time')
		.optional(),
}).meta({
	id: schemaId('checklist'),
	$schema: 'https://json-schema.org/draft/2020-12/schema',
	title: 'Checklist',
	description: 'A checklist artifact containing an ordered list of items to track. Each item may define how its status should be represented at runtime (boolean or enum).',
}).strict();
