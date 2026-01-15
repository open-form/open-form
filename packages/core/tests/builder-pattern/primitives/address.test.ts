import { describe, test, expect } from 'vitest';
import { address } from '@/builders/primitives/address';

describe('Address (Builder Pattern)', () => {
	describe('fluent builder API', () => {
		describe('success cases', () => {
			test('builds valid address with all required fields', () => {
				const result = address()
					.line1('123 Main St')
					.locality('San Francisco')
					.region('CA')
					.postalCode('94103')
					.country('US')
					.build();
				expect(result).toEqual({
					line1: '123 Main St',
					locality: 'San Francisco',
					region: 'CA',
					postalCode: '94103',
					country: 'US',
				});
			});

			test('builds valid address with line2', () => {
				const result = address()
					.line1('123 Main St')
					.line2('Apt 4B')
					.locality('San Francisco')
					.region('CA')
					.postalCode('94103')
					.country('US')
					.build();
				expect(result.line2).toBe('Apt 4B');
			});
		});

		describe('validation failures on build()', () => {
			test('throws error when line1 is not set', () => {
				expect(() =>
					address()
						.locality('City')
						.region('Region')
						.postalCode('12345')
						.country('US')
						.build(),
				).toThrow();
			});

			test('throws error when postalCode has invalid pattern', () => {
				expect(() =>
					address()
						.line1('123 Main St')
						.locality('City')
						.region('Region')
						.postalCode('invalid!@#')
						.country('US')
						.build(),
				).toThrow();
			});
		});

		describe('builder pattern vs object pattern comparison', () => {
			test('builder pattern produces same result as object pattern', () => {
				const builderResult = address()
					.line1('123 Main St')
					.locality('San Francisco')
					.region('CA')
					.postalCode('94103')
					.country('US')
					.build();
				const objectResult = address({
					line1: '123 Main St',
					locality: 'San Francisco',
					region: 'CA',
					postalCode: '94103',
					country: 'US',
				});
				expect(builderResult).toEqual(objectResult);
			});
		});
	});
});
