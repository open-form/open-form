#!/usr/bin/env tsx
/**
 * Export the OpenForm registry schemas to JSON Schema 2020-12 compliant format
 *
 * This script:
 * 1. Exports registry-related schemas to schemas/ folder
 * 2. These schemas are NOT included in npm distribution
 * 3. They are uploaded to schema.open-form.dev separately
 *
 * Output:
 * - registry.json ($id: https://schema.open-form.dev/registry.json)
 * - registry-item.json ($id: https://schema.open-form.dev/registry-item.json)
 * - config.json ($id: https://schema.open-form.dev/config.json)
 * - lock.json ($id: https://schema.open-form.dev/lock.json)
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z, type ZodSchema } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCHEMAS_PKG_DIR = join(__dirname, '..');
const OUTPUT_DIR = join(SCHEMAS_PKG_DIR, 'schemas');

const SCHEMA_BASE = 'https://schema.open-form.dev';

interface SchemaExport {
	name: string;
	outputFile: string;
	schemaId: string;
	importPath: string;
	schemaName: string;
}

const SCHEMAS_TO_EXPORT: SchemaExport[] = [
	{
		name: 'Registry Index',
		outputFile: 'registry.json',
		schemaId: `${SCHEMA_BASE}/registry.json`,
		importPath: '../src/zod/registry/registry-index.js',
		schemaName: 'RegistryIndexSchema',
	},
	{
		name: 'Registry Item',
		outputFile: 'registry-item.json',
		schemaId: `${SCHEMA_BASE}/registry-item.json`,
		importPath: '../src/zod/registry/registry-item.js',
		schemaName: 'RegistryItemSchema',
	},
	{
		name: 'Global Config',
		outputFile: 'config.json',
		schemaId: `${SCHEMA_BASE}/config.json`,
		importPath: '../src/zod/registry/global-config.js',
		schemaName: 'GlobalConfigSchema',
	},
	{
		name: 'Lock File',
		outputFile: 'lock.json',
		schemaId: `${SCHEMA_BASE}/lock.json`,
		importPath: '../src/zod/registry/lock.js',
		schemaName: 'LockFileSchema',
	},
];

/**
 * Main export function
 */
async function main() {
	console.log('Exporting OpenForm registry schemas to JSON Schema 2020-12...\n');

	try {
		// Ensure output directory exists
		await mkdir(OUTPUT_DIR, { recursive: true });

		for (const schemaConfig of SCHEMAS_TO_EXPORT) {
			// Dynamically import the schema module
			const module = await import(schemaConfig.importPath);
			const schemaDefinition = module[schemaConfig.schemaName] as ZodSchema;

			if (!schemaDefinition) {
				throw new Error(`${schemaConfig.schemaName} not found in ${schemaConfig.importPath}`);
			}

			// Convert Zod schema to JSON Schema 2020-12
			const rawSchema = z.toJSONSchema(schemaDefinition, {
				target: 'draft-2020-12',
			}) as Record<string, unknown>;

			// Build final schema with proper $schema and $id at the top
			const jsonSchema = {
				$schema: 'https://json-schema.org/draft/2020-12/schema',
				$id: schemaConfig.schemaId,
				...rawSchema,
			};

			// Write the schema
			const outputPath = join(OUTPUT_DIR, schemaConfig.outputFile);
			await writeFile(outputPath, JSON.stringify(jsonSchema, null, 2), 'utf-8');

			console.log(`Done: ${schemaConfig.name} -> ${schemaConfig.outputFile}`);
			console.log(`  $id: ${schemaConfig.schemaId}`);
		}

		console.log('\nRegistry schema export complete!');
		console.log('\nUpload these files to schema.open-form.dev:');
		for (const schema of SCHEMAS_TO_EXPORT) {
			console.log(`  - ${schema.outputFile}`);
		}
	} catch (error) {
		console.error('Failed to export registry schemas:', error);
		process.exit(1);
	}
}

main().catch(console.error);
