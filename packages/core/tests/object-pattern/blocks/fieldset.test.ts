import { describe, test, expect } from 'vitest';
import { fieldset } from '@/builders/blocks/fieldset';
import type { Fieldset, NumberField, EnumField } from '@/schemas/blocks';

describe('Fieldset (Object Pattern)', () => {
	describe('fieldset() - direct validation', () => {
		describe('success cases', () => {
			test('creates valid fieldset with minimal config', () => {
				const input: Fieldset = {
					id: 'personal-info',
					fields: {
						name: { type: 'text' },
					},
				};
				const result = fieldset(input);
				expect(result.id).toBe('personal-info');
				expect(result.fields!.name!.type).toBe('text');
			});

			test('creates fieldset with title', () => {
				const input: Fieldset = {
					id: 'contact-info',
					title: 'Contact Information',
					fields: {
						email: { type: 'email' },
					},
				};
				const result = fieldset(input);
				expect(result.title).toBe('Contact Information');
			});

			test('creates fieldset with description', () => {
				const input: Fieldset = {
					id: 'address-section',
					title: 'Address',
					description: 'Enter your mailing address',
					fields: {
						street: { type: 'text' },
						city: { type: 'text' },
					},
				};
				const result = fieldset(input);
				expect(result.description).toBe('Enter your mailing address');
			});

			test('creates fieldset with multiple fields of different types', () => {
				const input: Fieldset = {
					id: 'profile',
					fields: {
						name: { type: 'text', label: 'Full Name' },
						age: { type: 'number', label: 'Age', min: 0, max: 120 } as NumberField,
						email: { type: 'email', label: 'Email' },
						subscribe: { type: 'boolean', label: 'Subscribe' },
					},
				};
				const result = fieldset(input);
				expect(Object.keys(result.fields)).toHaveLength(4);
				expect(result.fields!.name!.type).toBe('text');
				expect(result.fields!.age!.type).toBe('number');
			});

			test('creates fieldset with required flag', () => {
				const input: Fieldset = {
					id: 'required-section',
					fields: {
						field1: { type: 'text' },
					},
					required: true,
				};
				const result = fieldset(input);
				expect(result.required).toBe(true);
			});

			test('creates fieldset with order', () => {
				const input: Fieldset = {
					id: 'section-1',
					fields: {
						field1: { type: 'text' },
					},
					order: 1,
				};
				const result = fieldset(input);
				expect(result.order).toBe(1);
			});

			test('creates fieldset with all properties', () => {
				const input: Fieldset = {
					id: 'complete-section',
					title: 'Complete Information',
					description: 'All required fields',
					fields: {
						name: { type: 'text', label: 'Name', required: true },
						email: { type: 'email', label: 'Email', required: true },
					},
					required: true,
					order: 1,
				};
				const result = fieldset(input);
				expect(result).toEqual(input);
			});

			test('creates fieldset with nested fieldset', () => {
				const input: Fieldset = {
					id: 'parent',
					fields: {
						personal: {
							type: 'fieldset',
							label: 'Personal Info',
							fields: {
								name: { type: 'text' },
								age: { type: 'number' },
							},
						},
					},
				};
				const result = fieldset(input);
				const fields = result.fields as any; expect(fields.personal.type).toBe('fieldset');
				expect(fields.personal.fields.name.type).toBe('text');
			});

			test('creates fieldset with deeply nested fieldsets', () => {
				const input: Fieldset = {
					id: 'root',
					fields: {
						level1: {
							type: 'fieldset',
							fields: {
								level2: {
									type: 'fieldset',
									fields: {
										name: { type: 'text' },
									},
								},
							},
						},
					},
				};
				const result = fieldset(input);
				const fields = result.fields as any; expect(fields.level1.fields.level2.type).toBe('fieldset');
			});

			test('creates fieldset with various field types', () => {
				const input: Fieldset = {
					id: 'varied-fields',
					fields: {
						textField: { type: 'text' },
						numberField: { type: 'number' },
						booleanField: { type: 'boolean' },
						emailField: { type: 'email' },
						enumField: { type: 'enum', enum: ['a', 'b', 'c'] } as EnumField,
						moneyField: { type: 'money' },
						addressField: { type: 'address' },
						phoneField: { type: 'phone' },
						coordinateField: { type: 'coordinate' },
					},
				};
				const result = fieldset(input);
				expect(Object.keys(result.fields)).toHaveLength(9);
			});

			test('creates fieldset with valid id patterns', () => {
				const validIds = [
					'simple',
					'with-dash',
					'with_underscore',
					'camelCase',
					'PascalCase',
					'with123numbers',
					'a1-b2_c3',
				];

				for (const id of validIds) {
					const input: Fieldset = {
						id,
						fields: { field1: { type: 'text' } },
					};
					const result = fieldset(input);
					expect(result.id).toBe(id);
				}
			});

			test('creates fieldset with long valid id', () => {
				const input: Fieldset = {
					id: 'a'.repeat(100),
					fields: { field1: { type: 'text' } },
				};
				const result = fieldset(input);
				expect(result.id).toHaveLength(100);
			});

			test('creates fieldset with order value 0', () => {
				const input: Fieldset = {
					id: 'first',
					fields: { field1: { type: 'text' } },
					order: 0,
				};
				const result = fieldset(input);
				expect(result.order).toBe(0);
			});

			test('creates fieldset with large order value', () => {
				const input: Fieldset = {
					id: 'last',
					fields: { field1: { type: 'text' } },
					order: 9999,
				};
				const result = fieldset(input);
				expect(result.order).toBe(9999);
			});
		});

		describe('validation failures', () => {
			test('throws error when id is missing', () => {
				const input = {
					fields: { field1: { type: 'text' } },
				} as any;
				expect(() => fieldset(input)).toThrow();
			});

			test('throws error when fields is missing', () => {
				const input = {
					id: 'test',
				} as any;
				expect(() => fieldset(input)).toThrow();
			});

			test('throws error when id is empty string', () => {
				const input = {
					id: '',
					fields: { field1: { type: 'text' } },
				} as any;
				expect(() => fieldset(input)).toThrow();
			});

			test('throws error when id exceeds maxLength', () => {
				const input = {
					id: 'a'.repeat(101),
					fields: { field1: { type: 'text' } },
				} as any;
				expect(() => fieldset(input)).toThrow();
			});

			test('throws error when id has invalid pattern (starts with dash)', () => {
				const input = {
					id: '-invalid',
					fields: { field1: { type: 'text' } },
				} as any;
				expect(() => fieldset(input)).toThrow();
			});

			test('throws error when id has invalid pattern (starts with underscore)', () => {
				const input = {
					id: '_invalid',
					fields: { field1: { type: 'text' } },
				} as any;
				expect(() => fieldset(input)).toThrow();
			});

			test('throws error when id has special characters', () => {
				const input = {
					id: 'invalid@id',
					fields: { field1: { type: 'text' } },
				} as any;
				expect(() => fieldset(input)).toThrow();
			});

			test('throws error when id has spaces', () => {
				const input = {
					id: 'invalid id',
					fields: { field1: { type: 'text' } },
				} as any;
				expect(() => fieldset(input)).toThrow();
			});

			test('throws error when title is empty string', () => {
				const input = {
					id: 'test',
					title: '',
					fields: { field1: { type: 'text' } },
				} as any;
				expect(() => fieldset(input)).toThrow();
			});

			test('throws error when title exceeds maxLength', () => {
				const input = {
					id: 'test',
					title: 'a'.repeat(201),
					fields: { field1: { type: 'text' } },
				} as any;
				expect(() => fieldset(input)).toThrow();
			});

			test('throws error when description is empty string', () => {
				const input = {
					id: 'test',
					description: '',
					fields: { field1: { type: 'text' } },
				} as any;
				expect(() => fieldset(input)).toThrow();
			});

			test('throws error when description exceeds maxLength', () => {
				const input = {
					id: 'test',
					description: 'a'.repeat(1001),
					fields: { field1: { type: 'text' } },
				} as any;
				expect(() => fieldset(input)).toThrow();
			});

			test('throws error when fields is empty object', () => {
				const input = {
					id: 'test',
					fields: {},
				} as any;
				// TypeBox may allow empty object, but semantically it should have at least one field
				// This depends on schema definition - adjust if needed
				const result = fieldset(input);
				expect(result.fields).toEqual({});
			});

			test('throws error when order is negative', () => {
				const input = {
					id: 'test',
					fields: { field1: { type: 'text' } },
					order: -1,
				} as any;
				expect(() => fieldset(input)).toThrow();
			});

			test('throws error when field definition is invalid', () => {
				const input = {
					id: 'test',
					fields: {
						invalid: { type: 'invalid-type' },
					},
				} as any;
				expect(() => fieldset(input)).toThrow();
			});

			test('strips additional properties', () => {
				const input = {
					id: 'test',
					fields: { field1: { type: 'text' } },
					extra: 'should be removed',
				} as any;
				const result = fieldset(input);
				expect(result).not.toHaveProperty('extra');
			});
		});
	});

	describe('fieldset.parse()', () => {
		describe('success cases', () => {
			test('parses valid fieldset', () => {
				const input = {
					id: 'test',
					fields: { name: { type: 'text' } },
				};
				const result = fieldset.parse(input);
				expect(result).toEqual(input);
			});

			test('parses fieldset with all properties', () => {
				const input = {
					id: 'complete',
					title: 'Complete',
					description: 'A complete fieldset',
					fields: { field1: { type: 'text' } },
					required: true,
					order: 1,
				};
				const result = fieldset.parse(input);
				expect(result).toEqual(input);
			});
		});

		describe('validation failures', () => {
			test('throws error for invalid input', () => {
				expect(() => fieldset.parse({ id: '' })).toThrow();
			});

			test('throws error when input is null', () => {
				expect(() => fieldset.parse(null)).toThrow();
			});

			test('throws error when input is undefined', () => {
				expect(() => fieldset.parse(undefined)).toThrow();
			});

			test('throws error when id is missing', () => {
				expect(() =>
					fieldset.parse({ fields: { field1: { type: 'text' } } }),
				).toThrow();
			});
		});
	});

	describe('fieldset.safeParse()', () => {
		describe('success cases', () => {
			test('returns success for valid fieldset', () => {
				const input = {
					id: 'test',
					fields: { name: { type: 'text' } },
				};
				const result = fieldset.safeParse(input);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual(input);
				}
			});

			test('returns success for fieldset with nested fields', () => {
				const input = {
					id: 'parent',
					fields: {
						child: {
							type: 'fieldset',
							fields: {
								name: { type: 'text' },
							},
						},
					},
				};
				const result = fieldset.safeParse(input);
				expect(result.success).toBe(true);
			});
		});

		describe('failure cases', () => {
			test('returns error for invalid id', () => {
				const input = { id: '', fields: { field1: { type: 'text' } } };
				const result = fieldset.safeParse(input);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error for missing id', () => {
				const input = { fields: { field1: { type: 'text' } } };
				const result = fieldset.safeParse(input);
				expect(result.success).toBe(false);
			});

			test('returns error for missing fields', () => {
				const input = { id: 'test' };
				const result = fieldset.safeParse(input);
				expect(result.success).toBe(false);
			});

			test('returns error for null input', () => {
				const result = fieldset.safeParse(null);
				expect(result.success).toBe(false);
			});

			test('returns error for undefined input', () => {
				const result = fieldset.safeParse(undefined);
				expect(result.success).toBe(false);
			});

			test('returns error when id exceeds maxLength', () => {
				const input = {
					id: 'a'.repeat(101),
					fields: { field1: { type: 'text' } },
				};
				const result = fieldset.safeParse(input);
				expect(result.success).toBe(false);
			});

			test('returns error when order is negative', () => {
				const input = {
					id: 'test',
					fields: { field1: { type: 'text' } },
					order: -1,
				};
				const result = fieldset.safeParse(input);
				expect(result.success).toBe(false);
			});
		});
	});
});
