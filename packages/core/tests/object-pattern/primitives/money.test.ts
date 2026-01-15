import { describe, test, expect } from 'vitest';
import { money } from '@/builders/primitives/money';
import type { Money } from '@/schemas/primitives';

describe('Money (Object Pattern)', () => {
	describe('money() - direct validation', () => {
		describe('success cases', () => {
			test('creates valid money with positive amount', () => {
				const input: Money = { amount: 99.99, currency: 'USD' };
				const result = money(input);
				expect(result).toEqual({ amount: 99.99, currency: 'USD' });
			});

			test('creates valid money with negative amount (debt/credit)', () => {
				const input: Money = { amount: -50.25, currency: 'GBP' };
				const result = money(input);
				expect(result).toEqual({ amount: -50.25, currency: 'GBP' });
			});

			test('creates valid money with zero amount', () => {
				const input: Money = { amount: 0, currency: 'EUR' };
				const result = money(input);
				expect(result).toEqual({ amount: 0, currency: 'EUR' });
			});

			test('creates valid money with decimal amount', () => {
				const input: Money = { amount: 250.75, currency: 'CAD' };
				const result = money(input);
				expect(result).toEqual({ amount: 250.75, currency: 'CAD' });
			});

			test('creates valid money with integer amount', () => {
				const input: Money = { amount: 1500, currency: 'JPY' };
				const result = money(input);
				expect(result).toEqual({ amount: 1500, currency: 'JPY' });
			});

			test('creates valid money with various ISO 4217 currencies', () => {
				const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];

				for (const curr of currencies) {
					const input: Money = { amount: 100, currency: curr };
					const result = money(input);
					expect(result).toEqual({ amount: 100, currency: curr });
				}
			});

			test('creates valid money with very large positive amount', () => {
				const input: Money = { amount: 9007199254740991, currency: 'USD' }; // MAX_SAFE_INTEGER
				const result = money(input);
				expect(result).toEqual({ amount: 9007199254740991, currency: 'USD' });
			});

			test('creates valid money with very large negative amount', () => {
				const input: Money = { amount: -9007199254740991, currency: 'USD' }; // MIN_SAFE_INTEGER
				const result = money(input);
				expect(result).toEqual({ amount: -9007199254740991, currency: 'USD' });
			});

			test('creates valid money with very small decimal amount', () => {
				const input: Money = { amount: 0.01, currency: 'USD' };
				const result = money(input);
				expect(result).toEqual({ amount: 0.01, currency: 'USD' });
			});

			test('creates valid money with many decimal places', () => {
				const input: Money = { amount: 99.999999, currency: 'USD' };
				const result = money(input);
				expect(result).toEqual({ amount: 99.999999, currency: 'USD' });
			});
		});

		describe('validation failures', () => {
			test('throws error when amount is missing', () => {
				const input = { currency: 'USD' } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when currency is missing', () => {
				const input = { amount: 100 } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when both fields are missing', () => {
				const input = {} as any;
				expect(() => money(input)).toThrow();
			});

			test('coerces string amount to number (TypeBox behavior)', () => {
				const input = { amount: '100', currency: 'USD' } as any;
				const result = money(input);
				expect(result).toEqual({ amount: 100, currency: 'USD' });
			});

			test('throws error when amount is null', () => {
				const input = { amount: null, currency: 'USD' } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when amount is undefined', () => {
				const input = { amount: undefined, currency: 'USD' } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when amount is an object', () => {
				const input = { amount: { value: 100 }, currency: 'USD' } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when amount is an array', () => {
				const input = { amount: [100], currency: 'USD' } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when currency is a number', () => {
				const input = { amount: 100, currency: 123 } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when currency is null', () => {
				const input = { amount: 100, currency: null } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when currency is undefined', () => {
				const input = { amount: 100, currency: undefined } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when currency is an object', () => {
				const input = { amount: 100, currency: { code: 'USD' } } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when currency is an array', () => {
				const input = { amount: 100, currency: ['USD'] } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when currency is too short (1 char)', () => {
				const input = { amount: 100, currency: 'U' } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when currency is too short (2 chars)', () => {
				const input = { amount: 100, currency: 'US' } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when currency is too long (4 chars)', () => {
				const input = { amount: 100, currency: 'USDD' } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when currency is too long (5+ chars)', () => {
				const input = { amount: 100, currency: 'DOLLAR' } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when currency has lowercase letters', () => {
				const input = { amount: 100, currency: 'usd' } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when currency has mixed case', () => {
				const input = { amount: 100, currency: 'Usd' } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when currency has numbers', () => {
				const input = { amount: 100, currency: 'US1' } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when currency has special characters', () => {
				const input = { amount: 100, currency: 'US$' } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when currency has spaces', () => {
				const input = { amount: 100, currency: 'U S' } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when currency has trailing space', () => {
				const input = { amount: 100, currency: 'USD ' } as any;
				expect(() => money(input)).toThrow();
			});

			test('throws error when currency has leading space', () => {
				const input = { amount: 100, currency: ' USD' } as any;
				expect(() => money(input)).toThrow();
			});

			test('strips additional properties (TypeBox behavior)', () => {
				const input = { amount: 100, currency: 'USD', extra: 'field' } as any;
				const result = money(input);
				expect(result).toEqual({ amount: 100, currency: 'USD' });
				expect(result).not.toHaveProperty('extra');
			});

			test('throws error when input is null', () => {
				expect(() => money(null as any)).toThrow();
			});

			test('returns builder when input is undefined (TypeBox behavior)', () => {
				const result = money(undefined as any);
				// When undefined is passed, it returns a MoneyBuilder instance
				expect(result).toBeDefined();
				expect(typeof result.amount).toBe('function');
			});

			test('throws error when input is a string', () => {
				expect(() => money('not an object' as any)).toThrow();
			});

			test('throws error when input is a number', () => {
				expect(() => money(123 as any)).toThrow();
			});

			test('throws error when input is an array', () => {
				expect(() => money([{ amount: 100, currency: 'USD' }] as any)).toThrow();
			});
		});
	});

	describe('money.parse()', () => {
		describe('success cases', () => {
			test('parses valid money object', () => {
				const input = { amount: 99.99, currency: 'USD' };
				const result = money.parse(input);
				expect(result).toEqual({ amount: 99.99, currency: 'USD' });
			});

			test('parses money with negative amount', () => {
				const input = { amount: -50.25, currency: 'GBP' };
				const result = money.parse(input);
				expect(result).toEqual({ amount: -50.25, currency: 'GBP' });
			});

			test('parses money with zero amount', () => {
				const input = { amount: 0, currency: 'EUR' };
				const result = money.parse(input);
				expect(result).toEqual({ amount: 0, currency: 'EUR' });
			});

			test('parses money with various currencies', () => {
				const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];

				for (const curr of currencies) {
					const input = { amount: 100, currency: curr };
					const result = money.parse(input);
					expect(result).toEqual({ amount: 100, currency: curr });
				}
			});
		});

		describe('validation failures', () => {
			test('throws error when amount is missing', () => {
				const input = { currency: 'USD' };
				expect(() => money.parse(input)).toThrow();
			});

			test('throws error when currency is missing', () => {
				const input = { amount: 100 };
				expect(() => money.parse(input)).toThrow();
			});

			test('throws error when currency pattern is invalid', () => {
				const input = { amount: 100, currency: 'usd' };
				expect(() => money.parse(input)).toThrow();
			});

			test('throws error when currency length is invalid', () => {
				const input = { amount: 100, currency: 'US' };
				expect(() => money.parse(input)).toThrow();
			});

			test('strips additional properties (TypeBox behavior)', () => {
				const input = { amount: 100, currency: 'USD', extra: 'value' };
				const result = money.parse(input);
				expect(result).toEqual({ amount: 100, currency: 'USD' });
				expect(result).not.toHaveProperty('extra');
			});

			test('throws error when input is null', () => {
				expect(() => money.parse(null)).toThrow();
			});

			test('throws error when input is undefined', () => {
				expect(() => money.parse(undefined)).toThrow();
			});

			test('throws error when input is not an object', () => {
				expect(() => money.parse('string')).toThrow();
			});
		});
	});

	describe('money.safeParse()', () => {
		describe('success cases', () => {
			test('returns success result for valid money', () => {
				const input = { amount: 99.99, currency: 'USD' };
				const result = money.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({ amount: 99.99, currency: 'USD' });
				}
			});

			test('returns success result for negative amount', () => {
				const input = { amount: -50.25, currency: 'GBP' };
				const result = money.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({ amount: -50.25, currency: 'GBP' });
				}
			});

			test('returns success result for zero amount', () => {
				const input = { amount: 0, currency: 'EUR' };
				const result = money.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({ amount: 0, currency: 'EUR' });
				}
			});

			test('returns success result for various currencies', () => {
				const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];

				for (const curr of currencies) {
					const input = { amount: 100, currency: curr };
					const result = money.safeParse(input);

					expect(result.success).toBe(true);
					if (result.success) {
						expect(result.data).toEqual({ amount: 100, currency: curr });
					}
				}
			});
		});

		describe('failure cases - returns error object', () => {
			test('returns error when amount is missing', () => {
				const input = { currency: 'USD' };
				const result = money.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when currency is missing', () => {
				const input = { amount: 100 };
				const result = money.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when both fields are missing', () => {
				const input = {};
				const result = money.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('coerces string amount to number (TypeBox behavior)', () => {
				const input = { amount: '100', currency: 'USD' };
				const result = money.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({ amount: 100, currency: 'USD' });
				}
			});

			test('returns error when currency has wrong type', () => {
				const input = { amount: 100, currency: 123 };
				const result = money.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when currency is too short', () => {
				const input = { amount: 100, currency: 'US' };
				const result = money.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when currency is too long', () => {
				const input = { amount: 100, currency: 'USDD' };
				const result = money.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when currency has lowercase letters', () => {
				const input = { amount: 100, currency: 'usd' };
				const result = money.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when currency has mixed case', () => {
				const input = { amount: 100, currency: 'Usd' };
				const result = money.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when currency has numbers', () => {
				const input = { amount: 100, currency: 'US1' };
				const result = money.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when currency has special characters', () => {
				const input = { amount: 100, currency: 'US$' };
				const result = money.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('strips additional properties (TypeBox behavior)', () => {
				const input = { amount: 100, currency: 'USD', extra: 'field' };
				const result = money.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({ amount: 100, currency: 'USD' });
					expect(result.data).not.toHaveProperty('extra');
				}
			});

			test('returns error when input is null', () => {
				const result = money.safeParse(null);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when input is undefined', () => {
				const result = money.safeParse(undefined);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when input is not an object', () => {
				const result = money.safeParse('not an object');

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when input is an array', () => {
				const result = money.safeParse([{ amount: 100, currency: 'USD' }]);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});
		});
	});
});
