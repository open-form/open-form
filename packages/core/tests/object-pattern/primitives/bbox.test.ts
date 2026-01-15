import { describe, test, expect } from 'vitest';
import { bbox } from '@/builders/primitives/bbox';
import type { Bbox } from '@/schemas/primitives';

describe('Bbox (Object Pattern)', () => {
	describe('bbox() - direct validation', () => {
		describe('success cases', () => {
			test('creates valid bbox with positive coordinates', () => {
				const input: Bbox = {
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				};
				const result = bbox(input);
				expect(result).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
			});

			test('creates valid bbox spanning equator', () => {
				const input: Bbox = {
					southWest: { lat: -10, lon: -10 },
					northEast: { lat: 10, lon: 10 },
				};
				const result = bbox(input);
				expect(result).toEqual({
					southWest: { lat: -10, lon: -10 },
					northEast: { lat: 10, lon: 10 },
				});
			});

			test('creates valid bbox spanning prime meridian', () => {
				const input: Bbox = {
					southWest: { lat: 40, lon: -10 },
					northEast: { lat: 50, lon: 10 },
				};
				const result = bbox(input);
				expect(result).toEqual({
					southWest: { lat: 40, lon: -10 },
					northEast: { lat: 50, lon: 10 },
				});
			});

			test('creates valid bbox in southern hemisphere', () => {
				const input: Bbox = {
					southWest: { lat: -40, lon: 140 },
					northEast: { lat: -30, lon: 155 },
				};
				const result = bbox(input);
				expect(result).toEqual({
					southWest: { lat: -40, lon: 140 },
					northEast: { lat: -30, lon: 155 },
				});
			});

			test('creates valid bbox with minimum size', () => {
				const input: Bbox = {
					southWest: { lat: 0, lon: 0 },
					northEast: { lat: 0.001, lon: 0.001 },
				};
				const result = bbox(input);
				expect(result).toEqual({
					southWest: { lat: 0, lon: 0 },
					northEast: { lat: 0.001, lon: 0.001 },
				});
			});

			test('creates valid bbox with maximum size', () => {
				const input: Bbox = {
					southWest: { lat: -90, lon: -180 },
					northEast: { lat: 90, lon: 180 },
				};
				const result = bbox(input);
				expect(result).toEqual({
					southWest: { lat: -90, lon: -180 },
					northEast: { lat: 90, lon: 180 },
				});
			});

			test('creates valid bbox for major cities', () => {
				const cities = [
					{
						southWest: { lat: 40.7128, lon: -74.006 },
						northEast: { lat: 40.7589, lon: -73.9857 },
					},
					{
						southWest: { lat: 51.5074, lon: -0.1278 },
						northEast: { lat: 51.6074, lon: -0.0278 },
					},
				];

				for (const city of cities) {
					const result = bbox(city);
					expect(result).toEqual(city);
				}
			});

			test('handles high precision decimal values', () => {
				const input: Bbox = {
					southWest: { lat: 37.774929, lon: -122.419418 },
					northEast: { lat: 37.775929, lon: -122.418418 },
				};
				const result = bbox(input);
				expect(result).toEqual({
					southWest: { lat: 37.774929, lon: -122.419418 },
					northEast: { lat: 37.775929, lon: -122.418418 },
				});
			});
		});

		describe('validation failures', () => {
			test('throws error when southWest is missing', () => {
				const input = {
					northEast: { lat: 37.7749, lon: -122.4194 },
				} as any;
				expect(() => bbox(input)).toThrow();
			});

			test('throws error when northEast is missing', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -122.4863 },
				} as any;
				expect(() => bbox(input)).toThrow();
			});

			test('throws error when both corners are missing', () => {
				const input = {} as any;
				expect(() => bbox(input)).toThrow();
			});

			test('throws error when southWest.lat is missing', () => {
				const input = {
					southWest: { lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				} as any;
				expect(() => bbox(input)).toThrow();
			});

			test('throws error when southWest.lon is missing', () => {
				const input = {
					southWest: { lat: 37.7396 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				} as any;
				expect(() => bbox(input)).toThrow();
			});

			test('throws error when northEast.lat is missing', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lon: -122.4194 },
				} as any;
				expect(() => bbox(input)).toThrow();
			});

			test('throws error when northEast.lon is missing', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749 },
				} as any;
				expect(() => bbox(input)).toThrow();
			});

			test('throws error when southWest.lat equals northEast.lat', () => {
				const input = {
					southWest: { lat: 37.7749, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				} as any;
				expect(() => bbox(input)).toThrow('southWest.lat');
			});

			test('throws error when southWest.lat exceeds northEast.lat', () => {
				const input = {
					southWest: { lat: 40, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				} as any;
				expect(() => bbox(input)).toThrow('southWest.lat');
			});

			test('throws error when southWest.lon equals northEast.lon', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -122.4194 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				} as any;
				expect(() => bbox(input)).toThrow('southWest.lon');
			});

			test('throws error when southWest.lon exceeds northEast.lon', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -120 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				} as any;
				expect(() => bbox(input)).toThrow('southWest.lon');
			});

			test('throws error when southWest.lat exceeds maximum (90)', () => {
				const input = {
					southWest: { lat: 90.1, lon: -122.4863 },
					northEast: { lat: 91, lon: -122.4194 },
				} as any;
				expect(() => bbox(input)).toThrow();
			});

			test('throws error when southWest.lat exceeds minimum (-90)', () => {
				const input = {
					southWest: { lat: -90.1, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				} as any;
				expect(() => bbox(input)).toThrow();
			});

			test('throws error when southWest.lon exceeds maximum (180)', () => {
				const input = {
					southWest: { lat: 37.7396, lon: 180.1 },
					northEast: { lat: 37.7749, lon: 181 },
				} as any;
				expect(() => bbox(input)).toThrow();
			});

			test('throws error when southWest.lon exceeds minimum (-180)', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -180.1 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				} as any;
				expect(() => bbox(input)).toThrow();
			});

			test('throws error when northEast.lat exceeds maximum (90)', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 90.1, lon: -122.4194 },
				} as any;
				expect(() => bbox(input)).toThrow();
			});

			test('throws error when northEast.lat exceeds minimum (-90)', () => {
				const input = {
					southWest: { lat: -91, lon: -122.4863 },
					northEast: { lat: -90.1, lon: -122.4194 },
				} as any;
				expect(() => bbox(input)).toThrow();
			});

			test('throws error when northEast.lon exceeds maximum (180)', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: 180.1 },
				} as any;
				expect(() => bbox(input)).toThrow();
			});

			test('throws error when northEast.lon exceeds minimum (-180)', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -180.1 },
					northEast: { lat: 37.7749, lon: -179 },
				} as any;
				expect(() => bbox(input)).toThrow();
			});

			test('coerces string coordinates to numbers (TypeBox behavior)', () => {
				const input = {
					southWest: { lat: '37.7396', lon: '-122.4863' },
					northEast: { lat: '37.7749', lon: '-122.4194' },
				} as any;
				const result = bbox(input);
				expect(result).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
			});

			test('strips additional properties from bbox (TypeBox behavior)', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
					extra: 'field',
				} as any;
				const result = bbox(input);
				expect(result).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
				expect(result).not.toHaveProperty('extra');
			});

			test('strips additional properties from coordinates (TypeBox behavior)', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -122.4863, extra: 'sw' },
					northEast: { lat: 37.7749, lon: -122.4194, extra: 'ne' },
				} as any;
				const result = bbox(input);
				expect(result).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
				expect(result.southWest).not.toHaveProperty('extra');
				expect(result.northEast).not.toHaveProperty('extra');
			});

			test('throws error when input is null', () => {
				expect(() => bbox(null as any)).toThrow();
			});

			test('returns builder when input is undefined (TypeBox behavior)', () => {
				const result = bbox(undefined as any);
				expect(result).toBeDefined();
				expect(typeof result.southWest).toBe('function');
			});

			test('throws error when input is a string', () => {
				expect(() => bbox('not an object' as any)).toThrow();
			});

			test('throws error when input is a number', () => {
				expect(() => bbox(123 as any)).toThrow();
			});

			test('throws error when input is an array', () => {
				expect(() => bbox([{ lat: 0, lon: 0 }] as any)).toThrow();
			});
		});
	});

	describe('bbox.parse()', () => {
		describe('success cases', () => {
			test('parses valid bbox object', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				};
				const result = bbox.parse(input);
				expect(result).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
			});

			test('parses bbox at boundaries', () => {
				const input = {
					southWest: { lat: -90, lon: -180 },
					northEast: { lat: 90, lon: 180 },
				};
				const result = bbox.parse(input);
				expect(result).toEqual({
					southWest: { lat: -90, lon: -180 },
					northEast: { lat: 90, lon: 180 },
				});
			});

			test('parses bbox with minimum size', () => {
				const input = {
					southWest: { lat: 0, lon: 0 },
					northEast: { lat: 0.001, lon: 0.001 },
				};
				const result = bbox.parse(input);
				expect(result).toEqual({
					southWest: { lat: 0, lon: 0 },
					northEast: { lat: 0.001, lon: 0.001 },
				});
			});
		});

		describe('validation failures', () => {
			test('throws error when southWest is missing', () => {
				const input = {
					northEast: { lat: 37.7749, lon: -122.4194 },
				};
				expect(() => bbox.parse(input)).toThrow();
			});

			test('throws error when northEast is missing', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -122.4863 },
				};
				expect(() => bbox.parse(input)).toThrow();
			});

			test('throws error when southWest.lat >= northEast.lat', () => {
				const input = {
					southWest: { lat: 40, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				};
				expect(() => bbox.parse(input)).toThrow('southWest.lat');
			});

			test('throws error when southWest.lon >= northEast.lon', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -120 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				};
				expect(() => bbox.parse(input)).toThrow('southWest.lon');
			});

			test('strips additional properties (TypeBox behavior)', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
					extra: 'value',
				};
				const result = bbox.parse(input);
				expect(result).toEqual({
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				});
				expect(result).not.toHaveProperty('extra');
			});

			test('throws error when input is null', () => {
				expect(() => bbox.parse(null)).toThrow();
			});

			test('throws error when input is undefined', () => {
				expect(() => bbox.parse(undefined)).toThrow();
			});

			test('throws error when input is not an object', () => {
				expect(() => bbox.parse('string')).toThrow();
			});
		});
	});

	describe('bbox.safeParse()', () => {
		describe('success cases', () => {
			test('returns success result for valid bbox', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				};
				const result = bbox.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({
						southWest: { lat: 37.7396, lon: -122.4863 },
						northEast: { lat: 37.7749, lon: -122.4194 },
					});
				}
			});

			test('returns success result for boundary values', () => {
				const input = {
					southWest: { lat: -90, lon: -180 },
					northEast: { lat: 90, lon: 180 },
				};
				const result = bbox.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({
						southWest: { lat: -90, lon: -180 },
						northEast: { lat: 90, lon: 180 },
					});
				}
			});

			test('returns success result for minimum size bbox', () => {
				const input = {
					southWest: { lat: 0, lon: 0 },
					northEast: { lat: 0.001, lon: 0.001 },
				};
				const result = bbox.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({
						southWest: { lat: 0, lon: 0 },
						northEast: { lat: 0.001, lon: 0.001 },
					});
				}
			});
		});

		describe('failure cases - returns error object', () => {
			test('returns error when southWest is missing', () => {
				const input = {
					northEast: { lat: 37.7749, lon: -122.4194 },
				};
				const result = bbox.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when northEast is missing', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -122.4863 },
				};
				const result = bbox.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when both corners are missing', () => {
				const input = {};
				const result = bbox.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when southWest.lat >= northEast.lat', () => {
				const input = {
					southWest: { lat: 40, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				};
				const result = bbox.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
					expect(result.error.message).toContain('southWest.lat');
				}
			});

			test('returns error when southWest.lon >= northEast.lon', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -120 },
					northEast: { lat: 37.7749, lon: -122.4194 },
				};
				const result = bbox.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
					expect(result.error.message).toContain('southWest.lon');
				}
			});

			test('coerces string coordinates to numbers (TypeBox behavior)', () => {
				const input = {
					southWest: { lat: '37.7396', lon: '-122.4863' },
					northEast: { lat: '37.7749', lon: '-122.4194' },
				};
				const result = bbox.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({
						southWest: { lat: 37.7396, lon: -122.4863 },
						northEast: { lat: 37.7749, lon: -122.4194 },
					});
				}
			});

			test('strips additional properties (TypeBox behavior)', () => {
				const input = {
					southWest: { lat: 37.7396, lon: -122.4863 },
					northEast: { lat: 37.7749, lon: -122.4194 },
					extra: 'field',
				};
				const result = bbox.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({
						southWest: { lat: 37.7396, lon: -122.4863 },
						northEast: { lat: 37.7749, lon: -122.4194 },
					});
					expect(result.data).not.toHaveProperty('extra');
				}
			});

			test('returns error when input is null', () => {
				const result = bbox.safeParse(null);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when input is undefined', () => {
				const result = bbox.safeParse(undefined);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when input is not an object', () => {
				const result = bbox.safeParse('not an object');

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when coordinate out of range', () => {
				const input = {
					southWest: { lat: 91, lon: 0 },
					northEast: { lat: 92, lon: 10 },
				};
				const result = bbox.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});
		});
	});
});
