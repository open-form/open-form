import { describe, test, expect } from 'vitest';
import { address } from '@/builders/primitives/address';
import type { Address } from '@/schemas/primitives';

describe('Address (Object Pattern)', () => {
	describe('address() - direct validation', () => {
		describe('success cases', () => {
			test('creates valid address with all required fields', () => {
				const input: Address = {
					line1: '123 Main St',
					locality: 'San Francisco',
					region: 'CA',
					postalCode: '94103',
					country: 'US',
				};
				const result = address(input);
				expect(result).toEqual(input);
			});

			test('creates valid address with line2', () => {
				const input: Address = {
					line1: '123 Main St',
					line2: 'Apt 4B',
					locality: 'San Francisco',
					region: 'CA',
					postalCode: '94103',
					country: 'US',
				};
				const result = address(input);
				expect(result).toEqual(input);
			});

			test('creates valid address with various postal codes', () => {
				const postalCodes = ['94103', 'SW1A 1AA', 'K1A-0B1', '28008'];
				for (const code of postalCodes) {
					const input: Address = {
						line1: '123 Main St',
						locality: 'City',
						region: 'Region',
						postalCode: code,
						country: 'US',
					};
					const result = address(input);
					expect(result.postalCode).toBe(code);
				}
			});
		});

		describe('validation failures', () => {
			test('throws error when line1 is missing', () => {
				const input = {
					locality: 'City',
					region: 'Region',
					postalCode: '12345',
					country: 'US',
				} as any;
				expect(() => address(input)).toThrow();
			});

			test('throws error when locality is missing', () => {
				const input = {
					line1: '123 Main St',
					region: 'Region',
					postalCode: '12345',
					country: 'US',
				} as any;
				expect(() => address(input)).toThrow();
			});

			test('throws error when postalCode has invalid pattern', () => {
				const input = {
					line1: '123 Main St',
					locality: 'City',
					region: 'Region',
					postalCode: 'invalid!@#',
					country: 'US',
				} as any;
				expect(() => address(input)).toThrow();
			});

			test('throws error when postalCode is too short', () => {
				const input = {
					line1: '123 Main St',
					locality: 'City',
					region: 'Region',
					postalCode: '12',
					country: 'US',
				} as any;
				expect(() => address(input)).toThrow();
			});

			test('throws error when country is too short', () => {
				const input = {
					line1: '123 Main St',
					locality: 'City',
					region: 'Region',
					postalCode: '12345',
					country: 'U',
				} as any;
				expect(() => address(input)).toThrow();
			});
		});
	});

	describe('address.parse()', () => {
		test('parses valid address', () => {
			const input = {
				line1: '123 Main St',
				locality: 'San Francisco',
				region: 'CA',
				postalCode: '94103',
				country: 'US',
			};
			const result = address.parse(input);
			expect(result).toEqual(input);
		});
	});

	describe('address.safeParse()', () => {
		test('returns success for valid address', () => {
			const input = {
				line1: '123 Main St',
				locality: 'San Francisco',
				region: 'CA',
				postalCode: '94103',
				country: 'US',
			};
			const result = address.safeParse(input);
			expect(result.success).toBe(true);
		});

		test('returns error when required field missing', () => {
			const input = { line1: '123 Main St' };
			const result = address.safeParse(input);
			expect(result.success).toBe(false);
		});
	});
});
