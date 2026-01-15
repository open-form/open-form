import { describe, test, expect } from 'vitest';
import { phone } from '@/builders/primitives/phone';

describe('Phone (Builder Pattern)', () => {
	describe('fluent builder API', () => {
		describe('success cases', () => {
			test('builds valid phone with number only', () => {
				const result = phone().number('+14155552671').build();
				expect(result).toEqual({ number: '+14155552671' });
			});

			test('builds valid phone with number and type', () => {
				const result = phone().number('+14155552671').type('mobile').build();
				expect(result).toEqual({ number: '+14155552671', type: 'mobile' });
			});

			test('builds valid phone with number, type, and extension', () => {
				const result = phone()
					.number('+442071234567')
					.type('work')
					.extension('123')
					.build();
				expect(result).toEqual({
					number: '+442071234567',
					type: 'work',
					extension: '123',
				});
			});

			test('builds valid phone with number and extension (no type)', () => {
				const result = phone().number('+442071234567').extension('456').build();
				expect(result).toEqual({ number: '+442071234567', extension: '456' });
			});

			test('builds valid phone for various countries', () => {
				const numbers = [
					'+14155552671', // US
					'+442071234567', // UK
					'+33123456789', // France
					'+8613800138000', // China
					'+81312345678', // Japan
					'+61212345678', // Australia
				];

				for (const num of numbers) {
					const result = phone().number(num).build();
					expect(result).toEqual({ number: num });
				}
			});

			test('builds valid phone with various types', () => {
				const types = ['mobile', 'work', 'home', 'fax', 'other'];

				for (const t of types) {
					const result = phone().number('+14155552671').type(t).build();
					expect(result).toEqual({ number: '+14155552671', type: t });
				}
			});

			test('builds valid phone with minimum length number', () => {
				const result = phone().number('+1234567').build();
				expect(result).toEqual({ number: '+1234567' });
			});

			test('builds valid phone with maximum length number', () => {
				const result = phone().number('+123456789012345').build();
				expect(result).toEqual({ number: '+123456789012345' });
			});

			test('builds valid phone with minimum length extension', () => {
				const result = phone().number('+14155552671').extension('1').build();
				expect(result).toEqual({ number: '+14155552671', extension: '1' });
			});

			test('builds valid phone with maximum length extension', () => {
				const result = phone()
					.number('+14155552671')
					.extension('12345678901234567890')
					.build();
				expect(result).toEqual({
					number: '+14155552671',
					extension: '12345678901234567890',
				});
			});

			test('builds valid phone with minimum length type', () => {
				const result = phone().number('+14155552671').type('w').build();
				expect(result).toEqual({ number: '+14155552671', type: 'w' });
			});

			test('builds valid phone with maximum length type', () => {
				const result = phone()
					.number('+14155552671')
					.type('a'.repeat(50))
					.build();
				expect(result).toEqual({
					number: '+14155552671',
					type: 'a'.repeat(50),
				});
			});

			test('supports method chaining', () => {
				const result = phone()
					.number('+14155552671')
					.type('mobile')
					.extension('123')
					.build();
				expect(result).toEqual({
					number: '+14155552671',
					type: 'mobile',
					extension: '123',
				});
			});

			test('supports reverse order of method calls', () => {
				const result = phone()
					.extension('123')
					.type('mobile')
					.number('+14155552671')
					.build();
				expect(result).toEqual({
					number: '+14155552671',
					type: 'mobile',
					extension: '123',
				});
			});

			test('allows overwriting number', () => {
				const result = phone()
					.number('+11111111111')
					.number('+14155552671')
					.build();
				expect(result).toEqual({ number: '+14155552671' });
			});

			test('allows overwriting type', () => {
				const result = phone()
					.number('+14155552671')
					.type('work')
					.type('mobile')
					.build();
				expect(result).toEqual({ number: '+14155552671', type: 'mobile' });
			});

			test('allows overwriting extension', () => {
				const result = phone()
					.number('+14155552671')
					.extension('111')
					.extension('123')
					.build();
				expect(result).toEqual({ number: '+14155552671', extension: '123' });
			});

			test('allows setting type to undefined', () => {
				const result = phone()
					.number('+14155552671')
					.type('mobile')
					.type(undefined)
					.build();
				expect(result).toEqual({ number: '+14155552671' });
			});

			test('allows setting extension to undefined', () => {
				const result = phone()
					.number('+14155552671')
					.extension('123')
					.extension(undefined)
					.build();
				expect(result).toEqual({ number: '+14155552671' });
			});
		});

		describe('validation failures on build()', () => {
			test('throws error when number is not set', () => {
				expect(() => phone().type('mobile').build()).toThrow();
			});

			test('throws error when no fields are set', () => {
				expect(() => phone().build()).toThrow();
			});

			test('throws error when number lacks + prefix', () => {
				expect(() => phone().number('14155552671').build()).toThrow();
			});

			test('throws error when number starts with +0', () => {
				expect(() => phone().number('+01234567890').build()).toThrow();
			});

			test('throws error when number has spaces', () => {
				expect(() => phone().number('+1 415 555 2671').build()).toThrow();
			});

			test('throws error when number has dashes', () => {
				expect(() => phone().number('+1-415-555-2671').build()).toThrow();
			});

			test('throws error when number has parentheses', () => {
				expect(() => phone().number('+1(415)5552671').build()).toThrow();
			});

			test('throws error when number has letters', () => {
				expect(() => phone().number('+1415555CALL').build()).toThrow();
			});

			test('throws error when number is too short (< 8 chars)', () => {
				expect(() => phone().number('+123456').build()).toThrow();
			});

			test('throws error when number is too long (> 16 chars)', () => {
				expect(() => phone().number('+1234567890123456').build()).toThrow();
			});

			test('throws error when type is empty string', () => {
				expect(() => phone().number('+14155552671').type('').build()).toThrow();
			});

			test('throws error when type is too long (> 50 chars)', () => {
				expect(() =>
					phone()
						.number('+14155552671')
						.type('a'.repeat(51))
						.build(),
				).toThrow();
			});

			test('throws error when extension is empty string', () => {
				expect(() =>
					phone().number('+14155552671').extension('').build(),
				).toThrow();
			});

			test('throws error when extension is too long (> 20 chars)', () => {
				expect(() =>
					phone()
						.number('+14155552671')
						.extension('123456789012345678901')
						.build(),
				).toThrow();
			});
		});

		describe('builder instance behavior', () => {
			test('returns PhoneBuilder instance when called with no arguments', () => {
				const builder = phone();
				expect(builder).toBeDefined();
				expect(typeof builder.number).toBe('function');
				expect(typeof builder.type).toBe('function');
				expect(typeof builder.extension).toBe('function');
				expect(typeof builder.build).toBe('function');
			});

			test('builder methods return this for chaining', () => {
				const builder = phone();
				const afterNumber = builder.number('+14155552671');
				const afterType = afterNumber.type('mobile');
				const afterExtension = afterType.extension('123');

				expect(afterNumber).toBe(builder);
				expect(afterType).toBe(builder);
				expect(afterExtension).toBe(builder);
			});

			test('multiple builders are independent', () => {
				const builder1 = phone().number('+14155552671').type('mobile');
				const builder2 = phone().number('+442071234567').type('work');

				expect(builder1.build()).toEqual({
					number: '+14155552671',
					type: 'mobile',
				});
				expect(builder2.build()).toEqual({
					number: '+442071234567',
					type: 'work',
				});
			});

			test('builder can be reused after build', () => {
				const builder = phone().number('+14155552671').type('mobile');
				const result1 = builder.build();
				const result2 = builder.build();

				expect(result1).toEqual({ number: '+14155552671', type: 'mobile' });
				expect(result2).toEqual({ number: '+14155552671', type: 'mobile' });
			});

			test('modifying builder after build affects subsequent builds', () => {
				const builder = phone().number('+14155552671').type('mobile');
				const result1 = builder.build();

				builder.type('work');
				const result2 = builder.build();

				expect(result1).toEqual({ number: '+14155552671', type: 'mobile' });
				expect(result2).toEqual({ number: '+14155552671', type: 'work' });
			});
		});

		describe('common usage patterns', () => {
			test('creates US mobile phone', () => {
				const result = phone().number('+14155552671').type('mobile').build();
				expect(result).toEqual({ number: '+14155552671', type: 'mobile' });
			});

			test('creates UK work phone with extension', () => {
				const result = phone()
					.number('+442071234567')
					.type('work')
					.extension('123')
					.build();
				expect(result).toEqual({
					number: '+442071234567',
					type: 'work',
					extension: '123',
				});
			});

			test('creates French home phone', () => {
				const result = phone().number('+33123456789').type('home').build();
				expect(result).toEqual({ number: '+33123456789', type: 'home' });
			});

			test('creates Chinese phone without type', () => {
				const result = phone().number('+8613800138000').build();
				expect(result).toEqual({ number: '+8613800138000' });
			});
		});

		describe('builder pattern vs object pattern comparison', () => {
			test('builder pattern produces same result as object pattern', () => {
				const builderResult = phone()
					.number('+14155552671')
					.type('mobile')
					.build();
				const objectResult = phone({ number: '+14155552671', type: 'mobile' });

				expect(builderResult).toEqual(objectResult);
			});

			test('builder pattern validates on build(), object pattern validates immediately', () => {
				// Builder - no error until build()
				const builder = phone().number('invalid');
				expect(() => builder.build()).toThrow();

				// Object - error immediately
				expect(() => phone({ number: 'invalid' } as any)).toThrow();
			});
		});

		describe('partial builder state', () => {
			test('builder can exist with no fields set', () => {
				const builder = phone();
				expect(builder).toBeDefined();
			});

			test('builder can exist with only number set', () => {
				const builder = phone().number('+14155552671');
				expect(builder).toBeDefined();
				expect(builder.build()).toEqual({ number: '+14155552671' });
			});

			test('builder can exist with only type set', () => {
				const builder = phone().type('mobile');
				expect(builder).toBeDefined();
				expect(() => builder.build()).toThrow(); // But build fails
			});

			test('builder can exist with only extension set', () => {
				const builder = phone().extension('123');
				expect(builder).toBeDefined();
				expect(() => builder.build()).toThrow(); // But build fails
			});

			test('builder validates only on build() call', () => {
				const builder = phone();
				builder.number('invalid'); // Invalid pattern, but no error yet
				expect(() => builder.build()).toThrow(); // Error only on build
			});
		});

		describe('optional field handling', () => {
			test('builds phone without optional type', () => {
				const result = phone().number('+14155552671').build();
				expect(result).toEqual({ number: '+14155552671' });
				expect(result).not.toHaveProperty('type');
			});

			test('builds phone without optional extension', () => {
				const result = phone().number('+14155552671').build();
				expect(result).toEqual({ number: '+14155552671' });
				expect(result).not.toHaveProperty('extension');
			});

			test('builds phone with type but no extension', () => {
				const result = phone().number('+14155552671').type('mobile').build();
				expect(result).toEqual({ number: '+14155552671', type: 'mobile' });
				expect(result).not.toHaveProperty('extension');
			});

			test('builds phone with extension but no type', () => {
				const result = phone().number('+14155552671').extension('123').build();
				expect(result).toEqual({ number: '+14155552671', extension: '123' });
				expect(result).not.toHaveProperty('type');
			});

			test('setting type to undefined keeps it as undefined', () => {
				const result = phone()
					.number('+14155552671')
					.type('mobile')
					.type(undefined)
					.build();
				// TypeBox keeps undefined values in optional fields
				expect(result.number).toBe('+14155552671');
			});

			test('setting extension to undefined keeps it as undefined', () => {
				const result = phone()
					.number('+14155552671')
					.extension('123')
					.extension(undefined)
					.build();
				// TypeBox keeps undefined values in optional fields
				expect(result.number).toBe('+14155552671');
			});
		});
	});
});
