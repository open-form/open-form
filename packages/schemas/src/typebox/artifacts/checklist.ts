import { schemaId } from '../config';

import { Type } from '@sinclair/typebox';
import { ArtifactSchema } from './artifact';

// --- Status spec for checklist items (template-time) ---

const BooleanStatusSpecSchema = Type.Object(
	{
		kind: Type.Literal('boolean'),
		default: Type.Optional(
			Type.Boolean({
				description: 'Default status value (true/false) for new instances',
			}),
		),
	},
	{
		title: 'BooleanStatusSpec',
		description:
			'Boolean status (e.g., incomplete/complete) with an optional default value.',
	},
);

const EnumStatusOptionSchema = Type.Object(
	{
		value: Type.String({
			description:
				'Internal status value (e.g., "todo", "in-progress", "done")',
			minLength: 1,
			maxLength: 64,
		}),
		label: Type.String({
			description: 'Human-readable label for the status option',
			minLength: 1,
			maxLength: 256,
		}),
		description: Type.Optional(
			Type.String({
				description: 'Optional description or help text for this status option',
				minLength: 1,
				maxLength: 2000,
			}),
		),
	},
	{
		title: 'EnumStatusOption',
		additionalProperties: false,
	},
);

const EnumStatusSpecSchema = Type.Object(
	{
		kind: Type.Literal('enum'),
		options: Type.Array(EnumStatusOptionSchema, {
			minItems: 1,
			description: 'Allowed status options',
		}),
		default: Type.Optional(
			Type.String({
				description:
					'Default status value for new instances (must match one of the option values)',
				minLength: 1,
				maxLength: 64,
			}),
		),
	},
	{
		title: 'EnumStatusSpec',
		description:
			'Enum-based status with a set of allowed options and an optional default.',
	},
);

const StatusSpecSchema = Type.Union(
	[BooleanStatusSpecSchema, EnumStatusSpecSchema],
	{
		title: 'StatusSpec',
		description:
			'Specification for how checklist item status should be represented (boolean or enum).',
	},
);

// --- Checklist item (template-time definition) ---

export const ChecklistItemSchema = Type.Object(
	{
		id: Type.String({
			description:
				'Unique identifier for the checklist item (e.g., "task-1", "step-a"). Used to link to runtime status.',
			minLength: 1,
			maxLength: 128,
		}),
		title: Type.String({
			description: 'Title or label for the checklist item',
			minLength: 1,
			maxLength: 500,
		}),
		description: Type.Optional(
			Type.String({
				description: 'Detailed description or instructions for the item',
				minLength: 1,
				maxLength: 2000,
			}),
		),

		// 👇 NEW: template-time status specification
		status: Type.Optional(StatusSpecSchema),
	},
	{
		title: 'ChecklistItem',
		additionalProperties: false,
		description:
			'A single item in a checklist artifact. Each item has an ID, title, optional description, and an optional status specification (boolean or enum). If status is omitted, a default boolean status may be assumed (implementation-defined).',
	},
);

// --- Checklist artifact (template-time) ---

export const ChecklistSchema = Type.Intersect(
	[
		ArtifactSchema,
		Type.Object({
			kind: Type.Literal('checklist'),
			items: Type.Array(Type.Ref('ChecklistItem'), {
				description:
					'Array of checklist items. Each item represents a task, step, or requirement.',
			}),
			layers: Type.Optional(
				Type.Record(
					Type.String({
						minLength: 1,
						maxLength: 100,
						description: 'Layer identifier (user-defined key)',
					}),
					Type.Ref('Layer'),
					{
						description:
							'Named layers for rendering this checklist into different formats. Keys are user-defined identifiers (e.g., markdown, pdf, html)',
					}
				)
			),
			defaultLayer: Type.Optional(
				Type.String({
					minLength: 1,
					maxLength: 100,
					description:
						'Key of the default layer to use when none specified at render time',
				})
			),
		}),
	],
	{
		unevaluatedProperties: false,
		$id: schemaId('checklist'),
		$schema: 'https://json-schema.org/draft/2020-12/schema',
		title: 'Checklist',
		description:
			'A checklist artifact containing an ordered list of items to track. Each item may define how its status should be represented at runtime (boolean or enum).',
	},
);
