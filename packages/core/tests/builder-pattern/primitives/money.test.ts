import { describe, test, expect } from 'vitest';
import { money } from '@/builders/primitives/money';

describe('Money (Builder Pattern)', () => {
	describe('fluent builder API', () => {
		describe('success cases', () => {
			test('builds valid money with positive amount', () => {
				const result = money().amount(99.99).currency('USD').build();
				expect(result).toEqual({ amount: 99.99, currency: 'USD' });
			});

			test('builds valid money with negative amount (debt/credit)', () => {
				const result = money().amount(-50.25).currency('GBP').build();
				expect(result).toEqual({ amount: -50.25, currency: 'GBP' });
			});

			test('builds valid money with zero amount', () => {
				const result = money().amount(0).currency('EUR').build();
				expect(result).toEqual({ amount: 0, currency: 'EUR' });
			});

			test('builds valid money with decimal amount', () => {
				const result = money().amount(250.75).currency('CAD').build();
				expect(result).toEqual({ amount: 250.75, currency: 'CAD' });
			});

			test('builds valid money with integer amount', () => {
				const result = money().amount(1500).currency('JPY').build();
				expect(result).toEqual({ amount: 1500, currency: 'JPY' });
			});

			test('builds valid money with various ISO 4217 currencies', () => {
				const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];

				for (const curr of currencies) {
					const result = money().amount(100).currency(curr).build();
					expect(result).toEqual({ amount: 100, currency: curr });
				}
			});

			test('builds valid money with very large positive amount', () => {
				const result = money().amount(9007199254740991).currency('USD').build(); // MAX_SAFE_INTEGER
				expect(result).toEqual({ amount: 9007199254740991, currency: 'USD' });
			});

			test('builds valid money with very large negative amount', () => {
				const result = money().amount(-9007199254740991).currency('USD').build(); // MIN_SAFE_INTEGER
				expect(result).toEqual({ amount: -9007199254740991, currency: 'USD' });
			});

			test('builds valid money with very small decimal amount', () => {
				const result = money().amount(0.01).currency('USD').build();
				expect(result).toEqual({ amount: 0.01, currency: 'USD' });
			});

			test('builds valid money with many decimal places', () => {
				const result = money().amount(99.999999).currency('USD').build();
				expect(result).toEqual({ amount: 99.999999, currency: 'USD' });
			});

			test('supports method chaining', () => {
				const result = money().amount(100).currency('USD').build();
				expect(result).toEqual({ amount: 100, currency: 'USD' });
			});

			test('supports reverse order of method calls', () => {
				const result = money().currency('USD').amount(100).build();
				expect(result).toEqual({ amount: 100, currency: 'USD' });
			});

			test('allows overwriting amount', () => {
				const result = money().amount(50).amount(100).currency('USD').build();
				expect(result).toEqual({ amount: 100, currency: 'USD' });
			});

			test('allows overwriting currency', () => {
				const result = money().amount(100).currency('EUR').currency('USD').build();
				expect(result).toEqual({ amount: 100, currency: 'USD' });
			});
		});

		describe('validation failures on build()', () => {
			test('throws error when amount is not set', () => {
				expect(() => money().currency('USD').build()).toThrow();
			});

			test('throws error when currency is not set', () => {
				expect(() => money().amount(100).build()).toThrow();
			});

			test('throws error when neither field is set', () => {
				expect(() => money().build()).toThrow();
			});

			test('throws error when currency is too short (1 char)', () => {
				expect(() => money().amount(100).currency('U').build()).toThrow();
			});

			test('throws error when currency is too short (2 chars)', () => {
				expect(() => money().amount(100).currency('US').build()).toThrow();
			});

			test('throws error when currency is too long (4 chars)', () => {
				expect(() => money().amount(100).currency('USDD').build()).toThrow();
			});

			test('throws error when currency is too long (5+ chars)', () => {
				expect(() => money().amount(100).currency('DOLLAR').build()).toThrow();
			});

			test('throws error when currency has lowercase letters', () => {
				expect(() => money().amount(100).currency('usd').build()).toThrow();
			});

			test('throws error when currency has mixed case', () => {
				expect(() => money().amount(100).currency('Usd').build()).toThrow();
			});

			test('throws error when currency has numbers', () => {
				expect(() => money().amount(100).currency('US1').build()).toThrow();
			});

			test('throws error when currency has special characters', () => {
				expect(() => money().amount(100).currency('US$').build()).toThrow();
			});

			test('throws error when currency has spaces', () => {
				expect(() => money().amount(100).currency('U S').build()).toThrow();
			});

			test('throws error when currency has trailing space', () => {
				expect(() => money().amount(100).currency('USD ').build()).toThrow();
			});

			test('throws error when currency has leading space', () => {
				expect(() => money().amount(100).currency(' USD').build()).toThrow();
			});

			test('throws error when currency is empty string', () => {
				expect(() => money().amount(100).currency('').build()).toThrow();
			});
		});

		describe('builder instance behavior', () => {
			test('returns MoneyBuilder instance when called with no arguments', () => {
				const builder = money();
				expect(builder).toBeDefined();
				expect(typeof builder.amount).toBe('function');
				expect(typeof builder.currency).toBe('function');
				expect(typeof builder.build).toBe('function');
			});

			test('builder methods return this for chaining', () => {
				const builder = money();
				const afterAmount = builder.amount(100);
				const afterCurrency = afterAmount.currency('USD');

				expect(afterAmount).toBe(builder);
				expect(afterCurrency).toBe(builder);
			});

			test('multiple builders are independent', () => {
				const builder1 = money().amount(100).currency('USD');
				const builder2 = money().amount(200).currency('EUR');

				expect(builder1.build()).toEqual({ amount: 100, currency: 'USD' });
				expect(builder2.build()).toEqual({ amount: 200, currency: 'EUR' });
			});

			test('builder can be reused after build', () => {
				const builder = money().amount(100).currency('USD');
				const result1 = builder.build();
				const result2 = builder.build();

				expect(result1).toEqual({ amount: 100, currency: 'USD' });
				expect(result2).toEqual({ amount: 100, currency: 'USD' });
			});

			test('modifying builder after build affects subsequent builds', () => {
				const builder = money().amount(100).currency('USD');
				const result1 = builder.build();

				builder.amount(200);
				const result2 = builder.build();

				expect(result1).toEqual({ amount: 100, currency: 'USD' });
				expect(result2).toEqual({ amount: 200, currency: 'USD' });
			});
		});

		describe('edge cases and special scenarios', () => {
			test('handles floating point precision', () => {
				const result = money().amount(0.1 + 0.2).currency('USD').build();
				expect(result.amount).toBeCloseTo(0.3);
			});

			test('preserves exact decimal values', () => {
				const result = money().amount(123.456789).currency('USD').build();
				expect(result.amount).toBe(123.456789);
			});

			test('handles negative zero', () => {
				const result = money().amount(-0).currency('USD').build();
				expect(result).toEqual({ amount: 0, currency: 'USD' });
			});

			test('handles Infinity amount (should throw on build)', () => {
				expect(() => money().amount(Infinity).currency('USD').build()).toThrow();
			});

			test('handles -Infinity amount (should throw on build)', () => {
				expect(() => money().amount(-Infinity).currency('USD').build()).toThrow();
			});

			test('handles NaN amount (should throw on build)', () => {
				expect(() => money().amount(NaN).currency('USD').build()).toThrow();
			});
		});

		describe('TypeScript type safety scenarios', () => {
			test('accepts valid number for amount', () => {
				const result = money().amount(100).currency('USD').build();
				expect(result.amount).toBe(100);
			});

			test('accepts valid string for currency', () => {
				const result = money().amount(100).currency('USD').build();
				expect(result.currency).toBe('USD');
			});

			// These tests document the runtime behavior even though TypeScript would catch them
			test('coerces string amount to number at build time (runtime behavior)', () => {
				const builder = money();
				(builder as any).amount('100');
				builder.currency('USD');
				const result = builder.build();
				expect(result).toEqual({ amount: 100, currency: 'USD' });
			});

			test('validates currency pattern at build time', () => {
				const builder = money();
				builder.amount(100);
				(builder as any).currency('invalid');
				expect(() => builder.build()).toThrow();
			});
		});

		describe('common usage patterns', () => {
			test('creates USD amount', () => {
				const result = money().amount(99.99).currency('USD').build();
				expect(result).toEqual({ amount: 99.99, currency: 'USD' });
			});

			test('creates EUR amount', () => {
				const result = money().amount(150.5).currency('EUR').build();
				expect(result).toEqual({ amount: 150.5, currency: 'EUR' });
			});

			test('creates GBP amount', () => {
				const result = money().amount(75.25).currency('GBP').build();
				expect(result).toEqual({ amount: 75.25, currency: 'GBP' });
			});

			test('creates JPY amount (typically no decimals)', () => {
				const result = money().amount(10000).currency('JPY').build();
				expect(result).toEqual({ amount: 10000, currency: 'JPY' });
			});

			test('creates debt/negative amount', () => {
				const result = money().amount(-1000.5).currency('USD').build();
				expect(result).toEqual({ amount: -1000.5, currency: 'USD' });
			});

			test('creates zero balance', () => {
				const result = money().amount(0).currency('USD').build();
				expect(result).toEqual({ amount: 0, currency: 'USD' });
			});
		});

		describe('builder pattern vs object pattern comparison', () => {
			test('builder pattern produces same result as object pattern', () => {
				const builderResult = money().amount(100).currency('USD').build();
				const objectResult = money({ amount: 100, currency: 'USD' });

				expect(builderResult).toEqual(objectResult);
			});

			test('builder pattern validates on build(), object pattern validates immediately', () => {
				// Builder - no error until build()
				const builder = money().amount(100).currency('invalid');
				expect(() => builder.build()).toThrow();

				// Object - error immediately
				expect(() => money({ amount: 100, currency: 'invalid' } as any)).toThrow();
			});
		});

		describe('partial builder state', () => {
			test('builder can exist with no fields set', () => {
				const builder = money();
				expect(builder).toBeDefined();
			});

			test('builder can exist with only amount set', () => {
				const builder = money().amount(100);
				expect(builder).toBeDefined();
				expect(() => builder.build()).toThrow(); // But build fails
			});

			test('builder can exist with only currency set', () => {
				const builder = money().currency('USD');
				expect(builder).toBeDefined();
				expect(() => builder.build()).toThrow(); // But build fails
			});

			test('builder validates only on build() call', () => {
				const builder = money();
				// No error setting invalid currency
				(builder as any).currency(123);
				// Error only on build
				expect(() => builder.build()).toThrow();
			});
		});
	});
});
