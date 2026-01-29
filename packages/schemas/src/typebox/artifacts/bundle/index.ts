import { schemaId } from '../../config';
import { Type } from '@sinclair/typebox';
import { ArtifactSchema } from '../shared/base';
import { BundleContentItemSchema } from './item';

// Re-export item schema
export { BundleContentItemSchema } from './item';

/**
 * Bundle artifact — a recursive container for content artifacts.
 *
 * Bundles group together related artifacts (documents, forms, checklists,
 * and other bundles) into a single distributable unit. They can contain
 * nested bundles for hierarchical organization.
 *
 * @example
 * ```typescript
 * const bundle: Bundle = {
 *   kind: 'bundle',
 *   name: 'loan-application-package',
 *   version: '1.0.0',
 *   title: 'Loan Application Package',
 *   logic: {
 *     requiresW9: 'applicantType == "business"',
 *   },
 *   contents: [
 *     { type: 'path', key: 'application', path: '/forms/loan-application.yaml' },
 *     { type: 'registry', key: 'w9', slug: '@irs/forms/w9@2024', include: 'requiresW9' },
 *   ],
 * }
 * ```
 */
export const BundleSchema = Type.Intersect(
	[
		ArtifactSchema,
		Type.Object({
			kind: Type.Literal('bundle'),
			logic: Type.Optional(Type.Ref('LogicSection')),
			contents: Type.Array(BundleContentItemSchema, {
				description:
					'Ordered bundle contents. Each item has a key and is either an inline artifact, path reference, or registry reference.',
				minItems: 0,
			}),
		}),
	],
	{
		unevaluatedProperties: false,
		$id: schemaId('bundle'),
		$schema: 'https://json-schema.org/draft/2020-12/schema',
		title: 'Bundle',
		description:
			'A bundle artifact that groups together related artifacts into a single distributable unit. Bundles can contain documents, forms, checklists, and other bundles.',
	}
);
