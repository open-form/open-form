import { schemaId } from '../config';

import { Type } from '@sinclair/typebox';
import { ArtifactSchema } from './artifact';

/**
 * Base properties shared by path and registry bundle content items.
 */
const ContentItemBaseSchema = Type.Object({
	key: Type.String({
		description:
			'Unique identifier for this content item, used to reference it in logic expressions',
		minLength: 1,
		maxLength: 100,
		pattern: '^[a-zA-Z][a-zA-Z0-9_-]*$',
	}),
	include: Type.Optional(Type.Ref('CondExpr')),
});

/**
 * Inline content item — artifact defined directly within the bundle.
 *
 * @example
 * ```typescript
 * {
 *   type: 'inline',
 *   key: 'disclosure',
 *   artifact: {
 *     kind: 'document',
 *     name: 'lead-paint-disclosure',
 *     // ...
 *   }
 * }
 * ```
 */
const InlineContentItemSchema = Type.Object(
	{
		type: Type.Literal('inline'),
		key: Type.String({
			description:
				'Unique identifier for this content item, used to reference it in logic expressions',
			minLength: 1,
			maxLength: 100,
			pattern: '^[a-zA-Z][a-zA-Z0-9_-]*$',
		}),
		artifact: Type.Union(
			[
				Type.Ref('Document'),
				Type.Ref('Form'),
				Type.Ref('Checklist'),
				Type.Ref('Bundle'),
			],
			{
				description: 'Inline artifact definition (document, form, checklist, or nested bundle)',
			}
		),
	},
	{ additionalProperties: false }
);

/**
 * Path content item — references an artifact in the same repo by path.
 *
 * @example
 * ```typescript
 * {
 *   type: 'path',
 *   key: 'application-form',
 *   path: '/forms/application.yaml',
 *   include: 'isNewApplicant',
 * }
 * ```
 */
const PathContentItemSchema = Type.Intersect(
	[
		ContentItemBaseSchema,
		Type.Object({
			type: Type.Literal('path'),
			path: Type.String({
				description: 'Absolute path from repo root to the artifact file',
				minLength: 1,
			}),
		}),
	],
	{ unevaluatedProperties: false }
);

/**
 * Registry content item — references a published artifact by slug.
 *
 * @example
 * ```typescript
 * {
 *   type: 'registry',
 *   key: 'w9-form',
 *   slug: '@irs/forms/w9@2024',
 *   include: 'requiresW9',
 * }
 * ```
 */
const RegistryContentItemSchema = Type.Intersect(
	[
		ContentItemBaseSchema,
		Type.Object({
			type: Type.Literal('registry'),
			slug: Type.String({
				description:
					'Resource slug in format @org/repo/resource or @org/repo/resource@version',
				minLength: 1,
			}),
		}),
	],
	{ unevaluatedProperties: false }
);

/**
 * Bundle content item — one of three types:
 * - { type: 'inline', key, artifact } - inline artifact definition
 * - { type: 'path', key, path, include? } - reference by path from repo root
 * - { type: 'registry', key, slug, include? } - reference by registry slug
 */
export const BundleContentItemSchema = Type.Union(
	[InlineContentItemSchema, PathContentItemSchema, RegistryContentItemSchema],
	{
		description:
			'Bundle content item: an inline artifact, path reference, or registry reference with optional include condition',
	}
);

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
