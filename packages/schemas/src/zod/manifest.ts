/**
 * OpenForm Project Manifest Schema
 *
 * Defines the schema for `open-form.json` files that identify
 * a directory as an OpenForm project.
 */

import { z } from 'zod';

/**
 * Registry entry with authentication options
 */
export const ManifestRegistryEntryObjectSchema = z.object({
	url: z.url().describe('Registry base URL'),
	headers: z.record(z.string(), z.string())
		.describe('HTTP headers for authentication (supports ${ENV_VAR} expansion)')
		.optional(),
	params: z.record(z.string(), z.string())
		.describe('Query parameters to include in requests')
		.optional(),
}).meta({
	title: 'ManifestRegistryEntryObject',
	description: 'Registry configuration with authentication options',
});

/**
 * Registry entry - either a simple URL string or an object with auth
 */
export const ManifestRegistryEntrySchema = z.union([
	z.url().describe('Simple registry URL'),
	ManifestRegistryEntryObjectSchema,
]).meta({
	title: 'ManifestRegistryEntry',
	description: 'Registry configuration - URL string or object with authentication',
});

/**
 * Artifact configuration for the project
 */
export const ManifestArtifactConfigSchema = z.object({
	dir: z.string()
		.min(1)
		.max(256)
		.default('artifacts')
		.describe('Directory for installed artifacts (default: "artifacts")')
		.optional(),
	format: z.union([z.literal('json'), z.literal('yaml')])
		.default('yaml')
		.describe('Default output format for artifacts (default: "yaml")')
		.optional(),
}).meta({
	title: 'ManifestArtifactConfig',
	description: 'Configuration for artifact management',
});

/**
 * Manifest schema for open-form.json project files
 */
export const ManifestSchema = z.object({
	$schema: z.url()
		.describe('JSON Schema URI for validation')
		.optional(),
	name: z.string()
		.regex(/^@[a-z0-9-]+\/[a-z0-9-]+$/)
		.min(3)
		.max(214)
		.describe('Scoped package name (@org/repo-name)'),
	title: z.string()
		.min(1)
		.max(200)
		.describe('Human-readable project title'),
	description: z.string()
		.max(1000)
		.describe('Project description')
		.optional(),
	visibility: z.union([z.literal('public'), z.literal('private')])
		.default('private')
		.describe('Project visibility'),
	registries: z.record(
		z.string().regex(/^@[a-zA-Z0-9][a-zA-Z0-9-_]*$/).describe('Registry namespace (must start with @)'),
		ManifestRegistryEntrySchema,
	).describe('Custom registries for this project (overrides global config)')
		.optional(),
	artifacts: ManifestArtifactConfigSchema.optional(),
}).meta({
	title: 'OpenForm Project Manifest',
	description: 'Schema for open-form.json project manifest files',
}).strict();

/**
 * Manifest Schema Registry
 *
 * Contains all manifest-related schemas with their IDs for proper $ref generation.
 */
export const ManifestSchemaRegistry = z.registry<{
	id?: string;
	title?: string;
	description?: string;
}>();

ManifestSchemaRegistry.add(ManifestRegistryEntryObjectSchema, { id: 'ManifestRegistryEntryObject' });
ManifestSchemaRegistry.add(ManifestRegistryEntrySchema, { id: 'ManifestRegistryEntry' });
ManifestSchemaRegistry.add(ManifestArtifactConfigSchema, { id: 'ManifestArtifactConfig' });
ManifestSchemaRegistry.add(ManifestSchema, { id: 'Manifest' });

/**
 * Manifest registry entry type
 */
export type ManifestRegistryEntry =
	| string
	| {
			url: string;
			headers?: Record<string, string>;
			params?: Record<string, string>;
		};

/**
 * Manifest artifact configuration type
 */
export interface ManifestArtifactConfig {
	dir?: string;
	format?: 'json' | 'yaml';
}

/**
 * TypeScript interface for Manifest (for better DX)
 */
export interface Manifest {
	$schema?: string;
	name: string;
	title: string;
	description?: string;
	visibility: 'public' | 'private';
	registries?: Record<string, ManifestRegistryEntry>;
	artifacts?: ManifestArtifactConfig;
}
