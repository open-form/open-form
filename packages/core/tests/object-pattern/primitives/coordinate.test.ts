import { describe, test, expect } from 'vitest';
import { coordinate } from '@/builders/primitives/coordinate';
import type { Coordinate } from '@/schemas/primitives';

describe('Coordinate (Object Pattern)', () => {
	describe('coordinate() - direct validation', () => {
		describe('success cases', () => {
			test('creates valid coordinate with positive values', () => {
				const input: Coordinate = { lat: 37.7749, lon: -122.4194 };
				const result = coordinate(input);
				expect(result).toEqual({ lat: 37.7749, lon: -122.4194 });
			});

			test('creates valid coordinate at equator and prime meridian', () => {
				const input: Coordinate = { lat: 0, lon: 0 };
				const result = coordinate(input);
				expect(result).toEqual({ lat: 0, lon: 0 });
			});

			test('creates valid coordinate with negative latitude', () => {
				const input: Coordinate = { lat: -33.8688, lon: 151.2093 };
				const result = coordinate(input);
				expect(result).toEqual({ lat: -33.8688, lon: 151.2093 });
			});

			test('creates valid coordinate at North Pole', () => {
				const input: Coordinate = { lat: 90, lon: 0 };
				const result = coordinate(input);
				expect(result).toEqual({ lat: 90, lon: 0 });
			});

			test('creates valid coordinate at South Pole', () => {
				const input: Coordinate = { lat: -90, lon: 0 };
				const result = coordinate(input);
				expect(result).toEqual({ lat: -90, lon: 0 });
			});

			test('creates valid coordinate at maximum longitude', () => {
				const input: Coordinate = { lat: 0, lon: 180 };
				const result = coordinate(input);
				expect(result).toEqual({ lat: 0, lon: 180 });
			});

			test('creates valid coordinate at minimum longitude', () => {
				const input: Coordinate = { lat: 0, lon: -180 };
				const result = coordinate(input);
				expect(result).toEqual({ lat: 0, lon: -180 });
			});

			test('creates valid coordinates for major cities', () => {
				const cities = [
					{ lat: 51.5074, lon: -0.1278 }, // London
					{ lat: 40.7128, lon: -74.006 }, // New York
					{ lat: 35.6762, lon: 139.6503 }, // Tokyo
					{ lat: -23.5505, lon: -46.6333 }, // São Paulo
				];

				for (const city of cities) {
					const result = coordinate(city);
					expect(result).toEqual(city);
				}
			});

			test('handles high precision decimal values', () => {
				const input: Coordinate = { lat: 37.774929, lon: -122.419418 };
				const result = coordinate(input);
				expect(result).toEqual({ lat: 37.774929, lon: -122.419418 });
			});
		});

		describe('validation failures', () => {
			test('throws error when lat is missing', () => {
				const input = { lon: -122.4194 } as any;
				expect(() => coordinate(input)).toThrow();
			});

			test('throws error when lon is missing', () => {
				const input = { lat: 37.7749 } as any;
				expect(() => coordinate(input)).toThrow();
			});

			test('throws error when both fields are missing', () => {
				const input = {} as any;
				expect(() => coordinate(input)).toThrow();
			});

			test('throws error when lat exceeds maximum (90)', () => {
				const input = { lat: 90.1, lon: 0 } as any;
				expect(() => coordinate(input)).toThrow();
			});

			test('throws error when lat exceeds minimum (-90)', () => {
				const input = { lat: -90.1, lon: 0 } as any;
				expect(() => coordinate(input)).toThrow();
			});

			test('throws error when lon exceeds maximum (180)', () => {
				const input = { lat: 0, lon: 180.1 } as any;
				expect(() => coordinate(input)).toThrow();
			});

			test('throws error when lon exceeds minimum (-180)', () => {
				const input = { lat: 0, lon: -180.1 } as any;
				expect(() => coordinate(input)).toThrow();
			});

			test('throws error when lat is a string', () => {
				const input = { lat: '37.7749', lon: -122.4194 } as any;
				const result = coordinate(input);
				expect(result).toEqual({ lat: 37.7749, lon: -122.4194 }); // TypeBox coerces
			});

			test('throws error when lat is null', () => {
				const input = { lat: null, lon: -122.4194 } as any;
				expect(() => coordinate(input)).toThrow();
			});

			test('throws error when lat is undefined', () => {
				const input = { lat: undefined, lon: -122.4194 } as any;
				expect(() => coordinate(input)).toThrow();
			});

			test('throws error when lon is null', () => {
				const input = { lat: 37.7749, lon: null } as any;
				expect(() => coordinate(input)).toThrow();
			});

			test('throws error when lon is undefined', () => {
				const input = { lat: 37.7749, lon: undefined } as any;
				expect(() => coordinate(input)).toThrow();
			});

			test('strips additional properties (TypeBox behavior)', () => {
				const input = { lat: 37.7749, lon: -122.4194, extra: 'field' } as any;
				const result = coordinate(input);
				expect(result).toEqual({ lat: 37.7749, lon: -122.4194 });
				expect(result).not.toHaveProperty('extra');
			});

			test('throws error when input is null', () => {
				expect(() => coordinate(null as any)).toThrow();
			});

			test('returns builder when input is undefined (TypeBox behavior)', () => {
				const result = coordinate(undefined as any);
				expect(result).toBeDefined();
				expect(typeof result.lat).toBe('function');
			});

			test('throws error when input is a string', () => {
				expect(() => coordinate('not an object' as any)).toThrow();
			});

			test('throws error when input is a number', () => {
				expect(() => coordinate(123 as any)).toThrow();
			});

			test('throws error when input is an array', () => {
				expect(() => coordinate([37.7749, -122.4194] as any)).toThrow();
			});
		});
	});

	describe('coordinate.parse()', () => {
		describe('success cases', () => {
			test('parses valid coordinate object', () => {
				const input = { lat: 37.7749, lon: -122.4194 };
				const result = coordinate.parse(input);
				expect(result).toEqual({ lat: 37.7749, lon: -122.4194 });
			});

			test('parses coordinate at boundaries', () => {
				const inputs = [
					{ lat: 90, lon: 180 },
					{ lat: -90, lon: -180 },
					{ lat: 0, lon: 0 },
				];

				for (const input of inputs) {
					const result = coordinate.parse(input);
					expect(result).toEqual(input);
				}
			});
		});

		describe('validation failures', () => {
			test('throws error when lat is missing', () => {
				const input = { lon: -122.4194 };
				expect(() => coordinate.parse(input)).toThrow();
			});

			test('throws error when lon is missing', () => {
				const input = { lat: 37.7749 };
				expect(() => coordinate.parse(input)).toThrow();
			});

			test('throws error when lat out of range', () => {
				const input = { lat: 91, lon: 0 };
				expect(() => coordinate.parse(input)).toThrow();
			});

			test('throws error when lon out of range', () => {
				const input = { lat: 0, lon: 181 };
				expect(() => coordinate.parse(input)).toThrow();
			});

			test('strips additional properties (TypeBox behavior)', () => {
				const input = { lat: 37.7749, lon: -122.4194, extra: 'value' };
				const result = coordinate.parse(input);
				expect(result).toEqual({ lat: 37.7749, lon: -122.4194 });
				expect(result).not.toHaveProperty('extra');
			});

			test('throws error when input is null', () => {
				expect(() => coordinate.parse(null)).toThrow();
			});

			test('throws error when input is undefined', () => {
				expect(() => coordinate.parse(undefined)).toThrow();
			});

			test('throws error when input is not an object', () => {
				expect(() => coordinate.parse('string')).toThrow();
			});
		});
	});

	describe('coordinate.safeParse()', () => {
		describe('success cases', () => {
			test('returns success result for valid coordinate', () => {
				const input = { lat: 37.7749, lon: -122.4194 };
				const result = coordinate.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({ lat: 37.7749, lon: -122.4194 });
				}
			});

			test('returns success result for boundary values', () => {
				const inputs = [
					{ lat: 90, lon: 180 },
					{ lat: -90, lon: -180 },
					{ lat: 0, lon: 0 },
				];

				for (const input of inputs) {
					const result = coordinate.safeParse(input);
					expect(result.success).toBe(true);
					if (result.success) {
						expect(result.data).toEqual(input);
					}
				}
			});
		});

		describe('failure cases - returns error object', () => {
			test('returns error when lat is missing', () => {
				const input = { lon: -122.4194 };
				const result = coordinate.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when lon is missing', () => {
				const input = { lat: 37.7749 };
				const result = coordinate.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when lat out of range', () => {
				const input = { lat: 91, lon: 0 };
				const result = coordinate.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when lon out of range', () => {
				const input = { lat: 0, lon: 181 };
				const result = coordinate.safeParse(input);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('coerces string values to numbers (TypeBox behavior)', () => {
				const input = { lat: '37.7749', lon: '-122.4194' };
				const result = coordinate.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({ lat: 37.7749, lon: -122.4194 });
				}
			});

			test('strips additional properties (TypeBox behavior)', () => {
				const input = { lat: 37.7749, lon: -122.4194, extra: 'field' };
				const result = coordinate.safeParse(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual({ lat: 37.7749, lon: -122.4194 });
					expect(result.data).not.toHaveProperty('extra');
				}
			});

			test('returns error when input is null', () => {
				const result = coordinate.safeParse(null);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when input is undefined', () => {
				const result = coordinate.safeParse(undefined);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});

			test('returns error when input is not an object', () => {
				const result = coordinate.safeParse('not an object');

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeInstanceOf(Error);
				}
			});
		});
	});
});
