import { Type } from '@sinclair/typebox'

/**
 * Common fields shared by all layer types.
 */
const LayerBaseSchema = Type.Object({
	mimeType: Type.String({
		description: 'MIME type of the layer content (e.g., text/markdown, application/pdf)',
		minLength: 1,
		maxLength: 100,
	}),
	title: Type.Optional(
		Type.String({
			description: 'Human-readable title for this layer',
			minLength: 1,
			maxLength: 200,
		})
	),
	description: Type.Optional(
		Type.String({
			description: 'Description of what this layer represents',
			minLength: 1,
			maxLength: 2000,
		})
	),
	checksum: Type.Optional(
		Type.String({
			description: 'SHA-256 checksum for integrity verification',
			pattern: '^sha256:[a-f0-9]{64}$',
			minLength: 1,
			maxLength: 100,
		})
	),
	bindings: Type.Optional(
		Type.Record(
			Type.String({ minLength: 1, maxLength: 100, description: 'Form field name (semantic identifier)' }),
			Type.String({ minLength: 1, maxLength: 500, description: 'Target identifier in the template' }),
			{ description: 'Mapping from form field names to template target identifiers' }
		)
	),
})

/**
 * Inline layer — content embedded directly in the artifact definition.
 *
 * Use for markdown, HTML, or plain text layers where the content
 * is small enough to include inline and doesn't require external files.
 *
 * @example
 * ```typescript
 * const layer: InlineLayer = {
 *   kind: 'inline',
 *   mimeType: 'text/markdown',
 *   text: '# Welcome {{name}}\n\nThank you for your submission.',
 * }
 * ```
 */
const InlineLayerSchema = Type.Intersect(
	[
		LayerBaseSchema,
		Type.Object({
			kind: Type.Literal('inline'),
			text: Type.String({
				description: 'Layer content with interpolation placeholders (e.g., {{fieldName}})',
				minLength: 1,
				maxLength: 1000000,
			}),
		}),
	],
	{
		title: 'InlineLayer',
		description: 'Inline layer with embedded content',
		unevaluatedProperties: false,
	}
)

/**
 * File layer — references an external file by path from repo root.
 *
 * Use for PDF forms, DOCX documents, or other binary/complex layers
 * that are stored as separate files in the repository.
 *
 * @example
 * ```typescript
 * const layer: FileLayer = {
 *   kind: 'file',
 *   mimeType: 'application/pdf',
 *   path: '/templates/w9-2024.pdf',
 *   bindings: {
 *     name: 'topmostSubform[0].Page1[0].f1_01[0]',
 *     tin: 'topmostSubform[0].Page1[0].f1_02[0]',
 *   },
 * }
 * ```
 */
const FileLayerSchema = Type.Intersect(
	[
		LayerBaseSchema,
		Type.Object({
			kind: Type.Literal('file'),
			path: Type.String({
				description: 'Absolute path from repo root to the layer file',
				minLength: 1,
				maxLength: 1000,
			}),
		}),
	],
	{
		title: 'FileLayer',
		description: 'File-backed layer with path reference',
		unevaluatedProperties: false,
	}
)

/**
 * Union of all layer types.
 *
 * Layer is a discriminated union that supports two kinds:
 * - `inline`: Embedded text content (markdown, HTML, plain text)
 * - `file`: Reference to an external file by path from repo root
 *
 * Layers are properties of content artifacts (Document, Form, Checklist),
 * not standalone artifacts. They define how an artifact can be rendered
 * into different output formats.
 */
export const LayerSchema = Type.Union([InlineLayerSchema, FileLayerSchema], {
	title: 'Layer',
	description: 'Layer specification — inline content or file reference',
})
