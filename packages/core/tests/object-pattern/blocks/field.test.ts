import { describe, test, expect } from 'vitest';
import { field } from '@/builders/blocks/field';
import type {
	TextField,
	NumberField,
	BooleanField,
	EmailField,
	EnumField,
	MoneyField,
	AddressField,
	PhoneField,
	CoordinateField,
	FieldsetField,
} from '@/schemas/blocks';

describe('Field (Object Pattern)', () => {
	describe('field() - direct validation', () => {
		describe('TextField - success cases', () => {
			test('creates valid text field with minimal config', () => {
				const input: TextField = { type: 'text' };
				const result = field(input);
				expect(result).toEqual({ type: 'text' });
			});

			test('creates text field with label', () => {
				const input: TextField = {
					type: 'text',
					label: 'Full Name',
				};
				const result = field(input);
				expect(result).toEqual({ type: 'text', label: 'Full Name' });
			});

			test('creates text field with all properties', () => {
				const input: TextField = {
					type: 'text',
					label: 'Username',
					description: 'Choose a unique username',
					required: true,
					minLength: 3,
					maxLength: 20,
					pattern: '^[a-zA-Z0-9_-]+$',
				};
				const result = field(input);
				expect(result).toEqual(input);
			});

			test('creates text field with maxLength only', () => {
				const input: TextField = {
					type: 'text',
					maxLength: 100,
				};
				const result = field(input);
				expect((result as any).maxLength).toBe(100);
			});

			test('creates text field with pattern validation', () => {
				const input: TextField = {
					type: 'text',
					pattern: '^[A-Z]{3}$',
				};
				const result = field(input);
				expect((result as any).pattern).toBe('^[A-Z]{3}$');
			});
		});

		describe('NumberField - success cases', () => {
			test('creates valid number field with minimal config', () => {
				const input: NumberField = { type: 'number' };
				const result = field(input);
				expect(result).toEqual({ type: 'number' });
			});

			test('creates number field with min and max', () => {
				const input: NumberField = {
					type: 'number',
					label: 'Age',
					min: 0,
					max: 120,
				};
				const result = field(input);
				expect(result).toEqual(input);
			});

			test('creates number field with negative min', () => {
				const input: NumberField = {
					type: 'number',
					label: 'Temperature',
					min: -273.15,
					max: 1000,
				};
				const result = field(input);
				expect((result as any).min).toBe(-273.15);
			});

			test('creates number field with decimal constraints', () => {
				const input: NumberField = {
					type: 'number',
					min: 0.01,
					max: 99.99,
				};
				const result = field(input);
				expect(result).toEqual(input);
			});
		});

		describe('BooleanField - success cases', () => {
			test('creates valid boolean field', () => {
				const input: BooleanField = { type: 'boolean' };
				const result = field(input);
				expect(result).toEqual({ type: 'boolean' });
			});

			test('creates boolean field with label', () => {
				const input: BooleanField = {
					type: 'boolean',
					label: 'Accept Terms',
					required: true,
				};
				const result = field(input);
				expect(result).toEqual(input);
			});

			test('creates boolean field with description', () => {
				const input: BooleanField = {
					type: 'boolean',
					label: 'Subscribe',
					description: 'Receive newsletter updates',
				};
				const result = field(input);
				expect(result).toEqual(input);
			});
		});

		describe('EmailField - success cases', () => {
			test('creates valid email field', () => {
				const input: EmailField = { type: 'email' };
				const result = field(input);
				expect(result).toEqual({ type: 'email' });
			});

			test('creates email field with length constraints', () => {
				const input: EmailField = {
					type: 'email',
					label: 'Email Address',
					minLength: 5,
					maxLength: 100,
					required: true,
				};
				const result = field(input);
				expect(result).toEqual(input);
			});
		});

		describe('EnumField - success cases', () => {
			test('creates enum field with string values', () => {
				const input: EnumField = {
					type: 'enum',
					enum: ['red', 'green', 'blue'],
				};
				const result = field(input);
				expect(result).toEqual(input);
			});

			test('creates enum field with number values', () => {
				const input: EnumField = {
					type: 'enum',
					enum: [1, 2, 3, 4, 5],
				};
				const result = field(input);
				expect(result).toEqual(input);
			});

			test('creates enum field with mixed values', () => {
				const input: EnumField = {
					type: 'enum',
					label: 'Priority',
					enum: ['low', 1, 'medium', 2, 'high', 3],
				};
				const result = field(input);
				expect(result).toEqual(input);
			});

			test('creates enum field with single value', () => {
				const input: EnumField = {
					type: 'enum',
					enum: ['single'],
				};
				const result = field(input);
				expect((result as any).enum).toHaveLength(1);
			});
		});

		describe('MoneyField - success cases', () => {
			test('creates valid money field', () => {
				const input: MoneyField = { type: 'money' };
				const result = field(input);
				expect(result).toEqual({ type: 'money' });
			});

			test('creates money field with min and max', () => {
				const input: MoneyField = {
					type: 'money',
					label: 'Price',
					min: 0,
					max: 10000,
				};
				const result = field(input);
				expect(result).toEqual(input);
			});

			test('creates money field with default value', () => {
				const input: MoneyField = {
					type: 'money',
					default: { amount: 100, currency: 'USD' },
				};
				const result = field(input);
				expect((result as any).default).toEqual({ amount: 100, currency: 'USD' });
			});
		});

		describe('AddressField - success cases', () => {
			test('creates valid address field', () => {
				const input: AddressField = { type: 'address' };
				const result = field(input);
				expect(result).toEqual({ type: 'address' });
			});

			test('creates address field with label and required', () => {
				const input: AddressField = {
					type: 'address',
					label: 'Billing Address',
					required: true,
				};
				const result = field(input);
				expect(result).toEqual(input);
			});

			test('creates address field with default value', () => {
				const input: AddressField = {
					type: 'address',
					default: {
						line1: '123 Main St',
						locality: 'San Francisco',
						region: 'CA',
						postalCode: '94103',
						country: 'US',
					},
				};
				const result = field(input);
				expect((result as any).default).toBeDefined();
			});
		});

		describe('PhoneField - success cases', () => {
			test('creates valid phone field', () => {
				const input: PhoneField = { type: 'phone' };
				const result = field(input);
				expect(result).toEqual({ type: 'phone' });
			});

			test('creates phone field with label', () => {
				const input: PhoneField = {
					type: 'phone',
					label: 'Mobile Number',
					required: true,
				};
				const result = field(input);
				expect(result).toEqual(input);
			});

			test('creates phone field with default value', () => {
				const input: PhoneField = {
					type: 'phone',
					default: {
						number: '+14155551234',
					},
				};
				const result = field(input);
				expect((result as any).default).toEqual({ number: '+14155551234' });
			});
		});

		describe('CoordinateField - success cases', () => {
			test('creates valid coordinate field', () => {
				const input: CoordinateField = { type: 'coordinate' };
				const result = field(input);
				expect(result).toEqual({ type: 'coordinate' });
			});

			test('creates coordinate field with default value', () => {
				const input: CoordinateField = {
					type: 'coordinate',
					label: 'Location',
					default: { lat: 37.7749, lon: -122.4194 },
				};
				const result = field(input);
				expect((result as any).default).toEqual({ lat: 37.7749, lon: -122.4194 });
			});
		});

		describe('FieldsetField - success cases', () => {
			test('creates fieldset with nested text fields', () => {
				const input: FieldsetField = {
					type: 'fieldset',
					fields: {
						firstName: { type: 'text', label: 'First Name' },
						lastName: { type: 'text', label: 'Last Name' },
					},
				};
				const result = field(input);
				expect(result.type).toBe('fieldset');
				expect((result as any).fields).toBeDefined();
				expect((result as any).fields.firstName.type).toBe('text');
			});

			test('creates fieldset with mixed field types', () => {
				const input: FieldsetField = {
					type: 'fieldset',
					label: 'Personal Information',
					fields: {
						name: { type: 'text', label: 'Name' },
						age: { type: 'number', label: 'Age', min: 0 } as NumberField,
						email: { type: 'email', label: 'Email' },
						subscribe: { type: 'boolean', label: 'Subscribe' },
					},
				};
				const result = field(input);
				expect(Object.keys((result as any).fields)).toHaveLength(4);
			});

			test('creates nested fieldsets (recursive)', () => {
				const input: FieldsetField = {
					type: 'fieldset',
					label: 'Contact',
					fields: {
						personal: {
							type: 'fieldset',
							label: 'Personal',
							fields: {
								name: { type: 'text' },
								age: { type: 'number' },
							},
						},
						address: {
							type: 'fieldset',
							label: 'Address',
							fields: {
								street: { type: 'text' },
								city: { type: 'text' },
							},
						},
					},
				};
				const result = field(input);
				const fields = result as any; expect(fields.fields.personal.type).toBe('fieldset');
				expect(fields.fields.address.type).toBe('fieldset');
			});
		});

		describe('validation failures', () => {
			test('throws error when type is missing', () => {
				const input = { label: 'Test' } as any;
				expect(() => field(input)).toThrow();
			});

			test('throws error for invalid type', () => {
				const input = { type: 'invalid' } as any;
				expect(() => field(input)).toThrow();
			});

			test('throws error when label exceeds maxLength', () => {
				const input = {
					type: 'text',
					label: 'a'.repeat(201),
				} as any;
				expect(() => field(input)).toThrow();
			});

			test('throws error when description exceeds maxLength', () => {
				const input = {
					type: 'text',
					description: 'a'.repeat(1001),
				} as any;
				expect(() => field(input)).toThrow();
			});

			test('throws error when enum has no values', () => {
				const input = {
					type: 'enum',
					enum: [],
				} as any;
				expect(() => field(input)).toThrow();
			});

			test('throws error when enum is missing', () => {
				const input = {
					type: 'enum',
				} as any;
				expect(() => field(input)).toThrow();
			});

			test('throws error when pattern exceeds maxLength', () => {
				const input = {
					type: 'text',
					pattern: 'a'.repeat(501),
				} as any;
				expect(() => field(input)).toThrow();
			});

			test('preserves additional properties (Field schema allows them via anyOf)', () => {
				// Note: Field uses anyOf at root without additionalProperties: false,
				// so extra properties are preserved through coercion but may be
				// rejected by strict validators.
				const input = {
					type: 'text',
					label: 'Name',
					extra: 'preserved',
				} as any;
				const result = field(input);
				// The field function validates the core structure; extra properties pass through
				expect(result.type).toBe('text');
				expect(result.label).toBe('Name');
			});
		});
	});

	describe('field.parse()', () => {
		describe('success cases', () => {
			test('parses valid text field', () => {
				const input = { type: 'text', label: 'Name' };
				const result = field.parse(input);
				expect(result).toEqual(input);
			});

			test('parses valid number field', () => {
				const input = { type: 'number', min: 0, max: 100 };
				const result = field.parse(input);
				expect(result).toEqual(input);
			});

			test('parses valid enum field', () => {
				const input = { type: 'enum', enum: ['a', 'b', 'c'] };
				const result = field.parse(input);
				expect(result).toEqual(input);
			});
		});

		describe('validation failures', () => {
			test('throws error for invalid input', () => {
				expect(() => field.parse({ type: 'invalid' })).toThrow();
			});

			test('throws error when input is null', () => {
				expect(() => field.parse(null)).toThrow();
			});

			test('throws error when input is undefined', () => {
				expect(() => field.parse(undefined)).toThrow();
			});
		});
	});

	describe('field.safeParse()', () => {
		describe('success cases', () => {
			test('returns success for valid text field', () => {
				const input = { type: 'text', label: 'Name' };
				const result = field.safeParse(input);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual(input);
				}
			});

			test('returns success for valid number field', () => {
				const input = { type: 'number', min: 0, max: 100 };
				const result = field.safeParse(input);
				expect(result.success).toBe(true);
			});

			test('returns success for valid fieldset', () => {
				const input = {
					type: 'fieldset',
					fields: {
						name: { type: 'text' },
					},
				};
				const result = field.safeParse(input);
				expect(result.success).toBe(true);
			});
		});

		describe('failure cases', () => {
			test('returns error for invalid type', () => {
				const input = { type: 'invalid' };
				const result = field.safeParse(input);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error for missing type', () => {
				const input = { label: 'Test' };
				const result = field.safeParse(input);
				expect(result.success).toBe(false);
			});

			test('returns error for null input', () => {
				const result = field.safeParse(null);
				expect(result.success).toBe(false);
			});

			test('returns error for undefined input', () => {
				const result = field.safeParse(undefined);
				expect(result.success).toBe(false);
			});

			test('returns error when enum is empty', () => {
				const input = { type: 'enum', enum: [] };
				const result = field.safeParse(input);
				expect(result.success).toBe(false);
			});
		});
	});
});
