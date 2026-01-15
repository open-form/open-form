import { describe, test, expect } from 'vitest';
import { identification } from '@/builders/primitives/identification';
import type { Identification } from '@/schemas/primitives';

describe('Identification (Object Pattern)', () => {
	describe('identification() - direct validation', () => {
		test('creates valid identification with type and number', () => {
			const input: Identification = { type: 'passport', number: 'A123456789' };
			const result = identification(input);
			expect(result).toEqual(input);
		});

		test('creates valid identification with optional fields', () => {
			const input: Identification = {
				type: 'passport',
				number: 'A123456789',
				issuer: 'US',
			};
			const result = identification(input);
			expect(result).toEqual(input);
		});

		test('throws error when type is missing', () => {
			const input = { number: 'A123456789' } as any;
			expect(() => identification(input)).toThrow();
		});

		test('throws error when number is missing', () => {
			const input = { type: 'passport' } as any;
			expect(() => identification(input)).toThrow();
		});

		test('throws error when type is empty', () => {
			const input = { type: '', number: 'A123456789' } as any;
			expect(() => identification(input)).toThrow();
		});
	});

	describe('identification.parse()', () => {
		test('parses valid identification', () => {
			const input = { type: 'ssn', number: '123-45-6789' };
			const result = identification.parse(input);
			expect(result).toEqual(input);
		});
	});

	describe('identification.safeParse()', () => {
		test('returns success for valid identification', () => {
			const input = {
				type: 'license',
				number: 'D1234567',
				issuer: 'CA',
			};
			const result = identification.safeParse(input);
			expect(result.success).toBe(true);
		});

		test('returns error when type is missing', () => {
			const input = { number: 'A123456789' };
			const result = identification.safeParse(input);
			expect(result.success).toBe(false);
		});
	});
});
