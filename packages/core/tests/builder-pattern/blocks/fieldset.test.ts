import { describe, test, expect } from 'vitest';
import { fieldset } from '@/builders/blocks/fieldset';
import { field } from '@/builders/blocks/field';

describe('Fieldset (Builder Pattern)', () => {
	describe('fluent builder API', () => {
		describe('success cases', () => {
			test('builds valid fieldset with minimal config', () => {
				const result = fieldset('personal-info')
					.field('name', field.text().build())
					.build();
				expect(result.id).toBe('personal-info');
				expect(result.fields!.name!.type).toBe('text');
			});

			test('builds fieldset with title', () => {
				const result = fieldset('contact-info')
					.title('Contact Information')
					.field('email', field.email().build())
					.build();
				expect(result.title).toBe('Contact Information');
			});

			test('builds fieldset with description', () => {
				const result = fieldset('address-section')
					.title('Address')
					.description('Enter your mailing address')
					.fields({
						street: field.text().build(),
						city: field.text().build(),
					})
					.build();
				expect(result.description).toBe('Enter your mailing address');
			});

			test('builds fieldset with multiple fields using fields() method', () => {
				const result = fieldset('profile')
					.fields({
						name: field.text().label('Full Name').build(),
						age: field.number().label('Age').min(0).max(120).build(),
						email: field.email().label('Email').build(),
						subscribe: field.boolean().label('Subscribe').build(),
					})
					.build();
				expect(Object.keys(result.fields!)).toHaveLength(4);
				expect(result.fields!.name!.label).toBe('Full Name');
			});

			test('builds fieldset with multiple fields using field() method', () => {
				const result = fieldset('profile')
					.field('name', field.text().label('Full Name').build())
					.field('age', field.number().label('Age').build())
					.field('email', field.email().label('Email').build())
					.build();
				expect(Object.keys(result.fields)).toHaveLength(3);
			});

			test('builds fieldset with required flag', () => {
				const result = fieldset('required-section')
					.field('field1', field.text().build())
					.required()
					.build();
				expect(result.required).toBe(true);
			});

			test('builds fieldset with explicit required false', () => {
				const result = fieldset('optional-section')
					.field('field1', field.text().build())
					.required(false)
					.build();
				expect(result.required).toBe(false);
			});

			test('builds fieldset with order', () => {
				const result = fieldset('section-1')
					.field('field1', field.text().build())
					.order(1)
					.build();
				expect(result.order).toBe(1);
			});

			test('builds fieldset with all properties', () => {
				const result = fieldset('complete-section')
					.title('Complete Information')
					.description('All required fields')
					.fields({
						name: field.text().label('Name').required().build(),
						email: field.email().label('Email').required().build(),
					})
					.required()
					.order(1)
					.build();
				expect(result.id).toBe('complete-section');
				expect(result.title).toBe('Complete Information');
				expect(result.required).toBe(true);
				expect(result.order).toBe(1);
			});

			test('builds fieldset with nested fieldset', () => {
				const result = fieldset('parent')
					.field(
						'personal',
						field
							.fieldset()
							.label('Personal Info')
							.fields({
								name: field.text().build(),
								age: field.number().build(),
							})
							.build(),
					)
					.build();
				expect(result.fields!.personal!.type).toBe('fieldset');
				const fields = result.fields as any;
				expect(fields.personal.fields.name.type).toBe('text');
			});

			test('builds fieldset with deeply nested fieldsets', () => {
				const result = fieldset('root')
					.field(
						'level1',
						field
							.fieldset()
							.fields({
								level2: field
									.fieldset()
									.fields({
										name: field.text().build(),
									})
									.build(),
							})
							.build(),
					)
					.build();
				const fields = result.fields as any;
				expect(fields.level1.fields.level2.type).toBe('fieldset');
			});

			test('builds fieldset with various field types', () => {
				const result = fieldset('varied-fields')
					.fields({
						textField: field.text().build(),
						numberField: field.number().build(),
						booleanField: field.boolean().build(),
						emailField: field.email().build(),
						enumField: field.enum().options(['a', 'b', 'c']).build(),
						moneyField: field.money().build(),
						addressField: field.address().build(),
						phoneField: field.phone().build(),
						coordinateField: field.coordinate().build(),
					})
					.build();
				expect(Object.keys(result.fields)).toHaveLength(9);
			});

			test('supports method chaining', () => {
				const result = fieldset('test')
					.title('Test')
					.description('Description')
					.required()
					.order(1)
					.field('name', field.text().build())
					.build();
				expect(result.title).toBe('Test');
				expect(result.description).toBe('Description');
			});

			test('allows overwriting title', () => {
				const result = fieldset('test')
					.title('Original')
					.title('Updated')
					.field('name', field.text().build())
					.build();
				expect(result.title).toBe('Updated');
			});

			test('allows overwriting description', () => {
				const result = fieldset('test')
					.description('Original')
					.description('Updated')
					.field('name', field.text().build())
					.build();
				expect(result.description).toBe('Updated');
			});

			test('allows adding fields incrementally', () => {
				const builder = fieldset('incremental')
					.field('field1', field.text().build())
					.field('field2', field.number().build());
				const result = builder.build();
				expect(Object.keys(result.fields)).toHaveLength(2);
			});

			test('allows mixing field() and fields() methods', () => {
				const result = fieldset('mixed')
					.field('field1', field.text().build())
					.fields({
						field2: field.number().build(),
						field3: field.boolean().build(),
					})
					.field('field4', field.email().build())
					.build();
				expect(Object.keys(result.fields)).toHaveLength(4);
			});

			test('builds fieldset with order value 0', () => {
				const result = fieldset('first')
					.field('field1', field.text().build())
					.order(0)
					.build();
				expect(result.order).toBe(0);
			});

			test('builds fieldset with large order value', () => {
				const result = fieldset('last')
					.field('field1', field.text().build())
					.order(9999)
					.build();
				expect(result.order).toBe(9999);
			});

			test('builds fieldset with undefined title', () => {
				const result = fieldset('test')
					.title(undefined)
					.field('field1', field.text().build())
					.build();
				expect(result.title).toBeUndefined();
			});

			test('builds fieldset with undefined description', () => {
				const result = fieldset('test')
					.description(undefined)
					.field('field1', field.text().build())
					.build();
				expect(result.description).toBeUndefined();
			});

			test('builds fieldset with undefined order', () => {
				const result = fieldset('test')
					.order(undefined)
					.field('field1', field.text().build())
					.build();
				expect(result.order).toBeUndefined();
			});
		});

		describe('validation failures on build()', () => {
			test('throws error when id is empty string', () => {
				expect(() =>
					fieldset('').field('field1', field.text().build()).build(),
				).toThrow();
			});

			test('throws error when id exceeds maxLength', () => {
				expect(() =>
					fieldset('a'.repeat(101))
						.field('field1', field.text().build())
						.build(),
				).toThrow();
			});

			test('throws error when id has invalid pattern (starts with dash)', () => {
				expect(() =>
					fieldset('-invalid').field('field1', field.text().build()).build(),
				).toThrow();
			});

			test('throws error when id has invalid pattern (starts with underscore)', () => {
				expect(() =>
					fieldset('_invalid').field('field1', field.text().build()).build(),
				).toThrow();
			});

			test('throws error when id has special characters', () => {
				expect(() =>
					fieldset('invalid@id').field('field1', field.text().build()).build(),
				).toThrow();
			});

			test('throws error when id has spaces', () => {
				expect(() =>
					fieldset('invalid id').field('field1', field.text().build()).build(),
				).toThrow();
			});

			test('throws error when title is empty string', () => {
				expect(() =>
					fieldset('test')
						.title('')
						.field('field1', field.text().build())
						.build(),
				).toThrow();
			});

			test('throws error when title exceeds maxLength', () => {
				expect(() =>
					fieldset('test')
						.title('a'.repeat(201))
						.field('field1', field.text().build())
						.build(),
				).toThrow();
			});

			test('throws error when description is empty string', () => {
				expect(() =>
					fieldset('test')
						.description('')
						.field('field1', field.text().build())
						.build(),
				).toThrow();
			});

			test('throws error when description exceeds maxLength', () => {
				expect(() =>
					fieldset('test')
						.description('a'.repeat(1001))
						.field('field1', field.text().build())
						.build(),
				).toThrow();
			});

			test('throws error when order is negative', () => {
				expect(() =>
					fieldset('test')
						.field('field1', field.text().build())
						.order(-1)
						.build(),
				).toThrow();
			});

			test('throws error when field definition is invalid', () => {
				expect(() =>
					fieldset('test').field('invalid', { type: 'invalid' } as any).build(),
				).toThrow();
			});
		});

		describe('builder instance behavior', () => {
			test('returns builder instance when called with id', () => {
				const builder = fieldset('test');
				expect(builder).toBeDefined();
				expect(typeof builder.title).toBe('function');
				expect(typeof builder.field).toBe('function');
				expect(typeof builder.fields).toBe('function');
				expect(typeof builder.build).toBe('function');
			});

			test('builder methods return this for chaining', () => {
				const builder = fieldset('test');
				const afterTitle = builder.title('Test');
				const afterField = afterTitle.field('name', field.text().build());
				expect(afterTitle).toBe(builder);
				expect(afterField).toBe(builder);
			});

			test('multiple builders are independent', () => {
				const builder1 = fieldset('test1').title('Test 1');
				const builder2 = fieldset('test2').title('Test 2');
				builder1.field('field1', field.text().build());
				builder2.field('field2', field.number().build());
				expect(builder1.build().id).toBe('test1');
				expect(builder2.build().id).toBe('test2');
			});

			test('builder can be reused after build', () => {
				const builder = fieldset('test').field('name', field.text().build());
				const result1 = builder.build();
				const result2 = builder.build();
				expect(result1).toEqual(result2);
			});

			test('modifying builder after build affects subsequent builds', () => {
				const builder = fieldset('test').title('Original');
				builder.field('field1', field.text().build());
				const result1 = builder.build();

				builder.title('Modified');
				const result2 = builder.build();

				expect(result1.title).toBe('Original');
				expect(result2.title).toBe('Modified');
			});
		});

		describe('builder pattern vs object pattern comparison', () => {
			test('builder pattern produces same result as object pattern', () => {
				const builderResult = fieldset('test')
					.title('Test Section')
					.field('name', field.text().label('Name').build())
					.required()
					.build();

				const objectResult = fieldset({
					id: 'test',
					title: 'Test Section',
					fields: {
						name: { type: 'text', label: 'Name' },
					},
					required: true,
				});

				expect(builderResult).toEqual(objectResult);
			});

			test('builder validates on build(), object validates immediately', () => {
				// Builder - no error until build()
				const builder = fieldset('test');
				expect(() => builder.title('').build()).toThrow();

				// Object - error immediately
				expect(() =>
					fieldset({
						id: 'test',
						title: '',
						fields: { field1: { type: 'text' } },
					} as any),
				).toThrow();
			});
		});

		describe('common usage patterns', () => {
			test('creates personal information section', () => {
				const result = fieldset('personal-info')
					.title('Personal Information')
					.description('Please provide your personal details')
					.fields({
						firstName: field.text().label('First Name').required().build(),
						lastName: field.text().label('Last Name').required().build(),
						email: field.email().label('Email').required().build(),
						phone: field.phone().label('Phone Number').build(),
					})
					.required()
					.order(1)
					.build();

				expect(result.id).toBe('personal-info');
				expect(Object.keys(result.fields)).toHaveLength(4);
			});

			test('creates address section', () => {
				const result = fieldset('address')
					.title('Address')
					.fields({
						street: field.text().label('Street Address').required().build(),
						city: field.text().label('City').required().build(),
						state: field.text().label('State').build(),
						zip: field.text().label('ZIP Code').build(),
					})
					.build();

				expect(Object.keys(result.fields)).toHaveLength(4);
			});

			test('creates nested contact information', () => {
				const result = fieldset('contact')
					.title('Contact Information')
					.field(
						'personal',
						field
							.fieldset()
							.label('Personal Contact')
							.fields({
								email: field.email().label('Email').build(),
								phone: field.phone().label('Phone').build(),
							})
							.build(),
					)
					.field(
						'business',
						field
							.fieldset()
							.label('Business Contact')
							.fields({
								email: field.email().label('Business Email').build(),
								phone: field.phone().label('Business Phone').build(),
							})
							.build(),
					)
					.build();

				expect(result.fields!.personal!.type).toBe('fieldset');
				expect(result.fields!.business!.type).toBe('fieldset');
			});

			test('creates optional preferences section', () => {
				const result = fieldset('preferences')
					.title('Preferences')
					.description('Optional settings')
					.fields({
						newsletter: field.boolean().label('Subscribe to newsletter').build(),
						notifications: field.boolean().label('Enable notifications').build(),
						theme: field.enum().label('Theme').options(['light', 'dark']).build(),
					})
					.required(false)
					.order(99)
					.build();

				expect(result.required).toBe(false);
				expect(result.order).toBe(99);
			});
		});
	});
});
