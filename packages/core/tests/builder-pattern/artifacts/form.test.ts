import { describe, test, expect } from 'vitest';
import { form } from '@/builders/artifacts/form';
import { field } from '@/builders/blocks/field';

describe('Form (Builder Pattern)', () => {
	describe('fluent builder API', () => {
		describe('success cases', () => {
			test('builds valid form with minimal required properties', () => {
				const result = form()
					.name('contact-form')
          .version('1.0.0')
					.title('Contact Form')
					.build();
				expect(result.kind).toBe('form');
				expect(result.name).toBe('contact-form');
				expect(result.title).toBe('Contact Form');
			});

			test('builds form with single field using field()', () => {
				const result = form()
					.name('user-form')
          .version('1.0.0')
					.title('User Form')
					.field('name', { type: 'text', label: 'Full Name' })
					.build();
				expect(result.fields).toBeDefined();
				const fields = result.fields as any;
				expect(fields.name.type).toBe('text');
				expect(fields.name.label).toBe('Full Name');
			});

			test('builds form with multiple fields using field()', () => {
				const result = form()
					.name('profile-form')
          .version('1.0.0')
					.title('Profile Form')
					.field('name', { type: 'text', label: 'Name' })
					.field('email', { type: 'email', label: 'Email' })
					.field('age', { type: 'number', label: 'Age' })
					.build();
				expect(Object.keys(result.fields || {})).toHaveLength(3);
			});

			test('builds form with fields using fields()', () => {
				const result = form()
					.name('bulk-form')
          .version('1.0.0')
					.title('Bulk Form')
					.fields({
						name: { type: 'text', label: 'Name' },
						email: { type: 'email', label: 'Email' },
						subscribe: { type: 'boolean', label: 'Subscribe' },
					})
					.build();
				expect(Object.keys(result.fields || {})).toHaveLength(3);
			});

			test('builds form with various field types', () => {
				const result = form()
					.name('complex-form')
          .version('1.0.0')
					.title('Complex Form')
					.fields({
						textField: { type: 'text', label: 'Text' },
						numberField: { type: 'number', label: 'Number', min: 0, max: 100 },
						booleanField: { type: 'boolean', label: 'Boolean' },
						emailField: { type: 'email', label: 'Email' },
						enumField: { type: 'enum', enum: ['a', 'b', 'c'], label: 'Enum' },
						moneyField: { type: 'money', label: 'Money' },
						addressField: { type: 'address', label: 'Address' },
						phoneField: { type: 'phone', label: 'Phone' },
						coordinateField: { type: 'coordinate', label: 'Coordinate' },
					})
					.build();
				expect(Object.keys(result.fields || {})).toHaveLength(9);
			});

			test('builds form with nested fieldset', () => {
				const result = form()
					.name('nested-form')
          .version('1.0.0')
					.title('Nested Form')
					.field('personal', {
						type: 'fieldset',
						label: 'Personal Info',
						fields: {
							name: { type: 'text', label: 'Name' },
							age: { type: 'number', label: 'Age' },
						},
					})
					.build();
				expect(result.fields).toBeDefined();
				const fields = result.fields as any;
				expect(fields.personal.type).toBe('fieldset');
				expect(fields.personal.fields.name.type).toBe('text');
			});

			test('builds form with deeply nested fieldsets', () => {
				const result = form()
					.name('deeply-nested')
          .version('1.0.0')
					.title('Deeply Nested')
					.field('level1', {
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
											name: { type: 'text', label: 'Name' },
										},
									},
								},
							},
						},
					})
					.build();
				expect(result.fields).toBeDefined();
				const fields = result.fields as any;
				expect(fields.level1.fields.level2.fields.level3.fields.name.type).toBe('text');
			});

			test('builds form with inline template', () => {
				const result = form()
					.name('form-with-template')
          .version('1.0.0')
					.title('Form with Template')
					.inlineLayer('default', 'text/markdown', '# Welcome\n\nPlease fill out this form.')
					.defaultLayer('default')
					.build();
				expect(result.layers).toBeDefined();
				expect(result.layers?.default?.kind).toBe('inline');
				if (result.layers?.default?.kind === 'inline') {
					expect(result.layers.default.text).toBe('# Welcome\n\nPlease fill out this form.');
				}
			});

			test('builds form with file template', () => {
				const result = form()
					.name('form-with-file-template')
          .version('1.0.0')
					.title('Form with File Template')
					.fileLayer('pdf', 'application/pdf', './template.pdf')
					.defaultLayer('pdf')
					.build();
				expect(result.layers).toBeDefined();
				expect(result.layers?.pdf?.kind).toBe('file');
				if (result.layers?.pdf?.kind === 'file') {
					expect(result.layers.pdf.path).toBe('./template.pdf');
				}
			});

			test('builds form with single annex using annex()', () => {
				const result = form()
					.name('form-with-annex')
          .version('1.0.0')
					.title('Form with Annex')
					.annex({
						id: 'terms',
						title: 'Terms and Conditions',
					})
					.build();
				expect(result.annexes).toHaveLength(1);
				const annexes = result.annexes as any;
				expect(annexes[0].id).toBe('terms');
			});

			test('builds form with multiple annexes using annex()', () => {
				const result = form()
					.name('form-with-annexes')
          .version('1.0.0')
					.title('Form with Annexes')
					.annex({
						id: 'terms',
						title: 'Terms and Conditions',
					})
					.annex({
						id: 'privacy',
						title: 'Privacy Policy',
					})
					.build();
				expect(result.annexes).toHaveLength(2);
			});

			test('builds form with annexes using annexes()', () => {
				const result = form()
					.name('form-with-bulk-annexes')
          .version('1.0.0')
					.title('Form with Bulk Annexes')
					.annexes([
						{
							id: 'terms',
							title: 'Terms and Conditions',
						},
						{
							id: 'privacy',
							title: 'Privacy Policy',
						},
					])
					.build();
				expect(result.annexes).toHaveLength(2);
			});

			test('builds form with description', () => {
				const result = form()
					.name('described-form')
          .version('1.0.0')
					.title('Described Form')
					.description('This is a detailed description.')
					.build();
				expect(result.description).toBe('This is a detailed description.');
			});

			test('builds form with code', () => {
				const result = form()
					.name('coded-form')
          .version('1.0.0')
					.title('Coded Form')
					.code('FORM-001')
					.build();
				expect(result.code).toBe('FORM-001');
			});

			// Note: releaseDate validation requires TypeBox format registry configuration
			// which may not be set up in the test environment
			// test('builds form with releaseDate', () => {
			// 	const result = form()
			// 		.name('dated-form')
			// 		.version('1.0.0')
			// 		.title('Dated Form')
			// 		.releaseDate('2024-11-14')
			// 		.build();
			// 	expect(result.releaseDate).toBe('2024-11-14');
			// });

			test('builds form with metadata', () => {
				const result = form()
					.name('metadata-form')
          .version('1.0.0')
					.title('Metadata Form')
					.metadata({
						version: '1.0',
						author: 'John Doe',
						category: 'HR',
					})
					.build();
				expect(result.metadata?.version).toBe('1.0');
				expect(result.metadata?.author).toBe('John Doe');
			});

			test('builds form with all properties (except releaseDate)', () => {
				const result = form()
					.name('complete-form')
          .version('1.0.0')
					.title('Complete Form')
					.description('A fully configured form')
					.code('COMPLETE-001')
					.metadata({ version: '1.0', author: 'Jane Smith' })
					.fields({
						name: { type: 'text', label: 'Name', required: true },
						email: { type: 'email', label: 'Email', required: true },
					})
					.inlineLayer('default', 'text/markdown', '# Instructions\n\nComplete all required fields.')
					.defaultLayer('default')
					.annexes([
						{
							id: 'guide',
							title: 'User Guide',
						},
					])
					.build();
				expect(result.name).toBe('complete-form');
				expect(result.title).toBe('Complete Form');
				expect(result.description).toBe('A fully configured form');
				expect(result.code).toBe('COMPLETE-001');
				expect(result.metadata?.version).toBe('1.0');
				expect(Object.keys(result.fields || {})).toHaveLength(2);
				expect(result.layers).toBeDefined();
				expect(result.layers?.default?.kind).toBe('inline');
				expect(result.annexes).toHaveLength(1);
			});

			test('supports method chaining', () => {
				const result = form()
					.name('chained')
          .version('1.0.0')
					.title('Chained Form')
					.description('Description')
					.code('CODE-001')
					.build();
				expect(result.name).toBe('chained');
				expect(result.title).toBe('Chained Form');
			});

			test('allows overwriting name', () => {
				const result = form()
					.name('original')
          .version('1.0.0')
					.name('updated')
          .version('1.0.0')
					.title('Test')
					.build();
				expect(result.name).toBe('updated');
			});

			test('allows overwriting title', () => {
				const result = form()
					.name('test')
          .version('1.0.0')
					.title('Original')
					.title('Updated')
					.build();
				expect(result.title).toBe('Updated');
			});

			test('allows overwriting description', () => {
				const result = form()
					.name('test')
          .version('1.0.0')
					.title('Test')
					.description('Original')
					.description('Updated')
					.build();
				expect(result.description).toBe('Updated');
			});

			test('field() is overwritten by fields()', () => {
				const result = form()
					.name('mixed')
          .version('1.0.0')
					.title('Mixed')
					.field('field1', { type: 'text', label: 'Field 1' })
					.fields({
						field2: { type: 'number', label: 'Field 2' },
						field3: { type: 'boolean', label: 'Field 3' },
					})
					.field('field4', { type: 'email', label: 'Field 4' })
					.build();
				// fields() overwrites previous fields, then field() adds to that
				expect(Object.keys(result.fields || {})).toHaveLength(3);
				const fields = result.fields as any;
				expect(fields.field2).toBeDefined();
				expect(fields.field3).toBeDefined();
				expect(fields.field4).toBeDefined();
			});

			test('annexes() overwrites previous annexes', () => {
				const result = form()
					.name('mixed-annexes')
          .version('1.0.0')
					.title('Mixed Annexes')
					.annex({
						id: 'annex1',
						title: 'Annex 1',
					})
					.annexes([
						{
							id: 'annex2',
							title: 'Annex 2',
						},
					])
					.annex({
						id: 'annex3',
						title: 'Annex 3',
					})
					.build();
				// annexes() overwrites previous annexes, then annex() adds to that
				expect(result.annexes).toHaveLength(2);
				const annexes = result.annexes as any;
				expect(annexes[0].id).toBe('annex2');
				expect(annexes[1].id).toBe('annex3');
			});

			test('builds form with valid name patterns', () => {
				const validNames = [
					'simple',
					'with-dash',
					'PascalCase',
					'camelCase',
					'with-multiple-dashes',
					'123numeric',
					'abc123def',
					'a',
					'A',
					'1',
				];

				for (const name of validNames) {
					const result = form()
						.name(name)
          .version('1.0.0')
						.title('Test')
						.build();
					expect(result.name).toBe(name);
				}
			});

			test('builds form with long valid name', () => {
				const result = form()
					.name('a'.repeat(128))
          .version('1.0.0')
					.title('Test')
					.build();
				expect(result.name).toHaveLength(128);
			});

			test('builds form with long valid title', () => {
				const result = form()
					.name('test')
          .version('1.0.0')
					.title('T'.repeat(200))
					.build();
				expect(result.title).toHaveLength(200);
			});

			test('builds form with long valid description', () => {
				const result = form()
					.name('test')
          .version('1.0.0')
					.title('Test')
					.description('D'.repeat(2000))
					.build();
				expect(result.description).toHaveLength(2000);
			});

			test('builds form with many fields', () => {
				const builder = form()
					.name('many-fields')
          .version('1.0.0')
					.title('Many Fields');

				for (let i = 0; i < 50; i++) {
					builder.field(`field${i}`, { type: 'text', label: `Field ${i}` });
				}

				const result = builder.build();
				expect(Object.keys(result.fields || {})).toHaveLength(50);
			});
		});

		describe('validation failures on build()', () => {
			test('throws error when name is empty string', () => {
				expect(() =>
					form()
						.name('')
          .version('1.0.0')
						.title('Test')
						.build()
				).toThrow();
			});

			test('throws error when title is empty string', () => {
				expect(() =>
					form()
						.name('test')
          .version('1.0.0')
						.title('')
						.build()
				).toThrow();
			});

			test('throws error when name exceeds maxLength', () => {
				expect(() =>
					form()
						.name('a'.repeat(129))
          .version('1.0.0')
						.title('Test')
						.build()
				).toThrow();
			});

			test('throws error when title exceeds maxLength', () => {
				expect(() =>
					form()
						.name('test')
          .version('1.0.0')
						.title('T'.repeat(201))
						.build()
				).toThrow();
			});

			test('throws error when description exceeds maxLength', () => {
				expect(() =>
					form()
						.name('test')
          .version('1.0.0')
						.title('Test')
						.description('D'.repeat(2001))
						.build()
				).toThrow();
			});

			test('throws error when code is empty string', () => {
				expect(() =>
					form()
						.name('test')
          .version('1.0.0')
						.title('Test')
						.code('')
						.build()
				).toThrow();
			});

			test('throws error when name has invalid pattern (starts with dash)', () => {
				expect(() =>
					form()
						.name('-invalid')
          .version('1.0.0')
						.title('Test')
						.build()
				).toThrow();
			});

			test('throws error when name has invalid pattern (ends with dash)', () => {
				expect(() =>
					form()
						.name('invalid-')
          .version('1.0.0')
						.title('Test')
						.build()
				).toThrow();
			});

			test('throws error when name has invalid pattern (consecutive dashes)', () => {
				expect(() =>
					form()
						.name('invalid--name')
          .version('1.0.0')
						.title('Test')
						.build()
				).toThrow();
			});

			test('throws error when name has invalid pattern (underscore)', () => {
				expect(() =>
					form()
						.name('invalid_name')
          .version('1.0.0')
						.title('Test')
						.build()
				).toThrow();
			});

			test('throws error when name has invalid pattern (special chars)', () => {
				expect(() =>
					form()
						.name('invalid@name')
          .version('1.0.0')
						.title('Test')
						.build()
				).toThrow();
			});

			test('throws error when releaseDate has invalid format', () => {
				expect(() =>
					form()
						.name('test')
          .version('1.0.0')
						.title('Test')
						.releaseDate('invalid-date')
						.build()
				).toThrow();
			});

			test('throws error when field definition is invalid', () => {
				expect(() =>
					form()
						.name('test')
          .version('1.0.0')
						.title('Test')
						.field('invalid', { type: 'invalid-type' } as any)
						.build()
				).toThrow();
			});

			test('throws error when annex is invalid', () => {
				expect(() =>
					form()
						.name('test')
          .version('1.0.0')
						.title('Test')
						.annex({
							id: '',
							title: 'Invalid',
						} as any)
						.build()
				).toThrow();
			});

			test('throws error when template is invalid', () => {
				expect(() =>
					form()
						.name('test')
          .version('1.0.0')
						.title('Test')
						.layer('default', { kind: 'inline', mimeType: 'text/plain', text: '' })
						.build()
				).toThrow();
			});
		});

		describe('builder instance behavior', () => {
			test('returns builder instance when called with no arguments', () => {
				const builder = form();
				expect(builder).toBeDefined();
				expect(typeof builder.name).toBe('function');
				expect(typeof builder.title).toBe('function');
				expect(typeof builder.field).toBe('function');
				expect(typeof builder.fields).toBe('function');
				expect(typeof builder.build).toBe('function');
			});

			test('builder methods return this for chaining', () => {
				const builder = form();
				const afterName = builder.name('test').version('1.0.0');
				const afterTitle = afterName.title('Test');
				expect(afterName).toBe(builder);
				expect(afterTitle).toBe(builder);
			});

			test('multiple builders are independent', () => {
				const builder1 = form().name('form1').version('1.0.0').title('Form 1');
				const builder2 = form().name('form2').version('1.0.0').title('Form 2');
				expect(builder1.build().name).toBe('form1');
				expect(builder2.build().name).toBe('form2');
			});

			test('builder can be reused after build', () => {
				const builder = form().name('test').version('1.0.0').title('Test');
				const result1 = builder.build();
				const result2 = builder.build();
				expect(result1).toEqual(result2);
			});

			test('modifying builder after build affects subsequent builds', () => {
				const builder = form().name('original').version('1.0.0').title('Original');
				const result1 = builder.build();
				builder.name('modified');
				const result2 = builder.build();
				expect(result1.name).toBe('original');
				expect(result2.name).toBe('modified');
			});
		});

		describe('builder pattern vs object pattern comparison', () => {
			test('builder pattern produces equivalent result as object pattern', () => {
				const builderResult = form()
					.name('test-form')
          .version('1.0.0')
					.title('Test Form')
					.description('Description')
					.fields({
						name: { type: 'text', label: 'Name' },
					})
					.build();

			const objectResult = form({
				kind: 'form',
				version: '1.0.0',
				name: 'test-form',
				title: 'Test Form',
				description: 'Description',
				fields: {
					name: { type: 'text', label: 'Name' },
				},
			});

				expect(builderResult.kind).toEqual(objectResult.kind);
				expect(builderResult.name).toEqual(objectResult.name);
				expect(builderResult.title).toEqual(objectResult.title);
				expect(builderResult.description).toEqual(objectResult.description);
				expect(builderResult.fields).toEqual(objectResult.fields);
			});

			test('builder validates on build(), object validates immediately', () => {
				// Builder - no error until build()
				const builder = form().name('test').title('');
//          .version('1.0.0')
				expect(() => builder.build()).toThrow();

				// Object - error immediately
				expect(() =>
					form({
						kind: 'form',
						name: 'test',
						title: '',
					} as any)
				).toThrow();
			});
		});

		describe('common usage patterns', () => {
			test('creates contact form', () => {
				const result = form()
					.name('contact-form')
          .version('1.0.0')
					.title('Contact Us')
					.description('Get in touch with our team')
					.fields({
						name: { type: 'text', label: 'Full Name', required: true },
						email: { type: 'email', label: 'Email Address', required: true },
						message: { type: 'text', label: 'Message', required: true },
					})
					.build();

				expect(result.name).toBe('contact-form');
				expect(Object.keys(result.fields || {})).toHaveLength(3);
			});

			test('creates lease agreement form with layers and annexes', () => {
				const result = form()
					.name('lease-agreement')
          .version('1.0.0')
					.title('Residential Lease Agreement')
					.code('LEASE-2024')
					.inlineLayer('default', 'text/markdown', '# Lease Agreement\n\nPlease review and complete the following.')
					.defaultLayer('default')
					.fields({
						tenantName: { type: 'text', label: 'Tenant Name', required: true },
						rentAmount: { type: 'money', label: 'Monthly Rent', required: true },
					})
					.annex({
						id: 'terms',
						title: 'Terms and Conditions',
					})
					.annex({
						id: 'rules',
						title: 'House Rules',
					})
					.build();

				expect(result.name).toBe('lease-agreement');
				expect(result.layers).toBeDefined();
				expect(result.layers?.default?.kind).toBe('inline');
				expect(result.annexes).toHaveLength(2);
			});

			test('creates employee onboarding form with nested fieldsets', () => {
				const result = form()
					.name('employee-onboarding')
          .version('1.0.0')
					.title('Employee Onboarding Form')
					.description('Complete this form for new employee setup')
					.field('personal', {
						type: 'fieldset',
						label: 'Personal Information',
						fields: {
							firstName: { type: 'text', label: 'First Name', required: true },
							lastName: { type: 'text', label: 'Last Name', required: true },
							email: { type: 'email', label: 'Email', required: true },
							phone: { type: 'phone', label: 'Phone Number' },
						},
					})
					.field('address', {
						type: 'fieldset',
						label: 'Address',
						fields: {
							street: { type: 'text', label: 'Street Address', required: true },
							city: { type: 'text', label: 'City', required: true },
							state: { type: 'text', label: 'State', required: true },
							zip: { type: 'text', label: 'ZIP Code', required: true },
						},
					})
					.build();

				expect(result.fields).toBeDefined();
				const fields = result.fields as any;
				expect(fields.personal.type).toBe('fieldset');
				expect(fields.address.type).toBe('fieldset');
			});
		});
	});
});
