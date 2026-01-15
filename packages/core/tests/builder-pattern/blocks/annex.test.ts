import { describe, test, expect } from 'vitest';
import { annex } from '@/builders/blocks/annex';

describe('Annex (Builder Pattern)', () => {
	describe('fluent builder API', () => {
		describe('success cases', () => {
			test('builds valid annex with minimal config', () => {
				const result = annex().id('exhibit-a').title('Exhibit A').build();
				expect(result.id).toBe('exhibit-a');
				expect(result.title).toBe('Exhibit A');
			});

			test('builds annex with description', () => {
				const result = annex()
					.id('appendix-b')
					.title('Appendix B')
					.description('Technical specifications and requirements')
					.build();
				expect(result.description).toBe(
					'Technical specifications and requirements',
				);
			});

			test('builds annex with required flag', () => {
				const result = annex()
					.id('mandatory-annex')
					.title('Mandatory Annex')
					.required()
					.build();
				expect(result.required).toBe(true);
			});

			test('builds annex with explicit required false', () => {
				const result = annex()
					.id('optional-annex')
					.title('Optional Annex')
					.required(false)
					.build();
				expect(result.required).toBe(false);
			});

			test('builds annex with all properties', () => {
				const result = annex()
					.id('complete-annex')
					.title('Complete Annex')
					.description('A complete annex example')
					.required()
					.build();
				expect(result.id).toBe('complete-annex');
				expect(result.title).toBe('Complete Annex');
				expect(result.description).toBe('A complete annex example');
				expect(result.required).toBe(true);
			});

			test('supports method chaining', () => {
				const result = annex()
					.id('test')
					.title('Test')
					.description('Description')
					.required()
					.build();
				expect(result.title).toBe('Test');
				expect(result.description).toBe('Description');
				expect(result.required).toBe(true);
			});

			test('allows overwriting description', () => {
				const result = annex()
					.id('test')
					.title('Test')
					.description('Original')
					.description('Updated')
					.build();
				expect(result.description).toBe('Updated');
			});

			test('builds annex without any optional properties', () => {
				const result = annex().id('minimal').title('Minimal').build();
				expect(result.id).toBe('minimal');
				expect(result.title).toBe('Minimal');
				expect(result.description).toBeUndefined();
				expect(result.required).toBeUndefined();
			});
		});

		describe('validation failures on build()', () => {
			test('throws error when id is empty string', () => {
				expect(() => annex().id('').title('Test').build()).toThrow();
			});

			test('throws error when title is empty string', () => {
				expect(() => annex().id('test').title('').build()).toThrow();
			});

			test('throws error when id exceeds maxLength', () => {
				expect(() => annex().id('a'.repeat(101)).title('Test').build()).toThrow();
			});

			test('throws error when title exceeds maxLength', () => {
				expect(() => annex().id('test').title('a'.repeat(201)).build()).toThrow();
			});

			test('throws error when id has invalid pattern (starts with dash)', () => {
				expect(() => annex().id('-invalid').title('Test').build()).toThrow();
			});

			test('throws error when id has invalid pattern (starts with underscore)', () => {
				expect(() => annex().id('_invalid').title('Test').build()).toThrow();
			});

			test('throws error when id has special characters', () => {
				expect(() => annex().id('invalid@id').title('Test').build()).toThrow();
			});

			test('throws error when id has spaces', () => {
				expect(() => annex().id('invalid id').title('Test').build()).toThrow();
			});

			test('throws error when description is empty string', () => {
				expect(() => annex().id('test').title('Test').description('').build()).toThrow();
			});

			test('throws error when description exceeds maxLength', () => {
				expect(() =>
					annex().id('test').title('Test').description('a'.repeat(1001)).build(),
				).toThrow();
			});
		});

		describe('builder instance behavior', () => {
			test('returns builder instance when called with no args', () => {
				const builder = annex();
				expect(builder).toBeDefined();
				expect(typeof builder.id).toBe('function');
				expect(typeof builder.title).toBe('function');
				expect(typeof builder.description).toBe('function');
				expect(typeof builder.required).toBe('function');
				expect(typeof builder.build).toBe('function');
			});

			test('builder methods return this for chaining', () => {
				const builder = annex();
				const afterId = builder.id('test');
				const afterTitle = afterId.title('Test');
				const afterDescription = afterTitle.description('Description');
				const afterRequired = afterDescription.required();
				expect(afterId).toBe(builder);
				expect(afterTitle).toBe(builder);
				expect(afterDescription).toBe(builder);
				expect(afterRequired).toBe(builder);
			});

			test('multiple builders are independent', () => {
				const builder1 = annex().id('test1').title('Test 1');
				const builder2 = annex().id('test2').title('Test 2');
				expect(builder1.build().id).toBe('test1');
				expect(builder2.build().id).toBe('test2');
				expect(builder1.build().title).toBe('Test 1');
				expect(builder2.build().title).toBe('Test 2');
			});

			test('builder can be reused after build', () => {
				const builder = annex().id('test').title('Test Title');
				const result1 = builder.build();
				const result2 = builder.build();
				expect(result1).toEqual(result2);
			});

			test('modifying builder after build affects subsequent builds', () => {
				const builder = annex().id('test').title('Test').description('Original');
				const result1 = builder.build();

				builder.description('Modified');
				const result2 = builder.build();

				expect(result1.description).toBe('Original');
				expect(result2.description).toBe('Modified');
			});
		});

		describe('builder pattern vs object pattern comparison', () => {
			test('builder pattern produces same result as object pattern', () => {
				const builderResult = annex()
					.id('test')
					.title('Test Annex')
					.description('Test description')
					.required()
					.build();

				const objectResult = annex({
					id: 'test',
					title: 'Test Annex',
					description: 'Test description',
					required: true,
				});

				expect(builderResult).toEqual(objectResult);
			});

			test('builder validates on build(), object validates immediately', () => {
				// Builder - no error until build()
				const builder = annex().id('test').title('Test');
				expect(() => builder.description('').build()).toThrow();

				// Object - error immediately
				expect(() =>
					annex({
						id: 'test',
						title: 'Test',
						description: '',
					} as any),
				).toThrow();
			});
		});

		describe('common usage patterns', () => {
			test('creates required exhibit annex', () => {
				const result = annex()
					.id('exhibit-a')
					.title('Exhibit A - Financial Statements')
					.description('Annual financial statements for 2023')
					.required()
					.build();

				expect(result.id).toBe('exhibit-a');
				expect(result.required).toBe(true);
			});

			test('creates schedule annex', () => {
				const result = annex()
					.id('schedule-1')
					.title('Schedule 1: Payment Terms')
					.description('Detailed payment schedule and terms')
					.build();

				expect(result.id).toBe('schedule-1');
				expect(result.title).toBe('Schedule 1: Payment Terms');
			});

			test('creates appendix annex', () => {
				const result = annex()
					.id('appendix-b')
					.title('Appendix B: Technical Specifications')
					.description('Technical requirements document')
					.build();

				expect(result.id).toBe('appendix-b');
			});

			test('creates optional annex', () => {
				const result = annex()
					.id('optional-attachment')
					.title('Optional Supporting Documentation')
					.description('May be provided at a later date')
					.required(false)
					.build();

				expect(result.required).toBe(false);
			});

			test('creates mandatory annex', () => {
				const result = annex()
					.id('required-doc')
					.title('Required Documentation')
					.required()
					.build();

				expect(result.required).toBe(true);
			});
		});
	});
});
