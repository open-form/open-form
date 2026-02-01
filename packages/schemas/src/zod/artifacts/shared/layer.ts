import { z } from 'zod';

/**
 * Common fields shared by all layer types.
 */
const LayerBaseSchema = z.object({
	mimeType: z.string()
		.min(1)
		.max(100)
		.describe('MIME type of the layer content (e.g., text/markdown, application/pdf)'),
	title: z.string()
		.min(1)
		.max(200)
		.describe('Human-readable title for this layer')
		.optional(),
	description: z.string()
		.min(1)
		.max(2000)
		.describe('Description of what this layer represents')
		.optional(),
	checksum: z.string()
		.min(1)
		.max(100)
		.regex(/^sha256:[a-f0-9]{64}$/)
		.describe('SHA-256 checksum for integrity verification')
		.optional(),
	bindings: z.record(
		z.string().min(1).max(100).describe('Form field name (semantic identifier)'),
		z.string().min(1).max(500).describe('Target identifier in the template'),
	).describe('Mapping from form field names to template target identifiers')
		.optional(),
});

/**
 * Inline layer — content embedded directly in the artifact definition.
 */
const InlineLayerSchema = LayerBaseSchema.extend({
	kind: z.literal('inline'),
	text: z.string()
		.min(1)
		.max(1000000)
		.describe('Layer content with interpolation placeholders (e.g., {{fieldName}})'),
}).meta({
	title: 'InlineLayer',
	description: 'Inline layer with embedded content',
}).strict();

/**
 * File layer — references an external file by path from repo root.
 */
const FileLayerSchema = LayerBaseSchema.extend({
	kind: z.literal('file'),
	path: z.string()
		.min(1)
		.max(1000)
		.describe('Absolute path from repo root to the layer file'),
}).meta({
	title: 'FileLayer',
	description: 'File-backed layer with path reference',
}).strict();

/**
 * Union of all layer types.
 */
export const LayerSchema = z.discriminatedUnion('kind', [
	InlineLayerSchema,
	FileLayerSchema,
]).meta({
	title: 'Layer',
	description: 'Layer specification — inline content or file reference',
});
