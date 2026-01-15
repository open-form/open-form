import { describe, test, expect } from 'vitest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {
	compile,
	compileToJsonSchema,
	type FieldToDataType,
	type FieldsToDataType,
	type InferFormData,
} from '@/utils';
import type { NumberField, TextField, EnumField, MoneyField } from '@open-form/types';
import type { Form } from '@open-form/types';

// Initialize AJV for testing compiled schemas
const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);

// Helper function to validate data against compiled schema
function check(schema: Record<string, unknown>, data: unknown): boolean {
	const validate = ajv.compile(schema);
	return validate(data);
}

describe('compile utility', () => {
	describe('compile() - basic functionality', () => {
		test('compiles form with no fields', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'empty-form',
				title: 'Empty Form',
			};

			const schema = compile(form);

			expect(schema).toBeDefined();
			expect(schema).toHaveProperty('properties');
			expect(schema.properties).toHaveProperty('fields');
			// annexes is always present as optional for backwards compatibility
			expect(schema.properties).toHaveProperty('annexes');
			// But annexes should not be in the required array when no annexes are defined
			expect(schema.required).not.toContain('annexes');
		});

		test('compiles form with text fields', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'text-form',
				title: 'Text Form',
				fields: {
					firstName: { type: 'text', label: 'First Name' },
					lastName: { type: 'text', label: 'Last Name', required: true },
				},
			};

			const schema = compile(form) as Record<string, unknown>;

			// Validate that firstName is optional
			const validDataWithoutFirstName = {
				fields: { lastName: 'Doe' },
			};
			expect(check(schema, validDataWithoutFirstName)).toBe(true);

			// Validate that lastName is required
			const invalidDataWithoutLastName = {
				fields: { firstName: 'John' },
			};
			expect(check(schema, invalidDataWithoutLastName)).toBe(false);
		});

		test('compiles form with various field types', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'multi-type-form',
				title: 'Multi Type Form',
				fields: {
					name: { type: 'text', label: 'Name', required: true },
					age: { type: 'number', label: 'Age', min: 0, max: 120 } as NumberField,
					isActive: { type: 'boolean', label: 'Active' },
					email: { type: 'email', label: 'Email' },
				},
			};

			const schema = compile(form) as Record<string, unknown>;

			const validData = {
				fields: {
					name: 'John Doe',
					age: 25,
					isActive: true,
					email: 'john@example.com',
				},
			};

			expect(check(schema, validData)).toBe(true);
		});
	});

	describe('field type compilation', () => {
		test('compiles text field with constraints', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'text-constrained',
				title: 'Text Constrained',
				fields: {
					username: {
						type: 'text',
						label: 'Username',
						minLength: 3,
						maxLength: 20,
						pattern: '^[a-z0-9_-]+$',
						required: true,
					} as TextField,
				},
			};

			const schema = compile(form) as Record<string, unknown>;

			// Valid username
			expect(
				check(schema, {
					fields: { username: 'john_doe' },
				}),
			).toBe(true);

			// Too short
			expect(
				check(schema, {
					fields: { username: 'jo' },
				}),
			).toBe(false);

			// Too long
			expect(
				check(schema, {
					fields: { username: 'a'.repeat(21) },
				}),
			).toBe(false);

			// Invalid pattern
			expect(
				check(schema, {
					fields: { username: 'JOHN_DOE' },
				}),
			).toBe(false);
		});

		test('compiles number field with min/max', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'number-form',
				title: 'Number Form',
				fields: {
					age: {
						type: 'number',
						label: 'Age',
						min: 0,
						max: 120,
						required: true,
					} as NumberField,
				},
			};

			const schema = compile(form) as Record<string, unknown>;

			// Valid age
			expect(check(schema, { fields: { age: 25 } })).toBe(true);

			// Too low
			expect(check(schema, { fields: { age: -1 } })).toBe(false);

			// Too high
			expect(check(schema, { fields: { age: 121 } })).toBe(false);
		});

		test('compiles boolean field', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'boolean-form',
				title: 'Boolean Form',
				fields: {
					accepted: { type: 'boolean', label: 'Accepted', required: true },
				},
			};

			const schema = compile(form) as Record<string, unknown>;

			expect(check(schema, { fields: { accepted: true } })).toBe(true);
			expect(check(schema, { fields: { accepted: false } })).toBe(true);
			expect(check(schema, { fields: { accepted: 'yes' } })).toBe(false);
		});

		test('compiles coordinate field', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'coordinate-form',
				title: 'Coordinate Form',
				fields: {
					location: { type: 'coordinate', label: 'Location', required: true },
				},
			};

			const schema = compile(form) as Record<string, unknown>;

			// Valid coordinate
			expect(
				check(schema, {
					fields: { location: { lat: 40.7128, lon: -74.006 } },
				}),
			).toBe(true);

			// Invalid lat (out of range)
			expect(
				check(schema, {
					fields: { location: { lat: 100, lon: -74.006 } },
				}),
			).toBe(false);

			// Invalid lon (out of range)
			expect(
				check(schema, {
					fields: { location: { lat: 40.7128, lon: -200 } },
				}),
			).toBe(false);
		});

		test('compiles bbox field', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'bbox-form',
				title: 'BBox Form',
				fields: {
					area: { type: 'bbox', label: 'Area', required: true },
				},
			};

			const schema = compile(form) as Record<string, unknown>;

			// Valid bbox
			expect(
				check(schema, {
					fields: {
						area: {
							southWest: { lat: 40.0, lon: -75.0 },
							northEast: { lat: 41.0, lon: -74.0 },
						},
					},
				}),
			).toBe(true);

			// Missing northEast
			expect(
				check(schema, {
					fields: {
						area: {
							southWest: { lat: 40.0, lon: -75.0 },
						},
					},
				}),
			).toBe(false);
		});

		test('compiles money field', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'money-form',
				title: 'Money Form',
				fields: {
					price: {
						type: 'money',
						label: 'Price',
						min: 0,
						max: 10000,
						required: true,
					} as MoneyField,
				},
			};

			const schema = compile(form) as Record<string, unknown>;

			// Valid money
			expect(
				check(schema, {
					fields: { price: { amount: 99.99, currency: 'USD' } },
				}),
			).toBe(true);

			// Invalid currency (wrong length)
			expect(
				check(schema, {
					fields: { price: { amount: 99.99, currency: 'US' } },
				}),
			).toBe(false);

			// Out of range
			expect(
				check(schema, {
					fields: { price: { amount: 10001, currency: 'USD' } },
				}),
			).toBe(false);
		});

		test('compiles address field', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'address-form',
				title: 'Address Form',
				fields: {
					address: { type: 'address', label: 'Address', required: true },
				},
			};

			const schema = compile(form) as Record<string, unknown>;

			// Valid address
			expect(
				check(schema, {
					fields: {
						address: {
							line1: '123 Main St',
							locality: 'New York',
							region: 'NY',
							postalCode: '10001',
							country: 'US',
						},
					},
				}),
			).toBe(true);

			// Valid with optional line2
			expect(
				check(schema, {
					fields: {
						address: {
							line1: '123 Main St',
							line2: 'Apt 4B',
							locality: 'New York',
							region: 'NY',
							postalCode: '10001',
							country: 'US',
						},
					},
				}),
			).toBe(true);

			// Missing required field
			expect(
				check(schema, {
					fields: {
						address: {
							line1: '123 Main St',
							locality: 'New York',
							region: 'NY',
							country: 'US',
						},
					},
				}),
			).toBe(false);
		});

		test('compiles phone field', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'phone-form',
				title: 'Phone Form',
				fields: {
					phone: { type: 'phone', label: 'Phone', required: true },
				},
			};

			const schema = compile(form) as Record<string, unknown>;

			// Valid E.164 phone
			expect(
				check(schema, {
					fields: { phone: { number: '+12025551234' } },
				}),
			).toBe(true);

			// Valid with type
			expect(
				check(schema, {
					fields: { phone: { number: '+12025551234', type: 'mobile' } },
				}),
			).toBe(true);

			// Invalid format (missing +)
			expect(
				check(schema, {
					fields: { phone: { number: '12025551234' } },
				}),
			).toBe(false);
		});

		test('compiles duration field', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'duration-form',
				title: 'Duration Form',
				fields: {
					duration: { type: 'duration', label: 'Duration', required: true },
				},
			};

			const schema = compile(form) as Record<string, unknown>;

			// Valid ISO 8601 duration
			expect(
				check(schema, {
					fields: { duration: 'P1Y2M3DT4H5M6S' },
				}),
			).toBe(true);

			expect(check(schema, { fields: { duration: 'P1D' } })).toBe(true);

			// Invalid duration
			expect(
				check(schema, {
					fields: { duration: '1 year' },
				}),
			).toBe(false);
		});

		test('compiles enum field', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'enum-form',
				title: 'Enum Form',
				fields: {
					status: {
						type: 'enum',
						label: 'Status',
						enum: ['active', 'inactive', 'pending'],
						required: true,
					} as EnumField,
				},
			};

			const schema = compile(form) as Record<string, unknown>;

			// Valid enum values
			expect(check(schema, { fields: { status: 'active' } })).toBe(true);
			expect(check(schema, { fields: { status: 'inactive' } })).toBe(true);

			// Invalid enum value
			expect(check(schema, { fields: { status: 'completed' } })).toBe(false);
		});

		test('compiles fieldset (nested fields)', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'fieldset-form',
				title: 'Fieldset Form',
				fields: {
					personal: {
						type: 'fieldset',
						label: 'Personal Info',
						fields: {
							firstName: { type: 'text', label: 'First Name', required: true },
							lastName: { type: 'text', label: 'Last Name', required: true },
							age: { type: 'number', label: 'Age' },
						},
						required: true,
					},
				},
			};

			const schema = compile(form) as Record<string, unknown>;

			// Valid nested data
			expect(
				check(schema, {
					fields: {
						personal: {
							firstName: 'John',
							lastName: 'Doe',
							age: 30,
						},
					},
				}),
			).toBe(true);

			// Missing required nested field
			expect(
				check(schema, {
					fields: {
						personal: {
							firstName: 'John',
						},
					},
				}),
			).toBe(false);
		});
	});

	describe('annex compilation', () => {
		test('compiles form with no annexes', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'no-annex-form',
				title: 'No Annex Form',
				fields: {
					name: { type: 'text', label: 'Name' },
				},
			};

			const schema = compile(form) as Record<string, unknown>;

			expect(check(schema, { fields: { name: 'Test' } })).toBe(true);
		});

		test('compiles form with optional annexes', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'optional-annex-form',
				title: 'Optional Annex Form',
				annexes: [
					{
						id: 'terms',
						title: 'Terms and Conditions',
					},
				],
			};

			const schema = compile(form) as Record<string, unknown>;

			// Valid without annex
			expect(check(schema, { fields: {} })).toBe(true);

			// Valid with annex
			expect(
				check(schema, {
					fields: {},
					annexes: { terms: 'signed' },
				}),
			).toBe(true);
		});

		test('compiles form with required annexes', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'required-annex-form',
				title: 'Required Annex Form',
				annexes: [
					{
						id: 'signature',
						title: 'Signature',
						required: true,
					},
				],
			};

			const schema = compile(form) as Record<string, unknown>;

			// Invalid without required annex
			expect(check(schema, { fields: {} })).toBe(false);

			// Valid with required annex
			expect(
				check(schema, {
					fields: {},
					annexes: { signature: { data: 'base64...' } },
				}),
			).toBe(true);
		});
	});

	describe('compileToJsonSchema()', () => {
		test('returns plain JSON Schema object', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'json-schema-form',
				title: 'JSON Schema Form',
				fields: {
					name: { type: 'text', label: 'Name', required: true },
				},
			};

			const jsonSchema = compileToJsonSchema(form);

			expect(typeof jsonSchema).toBe('object');
			expect(jsonSchema).toHaveProperty('type');
			expect(jsonSchema).toHaveProperty('properties');
		});

		test('JSON Schema is usable with standard validators', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'standard-form',
				title: 'Standard Form',
				fields: {
					email: { type: 'email', label: 'Email', required: true },
				},
			};

			const jsonSchema = compileToJsonSchema(form);

			// Should be a valid JSON Schema Draft 2020-12 compatible object
			expect(jsonSchema).toHaveProperty('type', 'object');
			expect(jsonSchema).toHaveProperty('properties');
			expect(jsonSchema.properties).toHaveProperty('fields');
			// annexes is always present as optional to maintain backwards compatibility
			// with code that passes { fields: {...}, annexes: {} }
			expect(jsonSchema.properties).toHaveProperty('annexes');
			// But annexes should not be in the required array when no annexes are defined
			expect(jsonSchema.required).not.toContain('annexes');
		});
	});

	describe('type inference', () => {
		test('InferFormData type works correctly', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'type-inference-form',
				title: 'Type Inference Form',
				fields: {
					name: { type: 'text', label: 'Name', required: true },
					age: { type: 'number', label: 'Age' },
				},
			};

			const schema = compile(form) as Record<string, unknown>;

			// This should compile without TypeScript errors
			type DataPayload = InferFormData<typeof form>;

			const validData: DataPayload = {
				fields: {
					name: 'John',
					age: 30,
				},
			};

			expect(check(schema, validData)).toBe(true);
		});
	});

	describe('edge cases', () => {
		test('handles form with empty fields object', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'empty-fields',
				title: 'Empty Fields',
				fields: {},
			};

			const schema = compile(form) as Record<string, unknown>;

			expect(check(schema, { fields: {} })).toBe(true);
		});

		test('rejects additional fields not in schema', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'strict-form',
				title: 'Strict Form',
				fields: {
					name: { type: 'text', label: 'Name', required: true },
				},
			};

			const schema = compile(form) as Record<string, unknown>;

			// Should reject extra field
			expect(
				check(schema, {
					fields: { name: 'John', extra: 'field' },
				}),
			).toBe(false);
		});

		test('handles deeply nested fieldsets', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'deep-nested',
				title: 'Deep Nested',
				fields: {
					level1: {
						type: 'fieldset',
						label: 'Level 1',
						fields: {
							level2: {
								type: 'fieldset',
								label: 'Level 2',
								fields: {
									name: { type: 'text', label: 'Name', required: true },
								},
								required: true,
							},
						},
						required: true,
					},
				},
			};

			const schema = compile(form) as Record<string, unknown>;

			expect(
				check(schema, {
					fields: {
						level1: {
							level2: {
								name: 'Deep Value',
							},
						},
					},
				}),
			).toBe(true);
		});
	});
});
