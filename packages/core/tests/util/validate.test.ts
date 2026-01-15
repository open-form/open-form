import { describe, test, expect } from 'vitest';
import { validateFormData } from '@/utils';
import type { Form, NumberField, TextField, EnumField, MoneyField } from '@open-form/types';

describe('validateFormData utility', () => {
	describe('validateFormData() - basic functionality', () => {
		test('validates correct data successfully', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'simple-form',
				title: 'Simple Form',
				fields: {
					name: { type: 'text', label: 'Name', required: true },
					age: { type: 'number', label: 'Age' },
				},
			};

			const data = {
				fields: {
					name: 'John Doe',
					age: 30,
				},
				annexes: {},
			};

			const result = validateFormData(form, data);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(data);
			}
		});

		test('rejects missing required fields', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'required-form',
				title: 'Required Form',
				fields: {
					name: { type: 'text', label: 'Name', required: true },
					email: { type: 'email', label: 'Email', required: true },
				},
			};

			const data = {
				fields: {
					name: 'John',
					// email is missing
				},
				annexes: {},
			};

			const result = validateFormData(form, data);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors.length).toBeGreaterThan(0);
				expect(result.errors.some((err) => err.field === 'email')).toBe(true);
				expect(
					result.errors.some((err) => err.message.includes('required')),
				).toBe(true);
			}
		});

		test('accepts optional fields when not provided', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'optional-form',
				title: 'Optional Form',
				fields: {
					name: { type: 'text', label: 'Name', required: true },
					nickname: { type: 'text', label: 'Nickname' }, // optional
				},
			};

			const data = {
				fields: {
					name: 'John',
					// nickname is optional and not provided
				},
				annexes: {},
			};

			const result = validateFormData(form, data);

			expect(result.success).toBe(true);
		});
	});

	describe('field type validation', () => {
		test('validates text field constraints', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'text-validation',
				title: 'Text Validation',
				fields: {
					username: {
						type: 'text',
						label: 'Username',
						minLength: 3,
						maxLength: 20,
						pattern: '^[a-z0-9_]+$',
						required: true,
					} as TextField,
				},
			};

			// Valid username
			expect(
				validateFormData(form, { fields: { username: 'john_doe' }, annexes: {} })
					.success,
			).toBe(true);

			// Too short
			const tooShort = validateFormData(form, {
				fields: { username: 'jo' },
				annexes: {},
			});
			expect(tooShort.success).toBe(false);
			if (!tooShort.success) {
				expect(
					tooShort.errors.some((err) => err.field.includes('username')),
				).toBe(true);
			}

			// Too long
			const tooLong = validateFormData(form, {
				fields: { username: 'a'.repeat(21) },
				annexes: {},
			});
			expect(tooLong.success).toBe(false);

			// Invalid pattern
			const invalidPattern = validateFormData(form, {
				fields: { username: 'JOHN-DOE' },
				annexes: {},
			});
			expect(invalidPattern.success).toBe(false);
		});

		test('validates number field constraints', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'number-validation',
				title: 'Number Validation',
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

			// Valid age
			expect(validateFormData(form, { fields: { age: 25 }, annexes: {} }).success).toBe(
				true,
			);

			// Too low
			const tooLow = validateFormData(form, { fields: { age: -1 }, annexes: {} });
			expect(tooLow.success).toBe(false);

			// Too high
			const tooHigh = validateFormData(form, { fields: { age: 121 }, annexes: {} });
			expect(tooHigh.success).toBe(false);

			// Wrong type
			const wrongType = validateFormData(form, {
				fields: { age: 'twenty-five' },
				annexes: {},
			});
			expect(wrongType.success).toBe(false);
		});

		test('validates boolean fields', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'boolean-validation',
				title: 'Boolean Validation',
				fields: {
					accepted: { type: 'boolean', label: 'Accepted', required: true },
				},
			};

			// Valid booleans
			expect(
				validateFormData(form, { fields: { accepted: true }, annexes: {} }).success,
			).toBe(true);
			expect(
				validateFormData(form, { fields: { accepted: false }, annexes: {} }).success,
			).toBe(true);

			// Invalid (string instead of boolean)
			const invalid = validateFormData(form, {
				fields: { accepted: 'yes' },
				annexes: {},
			});
			expect(invalid.success).toBe(false);
		});

		test('validates coordinate fields', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'coordinate-validation',
				title: 'Coordinate Validation',
				fields: {
					location: { type: 'coordinate', label: 'Location', required: true },
				},
			};

			// Valid coordinate
			expect(
				validateFormData(form, {
					fields: { location: { lat: 40.7128, lon: -74.006 } },
					annexes: {},
				}).success,
			).toBe(true);

			// Invalid lat (out of range)
			expect(
				validateFormData(form, {
					fields: { location: { lat: 100, lon: -74.006 } },
					annexes: {},
				}).success,
			).toBe(false);

			// Invalid lon (out of range)
			expect(
				validateFormData(form, {
					fields: { location: { lat: 40.7128, lon: -200 } },
					annexes: {},
				}).success,
			).toBe(false);

			// Missing property
			expect(
				validateFormData(form, {
					fields: { location: { lat: 40.7128 } },
					annexes: {},
				}).success,
			).toBe(false);
		});

		test('validates money fields', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'money-validation',
				title: 'Money Validation',
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

			// Valid money
			expect(
				validateFormData(form, {
					fields: { price: { amount: 99.99, currency: 'USD' } },
					annexes: {},
				}).success,
			).toBe(true);

			// Invalid currency code (must be 3 chars)
			expect(
				validateFormData(form, {
					fields: { price: { amount: 99.99, currency: 'US' } },
					annexes: {},
				}).success,
			).toBe(false);

			// Out of range
			expect(
				validateFormData(form, {
					fields: { price: { amount: 10001, currency: 'USD' } },
					annexes: {},
				}).success,
			).toBe(false);
		});

		test('validates address fields', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'address-validation',
				title: 'Address Validation',
				fields: {
					address: { type: 'address', label: 'Address', required: true },
				},
			};

			// Valid address
			expect(
				validateFormData(form, {
					fields: {
						address: {
							line1: '123 Main St',
							locality: 'New York',
							region: 'NY',
							postalCode: '10001',
							country: 'US',
						},
					},
					annexes: {},
				}).success,
			).toBe(true);

			// Valid with optional line2
			expect(
				validateFormData(form, {
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
					annexes: {},
				}).success,
			).toBe(true);

			// Missing required field (postalCode)
			expect(
				validateFormData(form, {
					fields: {
						address: {
							line1: '123 Main St',
							locality: 'New York',
							region: 'NY',
							country: 'US',
						},
					},
					annexes: {},
				}).success,
			).toBe(false);
		});

		test('validates phone fields', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'phone-validation',
				title: 'Phone Validation',
				fields: {
					phone: { type: 'phone', label: 'Phone', required: true },
				},
			};

			// Valid E.164 phone
			expect(
				validateFormData(form, {
					fields: { phone: { number: '+12025551234' } },
					annexes: {},
				}).success,
			).toBe(true);

			// Valid with type
			expect(
				validateFormData(form, {
					fields: { phone: { number: '+12025551234', type: 'mobile' } },
					annexes: {},
				}).success,
			).toBe(true);

			// Invalid format (missing +)
			expect(
				validateFormData(form, {
					fields: { phone: { number: '12025551234' } },
					annexes: {},
				}).success,
			).toBe(false);
		});

		test('validates enum fields', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'enum-validation',
				title: 'Enum Validation',
				fields: {
					status: {
						type: 'enum',
						label: 'Status',
						enum: ['active', 'inactive', 'pending'],
						required: true,
					} as EnumField,
				},
			};

			// Valid enum values
			expect(
				validateFormData(form, { fields: { status: 'active' }, annexes: {} }).success,
			).toBe(true);
			expect(
				validateFormData(form, { fields: { status: 'inactive' }, annexes: {} }).success,
			).toBe(true);

			// Invalid enum value
			const invalid = validateFormData(form, {
				fields: { status: 'completed' },
				annexes: {},
			});
			expect(invalid.success).toBe(false);
		});

		test('validates nested fieldset', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'fieldset-validation',
				title: 'Fieldset Validation',
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

			// Valid nested data
			expect(
				validateFormData(form, {
					fields: {
						personal: {
							firstName: 'John',
							lastName: 'Doe',
							age: 30,
						},
					},
					annexes: {},
				}).success,
			).toBe(true);

			// Missing required nested field
			const invalid = validateFormData(form, {
				fields: {
					personal: {
						firstName: 'John',
						// lastName missing
					},
				},
				annexes: {},
			});
			expect(invalid.success).toBe(false);
		});
	});

	describe('annex validation', () => {
		test('validates required annexes', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'required-annex',
				title: 'Required Annex',
				annexes: [
					{
						id: 'signature',
						title: 'Signature',
						required: true,
					},
				],
			};

			// Invalid without required annex
			expect(validateFormData(form, { fields: {}, annexes: {} }).success).toBe(false);

			// Valid with required annex
			expect(
				validateFormData(form, {
					fields: {},
					annexes: { signature: 'signed' },
				}).success,
			).toBe(true);
		});

		test('allows optional annexes to be omitted', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'optional-annex',
				title: 'Optional Annex',
				annexes: [
					{
						id: 'terms',
						title: 'Terms',
						// not required
					},
				],
			};

			// Valid without optional annex
			expect(validateFormData(form, { fields: {}, annexes: {} }).success).toBe(true);

			// Valid with optional annex
			expect(
				validateFormData(form, {
					fields: {},
					annexes: { terms: 'accepted' },
				}).success,
			).toBe(true);
		});
	});

	describe('error handling and messaging', () => {
		test('provides detailed error messages for validation failures', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'error-messages',
				title: 'Error Messages',
				fields: {
					name: {
						type: 'text',
						label: 'Name',
						minLength: 3,
						maxLength: 50,
						required: true,
					} as TextField,
					age: {
						type: 'number',
						label: 'Age',
						min: 0,
						max: 120,
						required: true,
					} as NumberField,
				},
			};

			const result = validateFormData(form, {
				fields: {
					name: 'Jo', // too short
					age: 150, // too high
				},
				annexes: {},
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors.length).toBeGreaterThan(0);

				// Errors should have field and message
				result.errors.forEach((error) => {
					expect(error).toHaveProperty('field');
					expect(error).toHaveProperty('message');
					expect(typeof error.field).toBe('string');
					expect(typeof error.message).toBe('string');
				});
			}
		});

		test('reports multiple errors at once', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'multiple-errors',
				title: 'Multiple Errors',
				fields: {
					name: { type: 'text', label: 'Name', required: true },
					email: { type: 'email', label: 'Email', required: true },
					age: { type: 'number', label: 'Age', required: true },
				},
			};

			const result = validateFormData(form, {
				fields: {
					// all fields missing
				},
				annexes: {},
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				// Should have errors for all 3 missing fields
				expect(result.errors.length).toBeGreaterThanOrEqual(3);
			}
		});

		test('reports additional properties error', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'strict-schema',
				title: 'Strict Schema',
				fields: {
					name: { type: 'text', label: 'Name', required: true },
				},
			};

			const result = validateFormData(form, {
				fields: {
					name: 'John',
					extraField: 'not allowed',
				},
				annexes: {},
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(
					result.errors.some((err) => err.message.includes('Unknown field')),
				).toBe(true);
			}
		});
	});


	describe('complex scenarios', () => {
		test('validates complex form with multiple field types', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'complex-form',
				title: 'Complex Form',
				fields: {
					name: { type: 'text', label: 'Name', required: true },
					email: { type: 'email', label: 'Email', required: true },
					age: { type: 'number', label: 'Age', min: 0, max: 120 } as NumberField,
					location: { type: 'coordinate', label: 'Location' },
					price: { type: 'money', label: 'Price', min: 0 } as MoneyField,
					accepted: { type: 'boolean', label: 'Accepted', required: true },
					status: {
						type: 'enum',
						label: 'Status',
						enum: ['active', 'inactive'],
					} as EnumField,
				},
			};

			const validData = {
				fields: {
					name: 'John Doe',
					email: 'john@example.com',
					age: 30,
					location: { lat: 40.7128, lon: -74.006 },
					price: { amount: 99.99, currency: 'USD' },
					accepted: true,
					status: 'active',
				},
				annexes: {},
			};

			const result = validateFormData(form, validData);

			expect(result.success).toBe(true);
		});

		test('validates deeply nested fieldsets', () => {
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
									level3: {
										type: 'fieldset',
										label: 'Level 3',
										fields: {
											name: { type: 'text', label: 'Name', required: true },
										},
										required: true,
									},
								},
								required: true,
							},
						},
						required: true,
					},
				},
			};

			const validData = {
				fields: {
					level1: {
						level2: {
							level3: {
								name: 'Deep Value',
							},
						},
					},
				},
				annexes: {},
			};

			const result = validateFormData(form, validData);

			expect(result.success).toBe(true);
		});

		test('validates form with both fields and annexes', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'fields-and-annexes',
				title: 'Fields and Annexes',
				fields: {
					name: { type: 'text', label: 'Name', required: true },
				},
				annexes: [
					{
						id: 'signature',
						title: 'Signature',
						required: true,
					},
					{
						id: 'photo',
						title: 'Photo',
					},
				],
			};

			const validData = {
				fields: {
					name: 'John Doe',
				},
				annexes: {
					signature: 'base64...',
					photo: 'base64...',
				},
			};

			const result = validateFormData(form, validData);

			expect(result.success).toBe(true);
		});
	});

	describe('edge cases', () => {
		test('handles empty form', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'empty-form',
				title: 'Empty Form',
			};

			const result = validateFormData(form, { fields: {}, annexes: {} });

			expect(result.success).toBe(true);
		});

		test('handles null data gracefully', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'null-test',
				title: 'Null Test',
				fields: {
					name: { type: 'text', label: 'Name', required: true },
				},
			};

			const result = validateFormData(form, null as any);

			expect(result.success).toBe(false);
		});

		test('handles undefined data gracefully', () => {
			const form: Form = {
				kind: 'form',
				version: '1.0.0',
				name: 'undefined-test',
				title: 'Undefined Test',
				fields: {
					name: { type: 'text', label: 'Name', required: true },
				},
			};

			const result = validateFormData(form, undefined as any);

			expect(result.success).toBe(false);
		});
	});
});
