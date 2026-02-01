import { z } from 'zod';
import { schemaId } from '../../config';
import { ArtifactSchema } from '../shared/base';
import { LogicSectionSchema } from '../logic/logic-section';
import { BundleContentItemSchema } from './item';

// Re-export item schema
export { BundleContentItemSchema } from './item';

/**
 * Bundle artifact — a recursive container for content artifacts.
 */
export const BundleSchema = ArtifactSchema.extend({
	kind: z.literal('bundle'),
	logic: LogicSectionSchema.optional(),
	contents: z.array(BundleContentItemSchema)
		.describe('Ordered bundle contents. Each item has a key and is either an inline artifact, path reference, or registry reference.'),
}).meta({
	id: schemaId('bundle'),
	$schema: 'https://json-schema.org/draft/2020-12/schema',
	title: 'Bundle',
	description: 'A bundle artifact that groups together related artifacts into a single distributable unit. Bundles can contain documents, forms, checklists, and other bundles.',
}).strict();
