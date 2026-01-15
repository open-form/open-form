import { describe, test, expect } from 'vitest';
import { duration } from '@/builders/primitives/duration';
import type { Duration } from '@/schemas/primitives';

describe('Duration (Object Pattern)', () => {
	describe('duration() - direct validation', () => {
		describe('success cases', () => {
			test('creates valid duration with years', () => {
				const input: Duration = 'P1Y';
				const result = duration(input);
				expect(result).toBe('P1Y');
			});

			test('creates valid duration with months', () => {
				const input: Duration = 'P3M';
				const result = duration(input);
				expect(result).toBe('P3M');
			});

			test('creates valid duration with days', () => {
				const input: Duration = 'P14D';
				const result = duration(input);
				expect(result).toBe('P14D');
			});

			test('creates valid duration with hours', () => {
				const input: Duration = 'PT12H';
				const result = duration(input);
				expect(result).toBe('PT12H');
			});

			test('creates valid duration with minutes', () => {
				const input: Duration = 'PT30M';
				const result = duration(input);
				expect(result).toBe('PT30M');
			});

			test('creates valid duration with seconds', () => {
				const input: Duration = 'PT5S';
				const result = duration(input);
				expect(result).toBe('PT5S');
			});

			test('creates valid duration with decimal seconds', () => {
				const input: Duration = 'PT5.5S';
				const result = duration(input);
				expect(result).toBe('PT5.5S');
			});

			test('creates valid duration with combined date parts', () => {
				const input: Duration = 'P1Y2M3D';
				const result = duration(input);
				expect(result).toBe('P1Y2M3D');
			});

			test('creates valid duration with combined time parts', () => {
				const input: Duration = 'PT1H2M3S';
				const result = duration(input);
				expect(result).toBe('PT1H2M3S');
			});

			test('creates valid duration with date and time parts', () => {
				const input: Duration = 'P1DT12H';
				const result = duration(input);
				expect(result).toBe('P1DT12H');
			});

			test('creates valid duration with all components', () => {
				const input: Duration = 'P1Y2M3DT4H5M6S';
				const result = duration(input);
				expect(result).toBe('P1Y2M3DT4H5M6S');
			});

			test('creates valid duration with large values', () => {
				const input: Duration = 'P100Y';
				const result = duration(input);
				expect(result).toBe('P100Y');
			});

			test('creates valid duration with multi-digit values', () => {
				const input: Duration = 'P365D';
				const result = duration(input);
				expect(result).toBe('P365D');
			});

			test('creates valid duration with zero-like pattern', () => {
				const input: Duration = 'P0D';
				const result = duration(input);
				expect(result).toBe('P0D');
			});
		});

		describe('validation failures', () => {
			test('throws error when missing P prefix', () => {
				const input = '1Y' as any;
				expect(() => duration(input)).toThrow();
			});

			test('throws error when P is lowercase', () => {
				const input = 'p1Y' as any;
				expect(() => duration(input)).toThrow();
			});

			test('accepts T without time components (valid per regex)', () => {
				const input = 'P1DT' as any;
				const result = duration(input);
				expect(result).toBe('P1DT');
			});

			test('throws error when time parts without T separator', () => {
				const input = 'P1H' as any;
				expect(() => duration(input)).toThrow();
			});

			test('throws error when missing P entirely', () => {
				const input = 'T1H' as any;
				expect(() => duration(input)).toThrow();
			});

			test('throws error when components in wrong order', () => {
				const input = 'P1D2Y' as any;
				expect(() => duration(input)).toThrow();
			});

			test('throws error with spaces', () => {
				const input = 'P 1 Y' as any;
				expect(() => duration(input)).toThrow();
			});

			test('throws error with lowercase components', () => {
				const input = 'p1y' as any;
				expect(() => duration(input)).toThrow();
			});

			test('throws error when input is null', () => {
				expect(() => duration(null as any)).toThrow();
			});

			test('returns builder when input is undefined (TypeBox behavior)', () => {
				const result = duration(undefined as any);
				expect(result).toBeDefined();
				expect(typeof (result as any).value).toBe('function');
			});

			test('throws error when input is a number', () => {
				expect(() => duration(123 as any)).toThrow();
			});

			test('throws error when input is an object', () => {
				expect(() => duration({ value: 'P1Y' } as any)).toThrow();
			});

			test('throws error when input is an array', () => {
				expect(() => duration(['P1Y'] as any)).toThrow();
			});

			test('throws error for empty string', () => {
				const input = '' as any;
				expect(() => duration(input)).toThrow();
			});

			test('accepts just P (valid per regex)', () => {
				const input = 'P' as any;
				const result = duration(input);
				expect(result).toBe('P');
			});

			test('throws error for invalid characters', () => {
				const input = 'P1X' as any;
				expect(() => duration(input)).toThrow();
			});
		});
	});

	describe('duration.parse()', () => {
		describe('success cases', () => {
			test('parses valid duration string', () => {
				const input = 'P1Y';
				const result = duration.parse(input);
				expect(result).toBe('P1Y');
			});

			test('parses duration with time components', () => {
				const input = 'PT30M';
				const result = duration.parse(input);
				expect(result).toBe('PT30M');
			});

			test('parses duration with date and time', () => {
				const input = 'P1DT12H';
				const result = duration.parse(input);
				expect(result).toBe('P1DT12H');
			});

			test('parses various valid formats', () => {
				const formats = ['P1Y', 'P3M', 'P1DT12H', 'PT30M', 'PT5S'];

				for (const format of formats) {
					const result = duration.parse(format);
					expect(result).toBe(format);
				}
			});
		});

		describe('validation failures', () => {
			test('throws error when pattern is invalid', () => {
				const input = '1Y';
				expect(() => duration.parse(input)).toThrow();
			});

			test('throws error when missing P prefix', () => {
				const input = 'T1H';
				expect(() => duration.parse(input)).toThrow();
			});

			test('throws error when input is null', () => {
				expect(() => duration.parse(null)).toThrow();
			});

			test('throws error when input is undefined', () => {
				expect(() => duration.parse(undefined)).toThrow();
			});

			test('throws error when input is not a string', () => {
				expect(() => duration.parse(123)).toThrow();
			});
		});
	});

	describe('duration.safeParse()', () => {
		describe('success cases', () => {
			test('returns success result for valid duration', () => {
				const input = 'P1Y';
				const result = duration.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toBe('P1Y');
				}
			});

			test('returns success result for time duration', () => {
				const input = 'PT30M';
				const result = duration.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toBe('PT30M');
				}
			});

			test('returns success result for combined duration', () => {
				const input = 'P1DT12H';
				const result = duration.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toBe('P1DT12H');
				}
			});

			test('returns success result for various formats', () => {
				const formats = ['P1Y', 'P3M', 'P1DT12H', 'PT30M', 'PT5S'];

				for (const format of formats) {
					const result = duration.safeParse(format);
					expect(result.success).toBe(true);
					if (result.success) {
						expect(result.data).toBe(format);
					}
				}
			});
		});

		describe('failure cases - returns error object', () => {
			test('returns error when pattern is invalid', () => {
				const input = '1Y';
				const result = duration.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when missing P prefix', () => {
				const input = 'T1H';
				const result = duration.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when components in wrong order', () => {
				const input = 'P1D2Y';
				const result = duration.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when time parts without T', () => {
				const input = 'P1H';
				const result = duration.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error for empty string', () => {
				const input = '';
				const result = duration.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when input is null', () => {
				const result = duration.safeParse(null);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when input is undefined', () => {
				const result = duration.safeParse(undefined);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when input is not a string', () => {
				const result = duration.safeParse(123);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when input is an object', () => {
				const result = duration.safeParse({ value: 'P1Y' });

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when input is an array', () => {
				const result = duration.safeParse(['P1Y']);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});
		});
	});
});
