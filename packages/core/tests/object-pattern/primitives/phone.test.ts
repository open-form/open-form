import { describe, test, expect } from 'vitest';
import { phone } from '@/builders/primitives/phone';
import type { Phone } from '@/schemas/primitives';

describe('Phone (Object Pattern)', () => {
	describe('phone() - direct validation', () => {
		describe('success cases', () => {
			test('creates valid phone with number only', () => {
				const input: Phone = { number: '+14155552671' };
				const result = phone(input);
				expect(result).toEqual({ number: '+14155552671' });
			});

			test('creates valid phone with number and type', () => {
				const input: Phone = { number: '+14155552671', type: 'mobile' };
				const result = phone(input);
				expect(result).toEqual({ number: '+14155552671', type: 'mobile' });
			});

			test('creates valid phone with number, type, and extension', () => {
				const input: Phone = {
					number: '+442071234567',
					type: 'work',
					extension: '123',
				};
				const result = phone(input);
				expect(result).toEqual({
					number: '+442071234567',
					type: 'work',
					extension: '123',
				});
			});

			test('creates valid phone with number and extension (no type)', () => {
				const input: Phone = { number: '+442071234567', extension: '456' };
				const result = phone(input);
				expect(result).toEqual({ number: '+442071234567', extension: '456' });
			});

			test('creates valid phone for various countries', () => {
				const phones = [
					{ number: '+14155552671' }, // US
					{ number: '+442071234567' }, // UK
					{ number: '+33123456789' }, // France
					{ number: '+8613800138000' }, // China
					{ number: '+81312345678' }, // Japan
					{ number: '+61212345678' }, // Australia
				];

				for (const p of phones) {
					const result = phone(p);
					expect(result).toEqual(p);
				}
			});

			test('creates valid phone with various types', () => {
				const types = ['mobile', 'work', 'home', 'fax', 'other'];

				for (const t of types) {
					const input: Phone = { number: '+14155552671', type: t };
					const result = phone(input);
					expect(result).toEqual({ number: '+14155552671', type: t });
				}
			});

			test('creates valid phone with minimum length number', () => {
				const input: Phone = { number: '+1234567' }; // 8 chars
				const result = phone(input);
				expect(result).toEqual({ number: '+1234567' });
			});

			test('creates valid phone with maximum length number', () => {
				const input: Phone = { number: '+123456789012345' }; // 16 chars
				const result = phone(input);
				expect(result).toEqual({ number: '+123456789012345' });
			});

			test('creates valid phone with minimum length extension', () => {
				const input: Phone = { number: '+14155552671', extension: '1' };
				const result = phone(input);
				expect(result).toEqual({ number: '+14155552671', extension: '1' });
			});

			test('creates valid phone with maximum length extension', () => {
				const input: Phone = {
					number: '+14155552671',
					extension: '12345678901234567890',
				}; // 20 chars
				const result = phone(input);
				expect(result).toEqual({
					number: '+14155552671',
					extension: '12345678901234567890',
				});
			});

			test('creates valid phone with minimum length type', () => {
				const input: Phone = { number: '+14155552671', type: 'w' };
				const result = phone(input);
				expect(result).toEqual({ number: '+14155552671', type: 'w' });
			});

			test('creates valid phone with maximum length type', () => {
				const input: Phone = {
					number: '+14155552671',
					type: 'a'.repeat(50),
				};
				const result = phone(input);
				expect(result).toEqual({ number: '+14155552671', type: 'a'.repeat(50) });
			});
		});

		describe('validation failures', () => {
			test('throws error when number is missing', () => {
				const input = { type: 'mobile' } as any;
				expect(() => phone(input)).toThrow();
			});

			test('throws error when number is null', () => {
				const input = { number: null } as any;
				expect(() => phone(input)).toThrow();
			});

			test('throws error when number is undefined', () => {
				const input = { number: undefined } as any;
				expect(() => phone(input)).toThrow();
			});

			test('throws error when number lacks + prefix', () => {
				const input = { number: '14155552671' } as any;
				expect(() => phone(input)).toThrow();
			});

			test('throws error when number starts with +0', () => {
				const input = { number: '+01234567890' } as any;
				expect(() => phone(input)).toThrow();
			});

			test('throws error when number has spaces', () => {
				const input = { number: '+1 415 555 2671' } as any;
				expect(() => phone(input)).toThrow();
			});

			test('throws error when number has dashes', () => {
				const input = { number: '+1-415-555-2671' } as any;
				expect(() => phone(input)).toThrow();
			});

			test('throws error when number has parentheses', () => {
				const input = { number: '+1(415)5552671' } as any;
				expect(() => phone(input)).toThrow();
			});

			test('throws error when number has letters', () => {
				const input = { number: '+1415555CALL' } as any;
				expect(() => phone(input)).toThrow();
			});

			test('throws error when number is too short (< 8 chars)', () => {
				const input = { number: '+123456' } as any;
				expect(() => phone(input)).toThrow();
			});

			test('throws error when number is too long (> 16 chars)', () => {
				const input = { number: '+1234567890123456' } as any;
				expect(() => phone(input)).toThrow();
			});

			test('throws error when type is empty string', () => {
				const input = { number: '+14155552671', type: '' } as any;
				expect(() => phone(input)).toThrow();
			});

			test('throws error when type is too long (> 50 chars)', () => {
				const input = { number: '+14155552671', type: 'a'.repeat(51) } as any;
				expect(() => phone(input)).toThrow();
			});

			test('throws error when extension is empty string', () => {
				const input = { number: '+14155552671', extension: '' } as any;
				expect(() => phone(input)).toThrow();
			});

			test('throws error when extension is too long (> 20 chars)', () => {
				const input = {
					number: '+14155552671',
					extension: '123456789012345678901',
				} as any;
				expect(() => phone(input)).toThrow();
			});

			test('throws error when number is a number type', () => {
				const input = { number: 14155552671 } as any;
				expect(() => phone(input)).toThrow();
			});

			test('coerces number type to string (TypeBox behavior)', () => {
				const input = { number: '+14155552671', type: 123 } as any;
				const result = phone(input);
				expect(result).toEqual({ number: '+14155552671', type: '123' });
			});

			test('coerces number extension to string (TypeBox behavior)', () => {
				const input = { number: '+14155552671', extension: 123 } as any;
				const result = phone(input);
				expect(result).toEqual({ number: '+14155552671', extension: '123' });
			});

			test('strips additional properties (TypeBox behavior)', () => {
				const input = {
					number: '+14155552671',
					type: 'mobile',
					extra: 'field',
				} as any;
				const result = phone(input);
				expect(result).toEqual({ number: '+14155552671', type: 'mobile' });
				expect(result).not.toHaveProperty('extra');
			});

			test('throws error when input is null', () => {
				expect(() => phone(null as any)).toThrow();
			});

			test('returns builder when input is undefined (TypeBox behavior)', () => {
				const result = phone(undefined as any);
				expect(result).toBeDefined();
				expect(typeof result.number).toBe('function');
			});

			test('throws error when input is a string', () => {
				expect(() => phone('+14155552671' as any)).toThrow();
			});

			test('throws error when input is a number', () => {
				expect(() => phone(14155552671 as any)).toThrow();
			});

			test('throws error when input is an array', () => {
				expect(() => phone([{ number: '+14155552671' }] as any)).toThrow();
			});
		});
	});

	describe('phone.parse()', () => {
		describe('success cases', () => {
			test('parses valid phone object with number only', () => {
				const input = { number: '+14155552671' };
				const result = phone.parse(input);
				expect(result).toEqual({ number: '+14155552671' });
			});

			test('parses valid phone with number and type', () => {
				const input = { number: '+14155552671', type: 'mobile' };
				const result = phone.parse(input);
				expect(result).toEqual({ number: '+14155552671', type: 'mobile' });
			});

			test('parses valid phone with all fields', () => {
				const input = {
					number: '+442071234567',
					type: 'work',
					extension: '123',
				};
				const result = phone.parse(input);
				expect(result).toEqual({
					number: '+442071234567',
					type: 'work',
					extension: '123',
				});
			});

			test('parses various country phone numbers', () => {
				const phones = [
					{ number: '+14155552671' },
					{ number: '+442071234567' },
					{ number: '+33123456789' },
					{ number: '+8613800138000' },
				];

				for (const p of phones) {
					const result = phone.parse(p);
					expect(result).toEqual(p);
				}
			});
		});

		describe('validation failures', () => {
			test('throws error when number is missing', () => {
				const input = { type: 'mobile' };
				expect(() => phone.parse(input)).toThrow();
			});

			test('throws error when number pattern is invalid', () => {
				const input = { number: '14155552671' };
				expect(() => phone.parse(input)).toThrow();
			});

			test('throws error when number is too short', () => {
				const input = { number: '+123456' };
				expect(() => phone.parse(input)).toThrow();
			});

			test('throws error when number is too long', () => {
				const input = { number: '+1234567890123456' };
				expect(() => phone.parse(input)).toThrow();
			});

			test('strips additional properties (TypeBox behavior)', () => {
				const input = {
					number: '+14155552671',
					type: 'mobile',
					extra: 'value',
				};
				const result = phone.parse(input);
				expect(result).toEqual({ number: '+14155552671', type: 'mobile' });
				expect(result).not.toHaveProperty('extra');
			});

			test('throws error when input is null', () => {
				expect(() => phone.parse(null)).toThrow();
			});

			test('throws error when input is undefined', () => {
				expect(() => phone.parse(undefined)).toThrow();
			});

			test('throws error when input is not an object', () => {
				expect(() => phone.parse('string')).toThrow();
			});
		});
	});

	describe('phone.safeParse()', () => {
		describe('success cases', () => {
			test('returns success result for valid phone with number only', () => {
				const input = { number: '+14155552671' };
				const result = phone.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({ number: '+14155552671' });
				}
			});

			test('returns success result for phone with type', () => {
				const input = { number: '+14155552671', type: 'mobile' };
				const result = phone.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({ number: '+14155552671', type: 'mobile' });
				}
			});

			test('returns success result for phone with all fields', () => {
				const input = {
					number: '+442071234567',
					type: 'work',
					extension: '123',
				};
				const result = phone.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({
						number: '+442071234567',
						type: 'work',
						extension: '123',
					});
				}
			});

			test('returns success result for various countries', () => {
				const phones = [
					{ number: '+14155552671' },
					{ number: '+442071234567' },
					{ number: '+33123456789' },
					{ number: '+8613800138000' },
				];

				for (const p of phones) {
					const result = phone.safeParse(p);
					expect(result.success).toBe(true);
					if (result.success) {
						expect(result.data).toEqual(p);
					}
				}
			});
		});

		describe('failure cases - returns error object', () => {
			test('returns error when number is missing', () => {
				const input = { type: 'mobile' };
				const result = phone.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when number lacks + prefix', () => {
				const input = { number: '14155552671' };
				const result = phone.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when number has wrong pattern', () => {
				const input = { number: '+1 415 555 2671' };
				const result = phone.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when number is too short', () => {
				const input = { number: '+123456' };
				const result = phone.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when number is too long', () => {
				const input = { number: '+1234567890123456' };
				const result = phone.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when type is empty string', () => {
				const input = { number: '+14155552671', type: '' };
				const result = phone.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when type is too long', () => {
				const input = { number: '+14155552671', type: 'a'.repeat(51) };
				const result = phone.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when extension is empty string', () => {
				const input = { number: '+14155552671', extension: '' };
				const result = phone.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when extension is too long', () => {
				const input = {
					number: '+14155552671',
					extension: '123456789012345678901',
				};
				const result = phone.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('strips additional properties (TypeBox behavior)', () => {
				const input = {
					number: '+14155552671',
					type: 'mobile',
					extra: 'field',
				};
				const result = phone.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({ number: '+14155552671', type: 'mobile' });
					expect(result.data).not.toHaveProperty('extra');
				}
			});

			test('returns error when input is null', () => {
				const result = phone.safeParse(null);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when input is undefined', () => {
				const result = phone.safeParse(undefined);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when input is not an object', () => {
				const result = phone.safeParse('not an object');

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when input is an array', () => {
				const result = phone.safeParse([{ number: '+14155552671' }]);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});
		});
	});
});
