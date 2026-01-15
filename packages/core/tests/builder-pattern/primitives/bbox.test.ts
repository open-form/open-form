import { describe, test, expect } from 'vitest';
import { bbox } from '@/builders/primitives/bbox';

describe('Bbox (Builder Pattern)', () => {
	describe('fluent builder API', () => {
		describe('success cases', () => {
			test('builds valid bbox with southWest and northEast', () => {
				const result = bbox()
					.southWest({ lat: 37.7396, lon: -122.4863 })
					.northEast({ lat: 37.7749, lon: -122.4194 })
					.build();
				expect(result).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
			});

			test('builds valid bbox spanning equator', () => {
				const result = bbox()
					.southWest({ lat: -10, lon: -10 })
					.northEast({ lat: 10, lon: 10 })
					.build();
				expect(result).toEqual({
					southWest: { lat: -10, lon: -10 },
					northEast: { lat: 10, lon: 10 },
				});
			});

			test('builds valid bbox spanning prime meridian', () => {
				const result = bbox()
					.southWest({ lat: 40, lon: -10 })
					.northEast({ lat: 50, lon: 10 })
					.build();
				expect(result).toEqual({
					southWest: { lat: 40, lon: -10 },
					northEast: { lat: 50, lon: 10 },
				});
			});

			test('builds valid bbox in southern hemisphere', () => {
				const result = bbox()
					.southWest({ lat: -40, lon: 140 })
					.northEast({ lat: -30, lon: 155 })
					.build();
				expect(result).toEqual({
					southWest: { lat: -40, lon: 140 },
					northEast: { lat: -30, lon: 155 },
				});
			});

			test('builds valid bbox with minimum size', () => {
				const result = bbox()
					.southWest({ lat: 0, lon: 0 })
					.northEast({ lat: 0.001, lon: 0.001 })
					.build();
				expect(result).toEqual({
					southWest: { lat: 0, lon: 0 },
					northEast: { lat: 0.001, lon: 0.001 },
				});
			});

			test('builds valid bbox with maximum size', () => {
				const result = bbox()
					.southWest({ lat: -90, lon: -180 })
					.northEast({ lat: 90, lon: 180 })
					.build();
				expect(result).toEqual({
					southWest: { lat: -90, lon: -180 },
					northEast: { lat: 90, lon: 180 },
				});
			});

			test('supports reverse order of method calls', () => {
				const result = bbox()
					.northEast({ lat: 37.7749, lon: -122.4194 })
					.southWest({ lat: 37.7396, lon: -122.4863 })
					.build();
				expect(result).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
			});

			test('allows overwriting southWest', () => {
				const result = bbox()
					.southWest({ lat: 30, lon: -130 })
					.southWest({ lat: 37.7396, lon: -122.4863 })
					.northEast({ lat: 37.7749, lon: -122.4194 })
					.build();
				expect(result).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
			});

			test('allows overwriting northEast', () => {
				const result = bbox()
					.southWest({ lat: 37.7396, lon: -122.4863 })
					.northEast({ lat: 40, lon: -120 })
					.northEast({ lat: 37.7749, lon: -122.4194 })
					.build();
				expect(result).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
			});

			test('builds with bounds() method', () => {
				const result = bbox()
					.bounds(
						{ lat: 37.7396, lon: -122.4863 },
						{ lat: 37.7749, lon: -122.4194 },
					)
					.build();
				expect(result).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
			});

			test('bounds() method overwrites previous values', () => {
				const result = bbox()
					.southWest({ lat: 30, lon: -130 })
					.northEast({ lat: 40, lon: -120 })
					.bounds(
						{ lat: 37.7396, lon: -122.4863 },
						{ lat: 37.7749, lon: -122.4194 },
					)
					.build();
				expect(result).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
			});

			test('individual methods can override bounds()', () => {
				const result = bbox()
					.bounds({ lat: 30, lon: -130 }, { lat: 40, lon: -120 })
					.southWest({ lat: 37.7396, lon: -122.4863 })
					.build();
				expect(result).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 40, lon: -120 },
				});
			});

			test('handles high precision decimal values', () => {
				const result = bbox()
					.southWest({ lat: 37.774929, lon: -122.419418 })
					.northEast({ lat: 37.775929, lon: -122.418418 })
					.build();
				expect(result).toEqual({
					southWest: { lat: 37.774929, lon: -122.419418 },
					northEast: { lat: 37.775929, lon: -122.418418 },
				});
			});
		});

		describe('validation failures on build()', () => {
			test('throws error when southWest is not set', () => {
				expect(() =>
					bbox().northEast({ lat: 37.7749, lon: -122.4194 }).build(),
				).toThrow();
			});

			test('throws error when northEast is not set', () => {
				expect(() =>
					bbox().southWest({ lat: 37.7396, lon: -122.4863 }).build(),
				).toThrow();
			});

			test('throws error when neither corner is set', () => {
				expect(() => bbox().build()).toThrow();
			});

			test('throws error when southWest.lat equals northEast.lat', () => {
				expect(() =>
					bbox()
						.southWest({ lat: 37.7749, lon: -122.4863 })
						.northEast({ lat: 37.7749, lon: -122.4194 })
						.build(),
				).toThrow('southWest.lat');
			});

			test('throws error when southWest.lat exceeds northEast.lat', () => {
				expect(() =>
					bbox()
						.southWest({ lat: 40, lon: -122.4863 })
						.northEast({ lat: 37.7749, lon: -122.4194 })
						.build(),
				).toThrow('southWest.lat');
			});

			test('throws error when southWest.lon equals northEast.lon', () => {
				expect(() =>
					bbox()
						.southWest({ lat: 37.7396, lon: -122.4194 })
						.northEast({ lat: 37.7749, lon: -122.4194 })
						.build(),
				).toThrow('southWest.lon');
			});

			test('throws error when southWest.lon exceeds northEast.lon', () => {
				expect(() =>
					bbox()
						.southWest({ lat: 37.7396, lon: -120 })
						.northEast({ lat: 37.7749, lon: -122.4194 })
						.build(),
				).toThrow('southWest.lon');
			});

			test('throws error when southWest coordinate out of range', () => {
				expect(() =>
					bbox()
						.southWest({ lat: 91, lon: 0 })
						.northEast({ lat: 92, lon: 10 })
						.build(),
				).toThrow();
			});

			test('throws error when northEast coordinate out of range', () => {
				expect(() =>
					bbox()
						.southWest({ lat: 0, lon: 0 })
						.northEast({ lat: 91, lon: 10 })
						.build(),
				).toThrow();
			});

			test('throws error when southWest.lat is Infinity', () => {
				expect(() =>
					bbox()
						.southWest({ lat: Infinity, lon: 0 })
						.northEast({ lat: 10, lon: 10 })
						.build(),
				).toThrow();
			});

			test('throws error when southWest.lat is NaN', () => {
				expect(() =>
					bbox()
						.southWest({ lat: NaN, lon: 0 })
						.northEast({ lat: 10, lon: 10 })
						.build(),
				).toThrow();
			});

			test('throws error when bounds() called with invalid coordinates', () => {
				expect(() =>
					bbox()
						.bounds({ lat: 40, lon: 0 }, { lat: 30, lon: 10 })
						.build(),
				).toThrow('southWest.lat');
			});
		});

		describe('builder instance behavior', () => {
			test('returns BboxBuilder instance when called with no arguments', () => {
				const builder = bbox();
				expect(builder).toBeDefined();
				expect(typeof builder.southWest).toBe('function');
				expect(typeof builder.northEast).toBe('function');
				expect(typeof builder.bounds).toBe('function');
				expect(typeof builder.build).toBe('function');
			});

			test('builder methods return this for chaining', () => {
				const builder = bbox();
				const afterSouthWest = builder.southWest({ lat: 37.7396, lon: -122.4863 });
				const afterNorthEast = afterSouthWest.northEast({
					lat: 37.7749,
					lon: -122.4194,
				});

				expect(afterSouthWest).toBe(builder);
				expect(afterNorthEast).toBe(builder);
			});

			test('bounds method returns this for chaining', () => {
				const builder = bbox();
				const afterBounds = builder.bounds(
					{ lat: 37.7396, lon: -122.4863 },
					{ lat: 37.7749, lon: -122.4194 },
				);

				expect(afterBounds).toBe(builder);
			});

			test('multiple builders are independent', () => {
				const builder1 = bbox()
					.southWest({ lat: 37.7396, lon: -122.4863 })
					.northEast({ lat: 37.7749, lon: -122.4194 });
				const builder2 = bbox()
					.southWest({ lat: 40.7128, lon: -74.006 })
					.northEast({ lat: 40.7589, lon: -73.9857 });

				expect(builder1.build()).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
				expect(builder2.build()).toEqual({
					southWest: { lat: 40.7128, lon: -74.006 },
					northEast: { lat: 40.7589, lon: -73.9857 },
				});
			});

			test('builder can be reused after build', () => {
				const builder = bbox()
					.southWest({ lat: 37.7396, lon: -122.4863 })
					.northEast({ lat: 37.7749, lon: -122.4194 });
				const result1 = builder.build();
				const result2 = builder.build();

				expect(result1).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
				expect(result2).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
			});

			test('modifying builder after build affects subsequent builds', () => {
				const builder = bbox()
					.southWest({ lat: 37.7396, lon: -122.4863 })
					.northEast({ lat: 37.7749, lon: -122.4194 });
				const result1 = builder.build();

				builder.southWest({ lat: 37.72, lon: -122.5 });
				const result2 = builder.build();

				expect(result1).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
				expect(result2).toEqual({
					southWest: { lat: 37.72, lon: -122.5 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
			});
		});

		describe('edge cases and special scenarios', () => {
			test('handles floating point precision', () => {
				const result = bbox()
					.southWest({ lat: 0.1 + 0.2, lon: 0 })
					.northEast({ lat: 1, lon: 1 })
					.build();
				expect(result.southWest.lat).toBeCloseTo(0.3);
			});

			test('preserves exact decimal values', () => {
				const result = bbox()
					.southWest({ lat: 37.774929, lon: -122.419418 })
					.northEast({ lat: 37.775929, lon: -122.418418 })
					.build();
				expect(result.southWest.lat).toBe(37.774929);
				expect(result.southWest.lon).toBe(-122.419418);
				expect(result.northEast.lat).toBe(37.775929);
				expect(result.northEast.lon).toBe(-122.418418);
			});

			test('handles negative zero', () => {
				const result = bbox()
					.southWest({ lat: -0, lon: -0 })
					.northEast({ lat: 1, lon: 1 })
					.build();
				expect(result.southWest).toEqual({ lat: 0, lon: 0 });
			});
		});

		describe('common usage patterns', () => {
			test('creates San Francisco bbox', () => {
				const result = bbox()
					.southWest({ lat: 37.7396, lon: -122.4863 })
					.northEast({ lat: 37.7749, lon: -122.4194 })
					.build();
				expect(result).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
			});

			test('creates New York bbox', () => {
				const result = bbox()
					.southWest({ lat: 40.7128, lon: -74.006 })
					.northEast({ lat: 40.7589, lon: -73.9857 })
					.build();
				expect(result).toEqual({
					southWest: { lat: 40.7128, lon: -74.006 },
					northEast: { lat: 40.7589, lon: -73.9857 },
				});
			});

			test('creates bbox using bounds() helper', () => {
				const result = bbox()
					.bounds(
						{ lat: 37.7396, lon: -122.4863 },
						{ lat: 37.7749, lon: -122.4194 },
					)
					.build();
				expect(result).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
			});
		});

		describe('builder pattern vs object pattern comparison', () => {
			test('builder pattern produces same result as object pattern', () => {
				const builderResult = bbox()
					.southWest({ lat: 37.7396, lon: -122.4863 })
					.northEast({ lat: 37.7749, lon: -122.4194 })
					.build();
				const objectResult = bbox({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});

				expect(builderResult).toEqual(objectResult);
			});

			test('bounds() method produces same result as object pattern', () => {
				const builderResult = bbox()
					.bounds(
						{ lat: 37.7396, lon: -122.4863 },
						{ lat: 37.7749, lon: -122.4194 },
					)
					.build();
				const objectResult = bbox({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});

				expect(builderResult).toEqual(objectResult);
			});

			test('builder pattern validates on build(), object pattern validates immediately', () => {
				// Builder - no error until build()
				const builder = bbox()
					.southWest({ lat: 40, lon: 0 })
					.northEast({ lat: 30, lon: 10 });
				expect(() => builder.build()).toThrow();

				// Object - error immediately
				expect(() =>
					bbox({
						southWest: { lat: 40, lon: 0 },
						northEast: { lat: 30, lon: 10 },
					} as any),
				).toThrow();
			});
		});

		describe('partial builder state', () => {
			test('builder can exist with no fields set', () => {
				const builder = bbox();
				expect(builder).toBeDefined();
			});

			test('builder can exist with only southWest set', () => {
				const builder = bbox().southWest({ lat: 37.7396, lon: -122.4863 });
				expect(builder).toBeDefined();
				expect(() => builder.build()).toThrow(); // But build fails
			});

			test('builder can exist with only northEast set', () => {
				const builder = bbox().northEast({ lat: 37.7749, lon: -122.4194 });
				expect(builder).toBeDefined();
				expect(() => builder.build()).toThrow(); // But build fails
			});

			test('builder validates only on build() call', () => {
				const builder = bbox();
				builder.southWest({ lat: 40, lon: 0 });
				builder.northEast({ lat: 30, lon: 10 }); // Invalid, but no error yet
				expect(() => builder.build()).toThrow(); // Error only on build
			});
		});

		describe('bounds() method behavior', () => {
			test('bounds() sets both southWest and northEast', () => {
				const result = bbox()
					.bounds(
						{ lat: 37.7396, lon: -122.4863 },
						{ lat: 37.7749, lon: -122.4194 },
					)
					.build();
				expect(result).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
			});

			test('bounds() can be called multiple times', () => {
				const result = bbox()
					.bounds({ lat: 30, lon: -130 }, { lat: 40, lon: -120 })
					.bounds(
						{ lat: 37.7396, lon: -122.4863 },
						{ lat: 37.7749, lon: -122.4194 },
					)
					.build();
				expect(result).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
			});

			test('bounds() works with method chaining', () => {
				const result = bbox()
					.bounds(
						{ lat: 37.7396, lon: -122.4863 },
						{ lat: 37.7749, lon: -122.4194 },
					)
					.southWest({ lat: 37.73, lon: -122.5 })
					.build();
				expect(result).toEqual({
					southWest: { lat: 37.73, lon: -122.5 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
			});

			test('bounds() validates both parameters on build', () => {
				expect(() =>
					bbox()
						.bounds({ lat: 40, lon: 0 }, { lat: 30, lon: 10 })
						.build(),
				).toThrow('southWest.lat');
			});
		});
	});
});
