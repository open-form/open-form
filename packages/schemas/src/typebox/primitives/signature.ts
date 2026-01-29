import { Type } from '@sinclair/typebox';

/**
 * Signature Schema
 *
 * Represents a captured signature (filled data).
 */
export const SignatureSchema = Type.Object(
	{
		image: Type.Optional(
			Type.String({
				description: 'Base64-encoded signature image or data URI',
				minLength: 1,
			}),
		),
		timestamp: Type.String({
			format: 'date-time',
			description: 'ISO 8601 date-time when the signature was captured',
		}),
		method: Type.Union(
			[
				Type.Literal('drawn'),
				Type.Literal('typed'),
				Type.Literal('uploaded'),
				Type.Literal('certificate'),
			],
			{
				description: 'Method used to capture the signature',
			},
		),
		type: Type.Optional(
			Type.Union(
				[Type.Literal('signature'), Type.Literal('initials')],
				{
					default: 'signature',
					description: 'Whether this is a full signature or initials',
				},
			),
		),
		metadata: Type.Optional(
			Type.Record(
				Type.String(),
				Type.Unknown(),
				{
					description: 'Additional metadata (IP address, device info, etc.)',
				},
			),
		),
	},
	{
		title: 'Signature',
		additionalProperties: false,
		description:
			'Captured signature data containing the signature image, timestamp, capture method, and optional metadata.',
	},
);
