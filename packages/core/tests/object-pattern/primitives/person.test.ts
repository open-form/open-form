import { describe, test, expect } from 'vitest';
import { person } from '@/builders/primitives/person';
import type { Person } from '@/schemas/primitives';

describe('Person (Object Pattern)', () => {
	describe('person() - direct validation', () => {
		describe('success cases', () => {
			test('creates valid person with fullName only', () => {
				const input: Person = { fullName: 'John Doe' };
				const result = person(input);
				expect(result).toEqual({ fullName: 'John Doe' });
			});

			test('creates valid person with all fields', () => {
				const input: Person = {
					fullName: 'Dr. Jane Marie Smith Jr.',
					title: 'Dr.',
					firstName: 'Jane',
					middleName: 'Marie',
					lastName: 'Smith',
					suffix: 'Jr.',
				};
				const result = person(input);
				expect(result).toEqual(input);
			});

			test('creates valid person with some optional fields', () => {
				const input: Person = {
					fullName: 'Robert Johnson III',
					firstName: 'Robert',
					lastName: 'Johnson',
					suffix: 'III',
				};
				const result = person(input);
				expect(result).toEqual(input);
			});

			test('creates valid person with minimum length fullName', () => {
				const input: Person = { fullName: 'A' };
				const result = person(input);
				expect(result).toEqual({ fullName: 'A' });
			});

			test('creates valid person with maximum length fullName', () => {
				const input: Person = { fullName: 'a'.repeat(200) };
				const result = person(input);
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
