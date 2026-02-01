/**
 * Registry Index Schema
 *
 * Defines the schema for registry.json
 * The index file listing all artifacts available in a registry.
 */

import { z } from 'zod';

/**
 * Summary of a registry item (for the index)
 */
export const RegistryItemSummarySchema = z.object({
	name: z.string()
		.min(1)
		.max(128)
		.regex(/^[a-zA-Z0-9][a-zA-Z0-9-_]*$/)
		.describe('Artifact name (unique within registry)'),
	kind: z.union([
		z.literal('form'),
		z.literal('document'),
		z.literal('checklist'),
		z.literal('bundle'),
	]).describe('Artifact kind'),
	version: z.string()
		.regex(/^[0-9]+\.[0-9]+\.[0-9]+/)
		.describe('Semantic version'),
	title: z.string()
		.min(1)
		.max(200)
		.describe('Human-readable title')
		.optional(),
	description: z.string()
		.max(2000)
		.describe('Brief description of the artifact')
		.optional(),
	layers: z.array(z.string().describe('Layer key'))
		.describe('Available layer keys')
		.optional(),
	tags: z.array(
		z.string().min(1).max(50).describe('Tag for categorization'),
	).describe('Tags for search and filtering')
		.optional(),
}).meta({
	title: 'RegistryItemSummary',
	description: 'Summary information about an artifact in the registry',
});

/**
 * Registry index schema for registry.json
 */
export const RegistryIndexSchema = z.object({
	$schema: z.url()
		.describe('JSON Schema URI for validation')
		.optional(),
	name: z.string()
		.min(1)
		.max(100)
		.describe('Registry name/identifier'),
	homepage: z.url()
		.describe('Homepage URL for the registry')
		.optional(),
	description: z.string()
		.max(2000)
		.describe('Description of the registry')
		.optional(),
	artifactsPath: z.string()
		.regex(/^\/[a-zA-Z0-9/_-]*$/)
		.max(100)
		.default('/r')
		.describe('Path prefix for artifact files (e.g., "/r" or "/artifacts"). Defaults to "/r" if not specified.')
		.optional(),
	items: z.array(RegistryItemSummarySchema)
		.describe('List of all artifacts in the registry'),
}).meta({
	id: 'https://schema.open-form.dev/registry.json',
	$schema: 'https://json-schema.org/draft/2020-12/schema',
	title: 'OpenForm Registry Index',
	description: 'Schema for registry.json index file',
}).strict();

/**
 * TypeScript types
 */
export type RegistryItemSummary = z.infer<typeof RegistryItemSummarySchema>;
export type RegistryIndex = z.infer<typeof RegistryIndexSchema>;
