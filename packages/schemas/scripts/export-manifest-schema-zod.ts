#!/usr/bin/env tsx
/**
 * Export the OpenForm manifest schema to JSON Schema 2020-12 compliant format
 *
 * This script:
 * 1. Exports the ManifestSchema to schemas/manifest.json
 * 2. Uses Zod's z.toJSONSchema() for conversion
 * 3. Outputs to schemas/ folder for upload to schema.open-form.dev
 *
 * Output:
 * - manifest.json ($id: https://schema.open-form.dev/manifest.json)
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCHEMAS_PKG_DIR = join(__dirname, '..');
const OUTPUT_DIR = join(SCHEMAS_PKG_DIR, 'schemas');
const OUTPUT_FILE = join(OUTPUT_DIR, 'manifest.json');
const MANIFEST_SCHEMA_ID = 'https://schema.open-form.dev/manifest.json';

/**
 * Main export function
 */
async function main() {
	console.log('Exporting OpenForm manifest schema to JSON Schema 2020-12...\n');

	try {
		// Import the ManifestSchema
		const { ManifestSchema } = await import('../src/zod/manifest.js');

		// Convert Zod schema to JSON Schema 2020-12
		const rawSchema = z.toJSONSchema(ManifestSchema, {
			target: 'draft-2020-12',
		}) as Record<string, unknown>;

		// Build final schema with proper $schema and $id at the top
		const jsonSchema = {
			$schema: 'https://json-schema.org/draft/2020-12/schema',
			$id: MANIFEST_SCHEMA_ID,
			title: 'OpenForm Project Manifest',
			description: 'Schema for open-form.json project manifest files',
			...rawSchema,
		};

		// Ensure output directory exists
		await mkdir(OUTPUT_DIR, { recursive: true });

		// Write the schema
		await writeFile(OUTPUT_FILE, JSON.stringify(jsonSchema, null, 2), 'utf-8');

		console.log('Done: manifest.json');
		console.log(`  $id: ${MANIFEST_SCHEMA_ID}`);
		console.log('\nManifest schema export complete!');
		console.log('\nUpload schemas/manifest.json to schema.open-form.dev/manifest.json');
	} catch (error) {
		console.error('Failed to export manifest schema:', error);
		process.exit(1);
	}
}

main().catch(console.error);
