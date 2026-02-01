/**
 * Global Config Schema
 *
 * Defines the schema for ~/.open-form/config.json
 * Used to configure registries and default settings at the user level.
 */

import { z } from 'zod';

/**
 * Registry entry with authentication
 */
export const RegistryEntryObjectSchema = z.object({
	url: z.url().describe('Registry base URL'),
	headers: z.record(z.string(), z.string())
		.describe('HTTP headers for authentication (supports ${ENV_VAR} expansion)')
		.optional(),
	params: z.record(z.string(), z.string())
		.describe('Query parameters to include in requests')
		.optional(),
}).meta({
	title: 'RegistryEntryObject',
	description: 'Registry configuration with authentication options',
});

/**
 * Registry entry - either a simple URL string or an object with auth
 */
export const RegistryEntrySchema = z.union([
	z.url().describe('Simple registry URL'),
	RegistryEntryObjectSchema,
]).meta({
	title: 'RegistryEntry',
	description: 'Registry configuration - URL string or object with authentication',
});

/**
 * Default settings for artifact operations
 */
export const GlobalDefaultsSchema = z.object({
	format: z.union([z.literal('json'), z.literal('yaml')])
		.default('yaml')
		.describe('Default output format for artifacts')
		.optional(),
	artifactsDir: z.string()
		.default('artifacts')
		.describe('Default directory for installed artifacts')
		.optional(),
}).meta({
	title: 'GlobalDefaults',
	description: 'Default settings for CLI operations',
});

/**
 * Global config schema for ~/.open-form/config.json
 */
export const GlobalConfigSchema = z.object({
	$schema: z.url()
		.describe('JSON Schema URI for validation')
		.optional(),
	registries: z.record(
		z.string().regex(/^@[a-zA-Z0-9][a-zA-Z0-9-_]*$/).describe('Registry namespace (must start with @)'),
		RegistryEntrySchema,
	).describe('Configured registries by namespace')
		.optional(),
	defaults: GlobalDefaultsSchema.optional(),
}).meta({
	title: 'OpenForm Global Config',
	description: 'Schema for ~/.open-form/config.json global configuration file',
}).strict();

/**
 * TypeScript types
 */
export type RegistryEntryObject = z.infer<typeof RegistryEntryObjectSchema>;
export type RegistryEntry = z.infer<typeof RegistryEntrySchema>;
export type GlobalDefaults = z.infer<typeof GlobalDefaultsSchema>;
export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;
