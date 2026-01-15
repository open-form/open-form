import { describe, test, expect } from 'vitest';
import { identification } from '@/builders/primitives/identification';

describe('Identification (Builder Pattern)', () => {
	describe('fluent builder API', () => {
		test('builds valid identification with type and number', () => {
			const result = identification()
				.type('passport')
				.number('A123456789')
				.build();
			expect(result).toEqual({ type: 'passport', number: 'A123456789' });
		});

		test('builds valid identification with optional fields', () => {
			const result = identification()
				.type('passport')
				.number('A123456789')
				.issuer('US')
				.build();
			expect(result).toEqual({
				type: 'passport',
				number: 'A123456789',
				issuer: 'US',
			});
		});

		test('throws error when type is not set', () => {
			expect(() => identification().number('A123456789').build()).toThrow();
		});

		test('throws error when number is not set', () => {
			expect(() => identification().type('passport').build()).toThrow();
		});

		test('throws error when type is empty', () => {
			expect(() =>
				identification().type('').number('A123456789').build(),
			).toThrow();
		});
	});
});
