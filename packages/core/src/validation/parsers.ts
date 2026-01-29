/**
 * Primitive Parsers
 *
 * Ready-to-use parse functions for all OpenForm primitives.
 * These handle coercion, validation, and error formatting.
 */

import type {
	Address,
	Bbox,
	Coordinate,
	Duration,
	Identification,
	Metadata,
	Money,
	Organization,
	Person,
	Phone,
} from '@open-form/types';
import { extractSchema } from '@open-form/schemas';
import { coerceTypes } from './coerce';
import {
	validateAddress,
	validateBbox,
	validateCoordinate,
	validateDuration,
	validateIdentification,
	validateMetadata,
	validateMoney,
	validateOrganization,
	validatePerson,
	validatePhone,
} from './validators';

type ValidatorFn = ((data: unknown) => boolean) & { errors?: unknown[] };

interface ParserOptions {
	/** Fields that must be finite numbers (not NaN or Infinity) */
	finiteNumbers?: string[];
	/** Fields that must not be NaN */
	noNaN?: string[];
	/** Custom validation after schema validation */
	postValidate?: (data: unknown) => void;
}

/**
 * Extract error message from AJV validator
 */
function getErrorMessage(validator: ValidatorFn): string {
	const firstError = validator.errors?.[0] as { message?: string } | undefined;
	return firstError?.message || 'validation failed';
}

/**
 * Check numeric fields for NaN/Infinity
 */
function checkNumericFields(
	data: Record<string, unknown>,
	typeName: string,
	options: ParserOptions,
): void {
	if (options.finiteNumbers) {
		for (const field of options.finiteNumbers) {
			const value = data[field];
			if (typeof value === 'number') {
				if (isNaN(value)) {
					throw new Error(`Invalid ${typeName}: ${field} must be a valid number`);
				}
				if (!isFinite(value)) {
					throw new Error(`Invalid ${typeName}: ${field} cannot be Infinity`);
				}
			}
		}
	}
	if (options.noNaN) {
		for (const field of options.noNaN) {
			const value = data[field];
			if (typeof value === 'number' && isNaN(value)) {
				throw new Error(`Invalid ${typeName}: ${field} must be a valid number`);
			}
		}
	}
}

/**
 * Factory to create a parser function for a schema-based primitive
 */
function createParser<T>(
	schemaName: string,
	validator: ValidatorFn,
	options: ParserOptions = {},
): (input: unknown) => T {
	// Lazy schema extraction - cached by extractSchema internally
	let schema: Record<string, unknown> | null = null;

	return (input: unknown): T => {
		if (!schema) {
			schema = extractSchema(schemaName) as Record<string, unknown>;
		}

		const coerced = coerceTypes(schema, input) as Record<string, unknown>;

		// Check numeric fields
		checkNumericFields(coerced, schemaName, options);

		// Run AJV validation
		if (!validator(coerced)) {
			throw new Error(`Invalid ${schemaName}: ${getErrorMessage(validator)}`);
		}

		// Run custom post-validation if provided
		if (options.postValidate) {
			options.postValidate(coerced);
		}

		return coerced as unknown as T;
	};
}

// ─────────────────────────────────────────────────────────────
// Primitive Parsers
// ─────────────────────────────────────────────────────────────

export const parseMoney = createParser<Money>('Money', validateMoney, {
	finiteNumbers: ['amount'],
});

export const parseCoordinate = createParser<Coordinate>('Coordinate', validateCoordinate, {
	noNaN: ['lat', 'lon'],
});

export const parseBbox = createParser<Bbox>('Bbox', validateBbox, {
	postValidate: (data) => {
		const bbox = data as Bbox;
		if (bbox.southWest.lat >= bbox.northEast.lat) {
			throw new Error(
				`Invalid Bbox: southWest.lat (${bbox.southWest.lat}) must be less than northEast.lat (${bbox.northEast.lat})`,
			);
		}
		if (bbox.southWest.lon >= bbox.northEast.lon) {
			throw new Error(
				`Invalid Bbox: southWest.lon (${bbox.southWest.lon}) must be less than northEast.lon (${bbox.northEast.lon})`,
			);
		}
	},
});

export const parseAddress = createParser<Address>('Address', validateAddress);

export const parsePerson = createParser<Person>('Person', validatePerson);

export const parseOrganization = createParser<Organization>('Organization', validateOrganization);

export const parsePhone = createParser<Phone>('Phone', validatePhone);

export const parseIdentification = createParser<Identification>(
	'Identification',
	validateIdentification,
);

export const parseMetadata = createParser<Metadata>('Metadata', validateMetadata);

/**
 * Duration parser - no coercion needed, just validation
 */
export function parseDuration(input: unknown): Duration {
	if (!validateDuration(input)) {
		throw new Error(`Invalid Duration: ${getErrorMessage(validateDuration)}`);
	}
	return input as Duration;
}
