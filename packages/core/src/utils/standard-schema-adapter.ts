import type { StandardSchemaV1 } from '@standard-schema/spec';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { getAllSchemas } from '@/schemas/extract';

// Initialize AJV for runtime validation
const ajv = new Ajv({
	strict: false,
	allErrors: true,
});
addFormats(ajv);

// Add all schemas from $defs to AJV for $ref resolution
const allSchemas = getAllSchemas();
for (const [defsName, schema] of Object.entries(allSchemas)) {
	ajv.addSchema(schema, defsName);
}

/**
 * Preprocess schema to strip absolute URIs that AJV doesn't have meta-schemas for
 */
function stripAbsoluteIds(schema: unknown): unknown {
	if (typeof schema !== 'object' || schema === null) return schema;
	if (Array.isArray(schema)) return schema.map(stripAbsoluteIds);

	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(schema as Record<string, unknown>)) {
		// Skip $schema and $id with absolute URIs
		if (
			(key === '$schema' || key === '$id') &&
			typeof value === 'string' &&
			(value.startsWith('http://') || value.startsWith('https://'))
		) {
			continue;
		}
		result[key] = stripAbsoluteIds(value);
	}
	return result;
}

/**
 * Converts a JSON Schema to a Standard Schema compliant validator
 *
 * This allows JSON Schemas to be used wherever Standard Schema is expected,
 * enabling interoperability with tools that accept Standard Schema validators.
 *
 * @param jsonSchema - The JSON Schema object to wrap
 * @returns A Standard Schema compliant validator
 *
 * @example
 * ```typescript
 * import { toStandardSchema } from './standard-schema-adapter';
 * import { CoordinateJsonSchema } from '@open-form/schemas';
 *
 * const standardSchema = toStandardSchema(CoordinateJsonSchema);
 *
 * // Can now be used with any Standard Schema compatible tool
 * const result = await standardSchema['~standard'].validate({ lat: 40.7128, lon: -74.0060 });
 * ```
 */
export function toStandardSchema<T>(
	jsonSchema: Record<string, unknown>,
): StandardSchemaV1<T, T> {
	const processedSchema = stripAbsoluteIds(jsonSchema) as Record<string, unknown>;
	
	// Check if schema is already compiled (might have been added via getAllSchemas)
	// If it has an $id, try to get it first
	const schemaId = processedSchema.$id as string | undefined;
	let validate: ((data: unknown) => boolean) & { errors?: Array<{ message?: string; instancePath?: string }> };
	
	if (schemaId && ajv.getSchema(schemaId)) {
		validate = ajv.getSchema(schemaId)! as typeof validate;
	} else {
		// Remove $id temporarily to avoid conflicts, compile, then restore
		const originalId = processedSchema.$id;
		delete processedSchema.$id;
		validate = ajv.compile(processedSchema) as typeof validate;
		if (originalId) {
			processedSchema.$id = originalId;
		}
	}

	return {
		'~standard': {
			version: 1,
			vendor: 'open-form',
			validate: (value: unknown) => {
				const valid = validate(value);

				if (valid) {
					return {
						value: value as T,
					};
				}

				// Map AJV validation errors to Standard Schema issues
				const errors = (validate as { errors?: Array<{ message?: string; instancePath?: string }> }).errors || [];
				const issues = errors.map((error: { message?: string; instancePath?: string }) => ({
					message: error.message || 'Validation failed',
					path: error.instancePath
						? error.instancePath.split('/').filter((segment: string) => segment !== '')
						: undefined,
				}));

				return {
					issues,
				};
			},
			types: {} as { input: T; output: T },
		},
	};
}
