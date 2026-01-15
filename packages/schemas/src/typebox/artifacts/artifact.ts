import { Type } from '@sinclair/typebox';

export const ArtifactSchema = Type.Object(
	{
		$schema: Type.Optional(
			Type.String({
				format: 'uri',
				description: 'JSON Schema URI for this artifact instance.',
			}),
		),
		name: Type.String({
			description:
				'Unique artifact identifier. Must start with a letter or digit, can contain letters, numbers, and hyphens (no leading/trailing/consecutive hyphens).',
			pattern: '^[A-Za-z0-9]([A-Za-z0-9]|-[A-Za-z0-9])*$',
			minLength: 1,
			maxLength: 128,
		}),
		version: Type.String({
			description: 'Artifact version.',
			minLength: 1,
			maxLength: 200,
			pattern: '^[0-9]+\\.[0-9]+\\.[0-9]+$',
		}),
		title: Type.String({
			description: 'Human-readable title.',
			minLength: 1,
			maxLength: 200,
		}),
		description: Type.Optional(
			Type.String({
				description: 'Detailed description or context for the artifact.',
				minLength: 0,
				maxLength: 2000,
			}),
		),
		code: Type.Optional(
			Type.String({
				description: 'Optional user-defined internal code.',
				minLength: 1,
				maxLength: 200,
			}),
		),
		releaseDate: Type.Optional(
			Type.String({ format: 'date', description: 'Artifact release date' }),
		),

		metadata: Type.Optional(Type.Ref('Metadata')),
	},
	{
		title: 'Artifact',
		description:
			'Root schema for all OpenForm artifacts (containers and documents).',
	},
);
