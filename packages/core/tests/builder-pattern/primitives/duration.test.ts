import { describe, test, expect } from 'vitest';
import { duration } from '@/builders/primitives/duration';

describe('Duration (Builder Pattern)', () => {
	describe('fluent builder API', () => {
		describe('success cases', () => {
			test('builds valid duration with years', () => {
				const result = duration().value('P1Y').build();
				expect(result).toBe('P1Y');
			});

			test('builds valid duration with months', () => {
				const result = duration().value('P3M').build();
				expect(result).toBe('P3M');
			});

			test('builds valid duration with days', () => {
				const result = duration().value('P14D').build();
				expect(result).toBe('P14D');
			});

			test('builds valid duration with hours', () => {
				const result = duration().value('PT12H').build();
				expect(result).toBe('PT12H');
			});

			test('builds valid duration with minutes', () => {
				const result = duration().value('PT30M').build();
				expect(result).toBe('PT30M');
			});

			test('builds valid duration with seconds', () => {
				const result = duration().value('PT5S').build();
				expect(result).toBe('PT5S');
			});

			test('builds valid duration with decimal seconds', () => {
				const result = duration().value('PT5.5S').build();
				expect(result).toBe('PT5.5S');
			});

			test('builds valid duration with combined date parts', () => {
				const result = duration().value('P1Y2M3D').build();
				expect(result).toBe('P1Y2M3D');
			});

			test('builds valid duration with combined time parts', () => {
				const result = duration().value('PT1H2M3S').build();
				expect(result).toBe('PT1H2M3S');
			});

			test('builds valid duration with date and time parts', () => {
				const result = duration().value('P1DT12H').build();
				expect(result).toBe('P1DT12H');
			});

			test('builds valid duration with all components', () => {
				const result = duration().value('P1Y2M3DT4H5M6S').build();
				expect(result).toBe('P1Y2M3DT4H5M6S');
			});

			test('builds valid duration with large values', () => {
				const result = duration().value('P100Y').build();
				expect(result).toBe('P100Y');
			});

			test('builds valid duration with multi-digit values', () => {
				const result = duration().value('P365D').build();
				expect(result).toBe('P365D');
			});

			test('builds valid duration with zero-like pattern', () => {
				const result = duration().value('P0D').build();
				expect(result).toBe('P0D');
			});

			test('allows overwriting value', () => {
				const result = duration().value('P1Y').value('P3M').build();
				expect(result).toBe('P3M');
			});
		});

		describe('validation failures on build()', () => {
			test('builds with empty string when value is not set', () => {
				const result = duration().build();
				expect(result).toBe('');
			});

			test('throws error when missing P prefix', () => {
				expect(() => duration().value('1Y' as any).build()).toThrow();
			});

			test('throws error when P is lowercase', () => {
				expect(() => duration().value('p1Y' as any).build()).toThrow();
			});

			test('accepts T without time components (valid per regex)', () => {
				const result = duration().value('P1DT' as any).build();
				expect(result).toBe('P1DT');
			});

			test('throws error when time parts without T separator', () => {
				expect(() => duration().value('P1H' as any).build()).toThrow();
			});

			test('throws error when missing P entirely', () => {
				expect(() => duration().value('T1H' as any).build()).toThrow();
			});

			test('throws error when components in wrong order', () => {
				expect(() => duration().value('P1D2Y' as any).build()).toThrow();
			});

			test('throws error with spaces', () => {
				expect(() => duration().value('P 1 Y' as any).build()).toThrow();
			});

			test('throws error with lowercase components', () => {
				expect(() => duration().value('p1y' as any).build()).toThrow();
			});

			test('throws error for empty string', () => {
				expect(() => duration().value('' as any).build()).toThrow();
			});

			test('accepts just P (valid per regex)', () => {
				const result = duration().value('P' as any).build();
				expect(result).toBe('P');
			});

			test('throws error for invalid characters', () => {
				expect(() => duration().value('P1X' as any).build()).toThrow();
			});
		});

		describe('builder instance behavior', () => {
			test('returns DurationBuilder instance when called with no arguments', () => {
				const builder = duration();
				expect(builder).toBeDefined();
				expect(typeof builder.value).toBe('function');
				expect(typeof builder.build).toBe('function');
			});

			test('builder methods return this for chaining', () => {
				const builder = duration();
				const afterValue = builder.value('P1Y');

				expect(afterValue).toBe(builder);
			});

			test('multiple builders are independent', () => {
				const builder1 = duration().value('P1Y');
				const builder2 = duration().value('P3M');

				expect(builder1.build()).toBe('P1Y');
				expect(builder2.build()).toBe('P3M');
			});

			test('builder can be reused after build', () => {
				const builder = duration().value('P1Y');
				const result1 = builder.build();
				const result2 = builder.build();

				expect(result1).toBe('P1Y');
				expect(result2).toBe('P1Y');
			});

			test('modifying builder after build affects subsequent builds', () => {
				const builder = duration().value('P1Y');
				const result1 = builder.build();

				builder.value('P3M');
				const result2 = builder.build();

				expect(result1).toBe('P1Y');
				expect(result2).toBe('P3M');
			});
		});

		describe('common usage patterns', () => {
			test('creates one year duration', () => {
				const result = duration().value('P1Y').build();
				expect(result).toBe('P1Y');
			});

			test('creates three months duration', () => {
				const result = duration().value('P3M').build();
				expect(result).toBe('P3M');
			});

			test('creates one day twelve hours duration', () => {
				const result = duration().value('P1DT12H').build();
				expect(result).toBe('P1DT12H');
			});

			test('creates thirty minutes duration', () => {
				const result = duration().value('PT30M').build();
				expect(result).toBe('PT30M');
			});

			test('creates five seconds duration', () => {
				const result = duration().value('PT5S').build();
				expect(result).toBe('PT5S');
			});
		});

		describe('builder pattern vs object pattern comparison', () => {
			test('builder pattern produces same result as object pattern', () => {
				const builderResult = duration().value('P1Y').build();
				const objectResult = duration('P1Y');

				expect(builderResult).toBe(objectResult);
			});

			test('builder pattern validates on value(), object pattern validates immediately', () => {
				// Builder - error when calling value() with invalid input
				const builder = duration();
				expect(() => builder.value('invalid' as any)).toThrow();

				// Object - error immediately
				expect(() => duration('invalid' as any)).toThrow();
			});
		});

		describe('partial builder state', () => {
			test('builder can exist with no value set', () => {
				const builder = duration();
				expect(builder).toBeDefined();
			});

			test('builder can exist with value set', () => {
				const builder = duration().value('P1Y');
				expect(builder).toBeDefined();
				expect(builder.build()).toBe('P1Y');
			});

			test('builder validates when value() is called', () => {
				const builder = duration();
				// Error when setting invalid value
				expect(() => builder.value('invalid' as any)).toThrow();
			});
		});
	});
});
