import { Type } from '@sinclair/typebox';

export const CoordinateSchema = Type.Object(
	{
		lat: Type.Number({
			minimum: -90,
			maximum: 90,
			description:
				'Latitude in decimal degrees (WGS84), range -90 (South Pole) to 90 (North Pole)',
		}),
		lon: Type.Number({
			minimum: -180,
			maximum: 180,
			description:
				'Longitude in decimal degrees (WGS84), range -180 (west) to 180 (east)',
		}),
	},
	{
		title: 'Coordinate',
		description:
			'Geographic coordinate (WGS84) with latitude and longitude in decimal degrees',
		additionalProperties: false,
	},
);
