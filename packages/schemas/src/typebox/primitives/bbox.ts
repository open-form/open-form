import { Type } from '@sinclair/typebox';

export const BboxSchema = Type.Object(
	{
		southWest: Type.Ref('Coordinate', {
			description:
				'Southwest corner coordinate (minimum latitude and longitude)',
		}),
		northEast: Type.Ref('Coordinate', {
			description:
				'Northeast corner coordinate (maximum latitude and longitude)',
		}),
	},
	{
		title: 'Bbox',
		description:
			'Geographic bounding box defined by southwest (minimum) and northeast (maximum) corner coordinates',
		additionalProperties: false,
	},
);
