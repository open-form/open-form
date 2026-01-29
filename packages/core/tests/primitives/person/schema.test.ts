import { describe, test, expect } from 'vitest';
import { person } from '@/primitives/person';
import type { Person } from '@open-form/types';

describe('Person', () => {
	// ============================================================================
	// Object Pattern Tests
	// ============================================================================

	describe('Object Pattern', () => {
		describe('person() - direct validation', () => {
			describe('success cases', () => {
				test('creates valid person with fullName only', () => {
					const input = { fullName: 'John Doe' };
					const result = person(input as any);
					expect(result).toEqual({ fullName: 'John Doe' });
				});

				test('creates valid person with all fields', () => {
					const input = {
						fullName: 'Dr. Jane Marie Smith Jr.',
						title: 'Dr.',
						firstName: 'Jane',
						middleName: 'Marie',
						lastName: 'Smith',
						suffix: 'Jr.',
					};
					const result = person(input as any);
					expect(result).toEqual(input);
				});

				test('creates valid person with some optional fields', () => {
					const input = {
						fullName: 'Robert Johnson III',
						firstName: 'Robert',
						lastName: 'Johnson',
						suffix: 'III',
					};
					const result = person(input as any);
					expect(result).toEqual(input);
				});

				test('creates valid person with minimum length fullName', () => {
					const input = { fullName: 'A' };
					const result = person(input as any);
					expect(result).toEqual({ fullName: 'A' });
				});

				test('creates valid person with maximum length fullName', () => {
					const input = { fullName: 'a'.repeat(200) };
					const result = person(input as any);
					expect(result).toEqual({ fullName: 'a'.repeat(200) });
				});
			});

			describe('validation failures', () => {
				test('throws error when fullName is missing', () => {
					const input = { firstName: 'John' } as any;
					expect(() => person(input)).toThrow();
				});

				test('throws error when fullName is empty string', () => {
					const input = { fullName: '' } as any;
					expect(() => person(input)).toThrow();
				});

				test('throws error when fullName exceeds max length', () => {
					const input = { fullName: 'a'.repeat(201) } as any;
					expect(() => person(input)).toThrow();
				});

				test('throws error when fullName is null', () => {
					const input = { fullName: null } as any;
					expect(() => person(input)).toThrow();
				});

				test('strips additional properties (TypeBox behavior)', () => {
					const input = {
						fullName: 'John Doe',
						extra: 'field',
					} as any;
					const result = person(input);
					expect(result).toEqual({ fullName: 'John Doe' });
					expect(result).not.toHaveProperty('extra');
				});

				test('throws error when input is null', () => {
					expect(() => person(null as any)).toThrow();
				});

				test('returns builder when input is undefined', () => {
					const result = person(undefined as any);
					expect(result).toBeDefined();
					expect(typeof result.fullName).toBe('function');
				});
			});
		});

		describe('person.parse()', () => {
			test('parses valid person object', () => {
				const input = { fullName: 'John Doe' };
				const result = person.parse(input);
				expect(result).toEqual({ fullName: 'John Doe' });
			});

			test('throws error when fullName is missing', () => {
				const input = { firstName: 'John' };
				expect(() => person.parse(input)).toThrow();
			});

			test('strips additional properties', () => {
				const input = { fullName: 'John Doe', extra: 'value' };
				const result = person.parse(input);
				expect(result).toEqual({ fullName: 'John Doe' });
			});
		});

		describe('person.safeParse()', () => {
			test('returns success for valid person', () => {
				const input = { fullName: 'John Doe', firstName: 'John' };
				const result = person.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({ fullName: 'John Doe', firstName: 'John' });
				}
			});

			test('returns error when fullName is missing', () => {
				const input = { firstName: 'John' };
				const result = person.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when fullName is empty', () => {
				const input = { fullName: '' };
				const result = person.safeParse(input);

				expect(result.success).toBe(false);
			});
		});
	});

	// ============================================================================
	// Builder Pattern Tests
	// ============================================================================

	describe('Builder Pattern', () => {
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
					const objectResult = person({ fullName: 'John Doe' } as any);

					expect(builderResult).toEqual(objectResult);
				});
			});
		});
	});
});
