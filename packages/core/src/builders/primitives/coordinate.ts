import { coerceTypes } from '@/validators/coerce';
import { validateCoordinate } from '@/validators';
import { type Coordinate } from '@open-form/types';
import { extractSchema } from '@/schemas/extract';

const schema = extractSchema('Coordinate') as Record<string, unknown>;

function parse(input: unknown): Coordinate {
	// Coerce types to match schema expectations (replicates TypeBox behavior)
	const coerced = coerceTypes(schema, input) as Record<string, unknown>;

	// Check for NaN values (TypeBox rejects NaN, JSON Schema doesn't)
	if (typeof coerced.lat === 'number' && isNaN(coerced.lat)) {
		throw new Error('Invalid Coordinate: lat must be a valid number');
	}
	if (typeof coerced.lon === 'number' && isNaN(coerced.lon)) {
		throw new Error('Invalid Coordinate: lon must be a valid number');
	}

	if (!validateCoordinate(coerced)) {
		const errors = (validateCoordinate as unknown as { errors: Array<{ message?: string }> }).errors;
		throw new Error(`Invalid Coordinate: ${errors?.[0]?.message || 'validation failed'}`);
	}
	return coerced as unknown as Coordinate;
}

class CoordinateBuilder {
	private _def: Partial<Coordinate> = {};

	from(coordinate: Coordinate): this {
		this._def = { ...parse(coordinate) };
		return this;
	}

	lat(value: number): this {
		this._def.lat = value;
		return this;
	}

	lon(value: number): this {
		this._def.lon = value;
		return this;
	}

	point(lat: number, lon: number): this {
		this._def.lat = lat;
		this._def.lon = lon;
		return this;
	}

	build(): Coordinate {
		return parse(this._def);
	}
}

type CoordinateAPI = {
	(): CoordinateBuilder;
	(input: Coordinate): Coordinate;
	parse(input: unknown): Coordinate;
	safeParse(
		input: unknown,
	): { success: true; data: Coordinate } | { success: false; error: Error };
};

function coordinateImpl(): CoordinateBuilder;
function coordinateImpl(input: Coordinate): Coordinate;
function coordinateImpl(input?: Coordinate): CoordinateBuilder | Coordinate {
	if (input !== undefined) {
		return parse(input);
	}
	return new CoordinateBuilder();
}

export const coordinate: CoordinateAPI = Object.assign(coordinateImpl, {
	parse,
	safeParse: (
		input: unknown,
	): { success: true; data: Coordinate } | { success: false; error: Error } => {
		try {
			return { success: true, data: parse(input) };
		} catch (err) {
			return { success: false, error: err as Error };
		}
	},
});
