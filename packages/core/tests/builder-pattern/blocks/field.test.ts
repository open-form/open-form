import { describe, test, expect } from 'vitest';
import { field } from '@/builders/blocks/field';

describe('Field (Builder Pattern)', () => {
	describe('fluent builder API', () => {
		describe('TextField builder - success cases', () => {
			test('builds valid text field with minimal config', () => {
				const result = field.text().build();
				expect(result).toEqual({ type: 'text' });
			});

			test('builds text field with label', () => {
				const result = field.text().label('Full Name').build();
				expect(result).toEqual({ type: 'text', label: 'Full Name' });
			});

			test('builds text field with all properties', () => {
				const result = field
					.text()
					.label('Username')
					.description('Choose a unique username')
					.required(true)
					.minLength(3)
					.maxLength(20)
					.pattern('^[a-zA-Z0-9_-]+$')
					.build();
				expect(result).toEqual({
					type: 'text',
					label: 'Username',
					description: 'Choose a unique username',
					required: true,
					minLength: 3,
					maxLength: 20,
					pattern: '^[a-zA-Z0-9_-]+$',
				});
			});

			test('builds text field with pattern validation', () => {
				const result = field.text().pattern('^[A-Z]{3}$').build();
				expect(result.pattern).toBe('^[A-Z]{3}$');
			});

			test('supports method chaining', () => {
				const result = field.text().label('Name').required().build();
				expect(result.label).toBe('Name');
				expect(result.required).toBe(true);
			});

			test('default field() creates text field', () => {
				const result = field().label('Default Text').build();
				expect(result.type).toBe('text');
			});
		});

		describe('NumberField builder - success cases', () => {
			test('builds valid number field', () => {
				const result = field.number().build();
				expect(result).toEqual({ type: 'number' });
			});

			test('builds number field with min and max', () => {
				const result = field.number().label('Age').min(0).max(120).build();
				expect(result).toEqual({
					type: 'number',
					label: 'Age',
					min: 0,
					max: 120,
				});
			});

			test('builds number field with negative min', () => {
				const result = field.number().min(-273.15).max(1000).build();
				expect(result.min).toBe(-273.15);
			});

			test('builds number field with decimal constraints', () => {
				const result = field.number().min(0.01).max(99.99).build();
				expect(result.min).toBe(0.01);
				expect(result.max).toBe(99.99);
			});

			test('allows overwriting min value', () => {
				const result = field.number().min(0).min(10).build();
				expect(result.min).toBe(10);
			});
		});

		describe('BooleanField builder - success cases', () => {
			test('builds valid boolean field', () => {
				const result = field.boolean().build();
				expect(result).toEqual({ type: 'boolean' });
			});

			test('builds boolean field with label', () => {
				const result = field.boolean().label('Accept Terms').required().build();
				expect(result).toEqual({
					type: 'boolean',
					label: 'Accept Terms',
					required: true,
				});
			});

			test('builds boolean field with description', () => {
				const result = field
					.boolean()
					.label('Subscribe')
					.description('Receive newsletter updates')
					.build();
				expect(result.description).toBe('Receive newsletter updates');
			});
		});

		describe('EmailField builder - success cases', () => {
			test('builds valid email field', () => {
				const result = field.email().build();
				expect(result).toEqual({ type: 'email' });
			});

			test('builds email field with length constraints', () => {
				const result = field
					.email()
					.label('Email Address')
					.minLength(5)
					.maxLength(100)
					.required()
					.build();
				expect(result).toEqual({
					type: 'email',
					label: 'Email Address',
					minLength: 5,
					maxLength: 100,
					required: true,
				});
			});

			test('builds email field with maxLength only', () => {
				const result = field.email().maxLength(255).build();
				expect(result.maxLength).toBe(255);
			});
		});

		describe('EnumField builder - success cases', () => {
			test('builds enum field with string values', () => {
				const result = field.enum().enum('red', 'green', 'blue').build();
				expect(result.enum).toEqual(['red', 'green', 'blue']);
			});

			test('builds enum field with number values', () => {
				const result = field.enum().enum(1, 2, 3, 4, 5).build();
				expect(result.enum).toEqual([1, 2, 3, 4, 5]);
			});

			test('builds enum field with mixed values', () => {
				const result = field
					.enum()
					.label('Priority')
					.enum('low', 1, 'medium', 2, 'high', 3)
					.build();
				expect(result.enum).toEqual(['low', 1, 'medium', 2, 'high', 3]);
			});

			test('builds enum field with single value', () => {
				const result = field.enum().enum('single').build();
				expect(result.enum).toHaveLength(1);
			});

			test('allows overwriting enum values', () => {
				const result = field.enum().enum('a', 'b').enum('x', 'y', 'z').build();
				expect(result.enum).toEqual(['x', 'y', 'z']);
			});
		});

		describe('MoneyField builder - success cases', () => {
			test('builds valid money field', () => {
				const result = field.money().build();
				expect(result).toEqual({ type: 'money' });
			});

			test('builds money field with min and max', () => {
				const result = field.money().label('Price').min(0).max(10000).build();
				expect(result).toEqual({
					type: 'money',
					label: 'Price',
					min: 0,
					max: 10000,
				});
			});

			test('builds money field with label and required', () => {
				const result = field.money().label('Amount').required().build();
				expect(result.label).toBe('Amount');
				expect(result.required).toBe(true);
			});
		});

		describe('AddressField builder - success cases', () => {
			test('builds valid address field', () => {
				const result = field.address().build();
				expect(result).toEqual({ type: 'address' });
			});

			test('builds address field with label and required', () => {
				const result = field.address().label('Billing Address').required().build();
				expect(result).toEqual({
					type: 'address',
					label: 'Billing Address',
					required: true,
				});
			});
		});

		describe('PhoneField builder - success cases', () => {
			test('builds valid phone field', () => {
				const result = field.phone().build();
				expect(result).toEqual({ type: 'phone' });
			});

			test('builds phone field with label', () => {
				const result = field.phone().label('Mobile Number').required().build();
				expect(result).toEqual({
					type: 'phone',
					label: 'Mobile Number',
					required: true,
				});
			});
		});

		describe('CoordinateField builder - success cases', () => {
			test('builds valid coordinate field', () => {
				const result = field.coordinate().build();
				expect(result).toEqual({ type: 'coordinate' });
			});

			test('builds coordinate field with label', () => {
				const result = field.coordinate().label('Location').build();
				expect(result.label).toBe('Location');
			});
		});

		describe('BboxField builder - success cases', () => {
			test('builds valid bbox field', () => {
				const result = field.bbox().build();
				expect(result).toEqual({ type: 'bbox' });
			});

			test('builds bbox field with label', () => {
				const result = field.bbox().label('Area').build();
				expect(result.label).toBe('Area');
			});
		});

		describe('DurationField builder - success cases', () => {
			test('builds valid duration field', () => {
				const result = field.duration().build();
				expect(result).toEqual({ type: 'duration' });
			});

			test('builds duration field with label', () => {
				const result = field.duration().label('Time Period').build();
				expect(result.label).toBe('Time Period');
			});
		});

		describe('UuidField builder - success cases', () => {
			test('builds valid uuid field', () => {
				const result = field.uuid().build();
				expect(result).toEqual({ type: 'uuid' });
			});

			test('builds uuid field with constraints', () => {
				const result = field.uuid().minLength(36).maxLength(36).build();
				expect(result.minLength).toBe(36);
				expect(result.maxLength).toBe(36);
			});
		});

		describe('UriField builder - success cases', () => {
			test('builds valid uri field', () => {
				const result = field.uri().build();
				expect(result).toEqual({ type: 'uri' });
			});

			test('builds uri field with constraints', () => {
				const result = field.uri().label('Website').maxLength(500).build();
				expect(result.label).toBe('Website');
				expect(result.maxLength).toBe(500);
			});
		});

		describe('FieldsetField builder - success cases', () => {
			test('builds fieldset with nested text fields', () => {
				const result = field
					.fieldset()
					.fields({
						firstName: field.text().label('First Name').build(),
						lastName: field.text().label('Last Name').build(),
					})
					.build();
				expect(result.type).toBe('fieldset');
				expect(result.fields!.firstName!.type).toBe('text');
				expect(result.fields!.lastName!.type).toBe('text');
			});

			test('builds fieldset with mixed field types', () => {
				const result = field
					.fieldset()
					.label('Personal Information')
					.fields({
						name: field.text().label('Name').build(),
						age: field.number().label('Age').min(0).build(),
						email: field.email().label('Email').build(),
						subscribe: field.boolean().label('Subscribe').build(),
					})
					.build();
				expect(Object.keys(result.fields!)).toHaveLength(4);
				expect((result.fields as any).age.min).toBe(0);
			});

			test('builds nested fieldsets (recursive)', () => {
				const result = field
					.fieldset()
					.label('Contact')
					.fields({
						personal: field
							.fieldset()
							.label('Personal')
							.fields({
								name: field.text().build(),
								age: field.number().build(),
							})
							.build(),
						address: field
							.fieldset()
							.label('Address')
							.fields({
								street: field.text().build(),
								city: field.text().build(),
							})
							.build(),
					})
					.build();
				expect(result.fields!.personal!.type).toBe('fieldset');
				expect(result.fields!.address!.type).toBe('fieldset');
			});
		});

		describe('validation failures on build()', () => {
			test('throws error when enum has no values', () => {
				expect(() => field.enum().build()).toThrow();
			});

			test('throws error when label exceeds maxLength', () => {
				expect(() => field.text().label('a'.repeat(201)).build()).toThrow();
			});

			test('throws error when description exceeds maxLength', () => {
				expect(() =>
					field.text().description('a'.repeat(1001)).build(),
				).toThrow();
			});

			test('throws error when pattern exceeds maxLength', () => {
				expect(() => field.text().pattern('a'.repeat(501)).build()).toThrow();
			});
		});

		describe('builder instance behavior', () => {
			test('returns builder instance when called with no arguments', () => {
				const builder = field.text();
				expect(builder).toBeDefined();
				expect(typeof builder.label).toBe('function');
				expect(typeof builder.build).toBe('function');
			});

			test('builder methods return this for chaining', () => {
				const builder = field.text();
				const afterLabel = builder.label('Test');
				const afterRequired = afterLabel.required();
				expect(afterLabel).toBe(builder);
				expect(afterRequired).toBe(builder);
			});

			test('multiple builders are independent', () => {
				const builder1 = field.text().label('Field 1');
				const builder2 = field.text().label('Field 2');
				expect(builder1.build().label).toBe('Field 1');
				expect(builder2.build().label).toBe('Field 2');
			});

			test('builder can be reused after build', () => {
				const builder = field.text().label('Test');
				const result1 = builder.build();
				const result2 = builder.build();
				expect(result1).toEqual(result2);
			});

			test('modifying builder after build affects subsequent builds', () => {
				const builder = field.text().label('Original');
				const result1 = builder.build();
				builder.label('Modified');
				const result2 = builder.build();
				expect(result1.label).toBe('Original');
				expect(result2.label).toBe('Modified');
			});
		});

		describe('builder pattern vs object pattern comparison', () => {
			test('builder pattern produces same result as object pattern', () => {
				const builderResult = field
					.text()
					.label('Name')
					.required(true)
					.build();
				const objectResult = field({
					type: 'text',
					label: 'Name',
					required: true,
				});
				expect(builderResult).toEqual(objectResult);
			});

			test('builder validates on build(), object validates immediately', () => {
				// Builder - no error until build()
				const builder = field.enum();
				expect(() => builder.build()).toThrow();

				// Object - error immediately
				expect(() => field({ type: 'enum', enum: [] } as any)).toThrow();
			});
		});

		describe('common usage patterns', () => {
			test('creates required text input', () => {
				const result = field
					.text()
					.label('Full Name')
					.required()
					.maxLength(100)
					.build();
				expect(result.required).toBe(true);
				expect(result.maxLength).toBe(100);
			});

			test('creates age number field', () => {
				const result = field.number().label('Age').min(0).max(120).build();
				expect(result.min).toBe(0);
				expect(result.max).toBe(120);
			});

			test('creates email field with validation', () => {
				const result = field
					.email()
					.label('Email Address')
					.required()
					.maxLength(255)
					.build();
				expect(result.type).toBe('email');
				expect(result.required).toBe(true);
			});

			test('creates enum for dropdown', () => {
				const result = field
					.enum()
					.label('Country')
					.enum('US', 'CA', 'MX', 'UK')
					.build();
				expect(result.enum).toHaveLength(4);
			});

			test('creates optional description field', () => {
				const result = field
					.text()
					.label('Description')
					.maxLength(500)
					.required(false)
					.build();
				expect(result.required).toBe(false);
			});
		});
	});
});
