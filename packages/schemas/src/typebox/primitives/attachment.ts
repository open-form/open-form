import { Type } from '@sinclair/typebox';

/**
 * Attachment Schema
 *
 * Represents an attached document (filled data).
 * The key in the record is the annex identifier (the key from form.annexes).
 */
export const AttachmentSchema = Type.Object(
	{
		name: Type.String({
			description: 'Original file name',
			minLength: 1,
			maxLength: 255,
		}),
		mimeType: Type.String({
			description: 'MIME type of the attached file',
			minLength: 1,
			maxLength: 100,
		}),
		checksum: Type.Optional(
			Type.String({
				description: 'SHA-256 checksum for integrity verification',
				pattern: '^sha256:[a-f0-9]{64}$',
			}),
		),
	},
	{
		title: 'Attachment',
		additionalProperties: false,
		description:
			'Attachment data representing an attached document. The key in the record is the annex identifier (the key from form.annexes).',
	},
);
