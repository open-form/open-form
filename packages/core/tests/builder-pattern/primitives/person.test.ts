import { describe, test, expect } from 'vitest';
import { person } from '@/builders/primitives/person';

describe('Person (Builder Pattern)', () => {
	describe('fluent builder API', () => {
		describe('success cases', () => {
			test('builds valid person with fullName only', () => {
				const result = person().fullName('John Doe').build();
				expect(result).toEqual({ fullName: 'John Doe' });
			});

			test('builds valid person with all fields', () => {
				const result = person()
					.fullName('Dr. Jane Marie Smith Jr.')
					.title('Dr.')
					.firstName('Jane')
					.middleName('Marie')
					.lastName('Smith')
					.suffix('Jr.')
					.build();
				expect(result).toEqual({
					fullName: 'Dr. Jane Marie Smith Jr.',
					title: 'Dr.',
					firstName: 'Jane',
					middleName: 'Marie',
					lastName: 'Smith',
					suffix: 'Jr.',
				});
			});

			test('builds valid person with some optional fields', () => {
				const result = person()
					.fullName('Robert Johnson III')
					.firstName('Robert')
					.lastName('Johnson')
					.suffix('III')
					.build();
				expect(result).toEqual({
					fullName: 'Robert Johnson III',
					firstName: 'Robert',
					lastName: 'Johnson',
					suffix: 'III',
				});
			});

			test('supports method chaining', () => {
				const result = person()
					.fullName('John Doe')
					.firstName('John')
					.lastName('Doe')
					.build();
				expect(result).toEqual({
					fullName: 'John Doe',
					firstName: 'John',
					lastName: 'Doe',
				});
			});

			test('allows overwriting fullName', () => {
				const result = person().fullName('Jane').fullName('John Doe').build();
				expect(result).toEqual({ fullName: 'John Doe' });
			});
		});

		describe('validation failures on build()', () => {
			test('throws error when fullName is not set', () => {
				expect(() => person().firstName('John').build()).toThrow();
			});

			test('throws error when fullName is empty string', () => {
				expect(() => person().fullName('').build()).toThrow();
			});

			test('throws error when fullName exceeds max length', () => {
				expect(() => person().fullName('a'.repeat(201)).build()).toThrow();
			});
		});

		describe('builder instance behavior', () => {
			test('returns PersonBuilder instance', () => {
				const builder = person();
				expect(builder).toBeDefined();
				expect(typeof builder.fullName).toBe('function');
				expect(typeof builder.title).toBe('function');
				expect(typeof builder.firstName).toBe('function');
				expect(typeof builder.middleName).toBe('function');
				expect(typeof builder.lastName).toBe('function');
				expect(typeof builder.suffix).toBe('function');
				expect(typeof builder.build).toBe('function');
			});

			test('builder methods return this for chaining', () => {
				const builder = person();
				const afterFullName = builder.fullName('John Doe');
				expect(afterFullName).toBe(builder);
			});

			test('multiple builders are independent', () => {
				const builder1 = person().fullName('John Doe');
				const builder2 = person().fullName('Jane Smith');

				expect(builder1.build()).toEqual({ fullName: 'John Doe' });
				expect(builder2.build()).toEqual({ fullName: 'Jane Smith' });
			});
		});

		describe('builder pattern vs object pattern comparison', () => {
			test('builder pattern produces same result as object pattern', () => {
				const builderResult = person().fullName('John Doe').build();
				const objectResult = person({ fullName: 'John Doe' });

				expect(builderResult).toEqual(objectResult);
			});
		});
	});
});
