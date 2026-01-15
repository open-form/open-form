import { schemaId } from '../config';

import { Type } from '@sinclair/typebox';
import { ArtifactSchema } from './artifact';

/**
 * Document artifact — a static content artifact with no inputs.
 *
 * Documents are used for static content like disclosures, pamphlets,
 * or any content that doesn't require user input. They can have
 * multiple layers for rendering to different formats.
 *
 * @example
 * ```typescript
 * const document: Document = {
 *   kind: 'document',
 *   name: 'lead-paint-disclosure',
 *   version: '1.0.0',
 *   title: 'Lead Paint Disclosure',
 *   layers: {
 *     markdown: {
 *       kind: 'inline',
 *       mimeType: 'text/markdown',
 *       text: '# Lead Paint Disclosure\n\n...',
 *     },
 *     pdf: {
 *       kind: 'file',
 *       mimeType: 'application/pdf',
 *       path: '/templates/lead-paint-disclosure.pdf',
 *     },
 *   },
 *   defaultLayer: 'pdf',
 * }
 * ```
 */
export const DocumentSchema = Type.Intersect(
	[
		ArtifactSchema,
		Type.Object({
			kind: Type.Literal('document'),
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
							'Named layers for rendering this document into different formats. Keys are user-defined identifiers (e.g., markdown, pdf, html)',
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
		$id: schemaId('document'),
		$schema: 'https://json-schema.org/draft/2020-12/schema',
		title: 'Document',
		description:
			'A document artifact representing static content with no inputs. Documents can have multiple layers for rendering to different output formats (e.g., PDF, Markdown, HTML).',
	}
);
