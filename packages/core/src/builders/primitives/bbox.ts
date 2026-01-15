import { coerceTypes } from '@/validators/coerce';
import { validateBbox, validateCoordinate } from '@/validators';
import { type Bbox, type Coordinate } from '@open-form/types';
import { extractSchema } from '@/schemas/extract';

const bboxSchema = extractSchema('Bbox') as Record<string, unknown>;
const coordinateSchema = extractSchema('Coordinate') as Record<string, unknown>;

function parseCoordinate(input: unknown): Coordinate {
	const coerced = coerceTypes(coordinateSchema, input) as Record<string, unknown>;

	// Check for NaN values
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

function parse(input: unknown): Bbox {
	const coerced = coerceTypes(bboxSchema, input) as Record<string, unknown>;

	// Validate the bbox structure first
	if (!validateBbox(coerced)) {
		const errors = (validateBbox as unknown as { errors: Array<{ message?: string }> }).errors;
		throw new Error(`Invalid Bbox: ${errors?.[0]?.message || 'validation failed'}`);
	}

	const bbox = coerced as unknown as Bbox;

	// Validate that southWest is actually southwest of northEast
	if (bbox.southWest.lat >= bbox.northEast.lat) {
		throw new Error(
			`Invalid bbox: southWest.lat (${bbox.southWest.lat}) must be less than northEast.lat (${bbox.northEast.lat})`,
		);
	}

	if (bbox.southWest.lon >= bbox.northEast.lon) {
		throw new Error(
			`Invalid bbox: southWest.lon (${bbox.southWest.lon}) must be less than northEast.lon (${bbox.northEast.lon})`,
		);
	}

	return bbox;
}

class BboxBuilder {
	private _def: Partial<Bbox> = {};

	from(bbox: Bbox): this {
		this._def = { ...parse(bbox) };
		return this;
	}

	southWest(value: Coordinate): this {
		this._def.southWest = parseCoordinate(value);
		return this;
	}

	northEast(value: Coordinate): this {
		this._def.northEast = parseCoordinate(value);
		return this;
	}

	bounds(
		southWest: Coordinate,
		northEast: Coordinate,
	): this {
		this._def.southWest = parseCoordinate(southWest);
		this._def.northEast = parseCoordinate(northEast);
		return this;
	}

	build(): Bbox {
		return parse(this._def);
	}
}

type BboxAPI = {
	(): BboxBuilder;
	(input: Bbox): Bbox;
	parse(input: unknown): Bbox;
	safeParse(
		input: unknown,
	): { success: true; data: Bbox } | { success: false; error: Error };
};

function bboxImpl(): BboxBuilder;
function bboxImpl(input: Bbox): Bbox;
function bboxImpl(input?: Bbox): BboxBuilder | Bbox {
	if (input !== undefined) {
		return parse(input);
	}
	return new BboxBuilder();
}

export const bbox: BboxAPI = Object.assign(bboxImpl, {
	parse,
	safeParse: (
		input: unknown,
	): { success: true; data: Bbox } | { success: false; error: Error } => {
		try {
			return { success: true, data: parse(input) };
		} catch (err) {
			return { success: false, error: err as Error };
		}
	},
});
