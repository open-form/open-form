#!/usr/bin/env tsx
/**
 * Export the root OpenForm schema to JSON Schema 2020-12 compliant format
 *
 * This script:
 * 1. Generates both "latest" and "versioned" bundles
 * 2. Uses Zod's z.toJSONSchema() to convert individual schemas
 * 3. Composes them into a bundled schema with $defs
 * 4. Outputs to schemas/ folder for upload to schema.open-form.dev
 *
 * Output structure (for schema.open-form.dev):
 * - schema.json ($id: https://schema.open-form.dev/schema.json)
 * - {version}.json ($id: https://schema.open-form.dev/{version}.json)
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z, type ZodSchema } from 'zod';
import {
	SCHEMA_VERSION,
	SCHEMA_ROOT_ID,
	SCHEMA_VERSIONED_ID,
} from '../src/zod/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCHEMAS_PKG_DIR = join(__dirname, '..');
const OUTPUT_DIR = join(SCHEMAS_PKG_DIR, 'schemas');

/**
 * Transform bare $ref values to JSON Pointer format (#/$defs/Name)
 * @param obj - The schema object to transform
 * @param knownDefs - Set of known definition names
 * @param currentDefName - The name of the current definition (for self-reference resolution)
 */
function transformRefsToPointer(obj: unknown, knownDefs: Set<string>, currentDefName?: string): unknown {
	if (typeof obj !== 'object' || obj === null) return obj;
	if (Array.isArray(obj)) return obj.map((item) => transformRefsToPointer(item, knownDefs, currentDefName));

	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(obj)) {
		if (key === '$ref' && typeof value === 'string') {
			// Handle self-reference (#) by transforming to the current definition
			if (value === '#' && currentDefName) {
				result[key] = `#/$defs/${currentDefName}`;
			// If it's a bare name that matches a known definition, transform to JSON Pointer
			} else if (knownDefs.has(value)) {
				result[key] = `#/$defs/${value}`;
			} else if (value.startsWith('#/$defs/')) {
				// Already in correct format
				result[key] = value;
			} else {
				result[key] = value;
			}
		} else {
			result[key] = transformRefsToPointer(value, knownDefs, currentDefName);
		}
	}
	return result;
}

/**
 * Clean schema properties that shouldn't be in $defs entries
 */
function cleanDefEntry(schema: Record<string, unknown>): Record<string, unknown> {
	const { $schema, $id, id, ...rest } = schema;
	return rest;
}

/**
 * Generate the bundled JSON Schema using Zod
 */
async function generateBundledSchema(schemaId: string, isLatest: boolean): Promise<Record<string, unknown>> {
	// Import all schemas from module
	const module = await import('../src/zod/module.js');

	// Registry schema names for ordering
	const schemaOrder = [
		'FormSchema',
		'DocumentSchema',
		'BundleSchema',
		'ChecklistSchema',
		'BundleContentItemSchema',
		'ChecklistItemSchema',
		'FormFieldSchema',
		'FieldsetFieldSchema',
		'FormAnnexSchema',
		'FormPartySchema',
		'FormFieldsetSchema',
		'LayerSchema',
		'AddressSchema',
		'AttachmentSchema',
		'BboxSchema',
		'CoordinateSchema',
		'DurationSchema',
		'IdentificationSchema',
		'MoneySchema',
		'MetadataSchema',
		'OrganizationSchema',
		'PersonSchema',
		'PhoneSchema',
		'SignatureSchema',
		'CondExprSchema',
		'LogicSectionSchema',
	];

	// Collect all schemas to export
	const schemas: Array<{ name: string; exportName: string; schema: ZodSchema }> = [];
	const moduleRecord = module as Record<string, unknown>;
	for (const exportName of schemaOrder) {
		const schemaValue = moduleRecord[exportName];
		if (schemaValue && typeof schemaValue === 'object') {
			const baseName = exportName.replace(/Schema$/, '');
			schemas.push({
				name: baseName,
				exportName,
				schema: schemaValue as ZodSchema,
			});
		}
	}

	// Generate $defs
	const $defs: Record<string, Record<string, unknown>> = {};
	const defNames = new Set(schemas.map((s) => s.name));

	for (const { name, schema } of schemas) {
		const rawSchema = z.toJSONSchema(schema, {
			target: 'draft-2020-12',
		}) as Record<string, unknown>;

		// Clean and transform the schema, passing the current name for self-reference resolution
		const cleanedSchema = cleanDefEntry(rawSchema);
		const transformedSchema = transformRefsToPointer(cleanedSchema, defNames, name) as Record<string, unknown>;

		$defs[name] = transformedSchema;
	}

	// Generate the OpenForm union schema for the root $ref
	const openFormSchema = module.OpenFormSchema as ZodSchema;
	const rawOpenFormSchema = z.toJSONSchema(openFormSchema, {
		target: 'draft-2020-12',
	}) as Record<string, unknown>;

	// Clean and transform the OpenForm schema
	const cleanedOpenForm = cleanDefEntry(rawOpenFormSchema);
	const transformedOpenForm = transformRefsToPointer(cleanedOpenForm, defNames) as Record<string, unknown>;

	// Add OpenForm to $defs
	$defs['OpenForm'] = transformedOpenForm;

	// Build the final bundled schema
	const description = isLatest
		? 'OpenForm JSON Schema specification (latest version)'
		: `OpenForm JSON Schema specification version ${SCHEMA_VERSION}`;

	return {
		$schema: 'https://json-schema.org/draft/2020-12/schema',
		$id: schemaId,
		title: 'OpenForm Schema',
		description,
		$ref: '#/$defs/OpenForm',
		$defs,
	};
}

/**
 * Main export function
 */
async function main() {
	console.log('Exporting OpenForm schemas to JSON Schema 2020-12...\n');

	try {
		// Ensure output directory exists
		await mkdir(OUTPUT_DIR, { recursive: true });

		// Generate latest bundle (schema.json)
		const latestSchema = await generateBundledSchema(SCHEMA_ROOT_ID, true);
		const latestPath = join(OUTPUT_DIR, 'schema.json');
		await writeFile(latestPath, JSON.stringify(latestSchema, null, 2), 'utf-8');
		console.log(`Done: Latest bundle -> schema.json`);
		console.log(`  $id: ${SCHEMA_ROOT_ID}`);

		// Generate versioned bundle ({version}.json)
		const versionedSchema = await generateBundledSchema(SCHEMA_VERSIONED_ID, false);
		const versionedPath = join(OUTPUT_DIR, `${SCHEMA_VERSION}.json`);
		await writeFile(versionedPath, JSON.stringify(versionedSchema, null, 2), 'utf-8');
		console.log(`Done: Versioned bundle -> ${SCHEMA_VERSION}.json`);
		console.log(`  $id: ${SCHEMA_VERSIONED_ID}`);

		console.log('\nBundle export complete!');
		console.log(`\nUpload contents of ${relative(SCHEMAS_PKG_DIR, OUTPUT_DIR)}/ to schema.open-form.dev`);
	} catch (error) {
		console.error('Failed to export OpenForm schema:', error);
		process.exit(1);
	}
}

main().catch(console.error);
