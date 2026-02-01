import { z } from 'zod';
import { schemaId } from '../../config';
import { ArtifactSchema } from '../shared/base';
import { LayerSchema } from '../shared/layer';
import { LogicSectionSchema } from '../logic/logic-section';
import { FormFieldSchema } from './field';
import { FormAnnexSchema } from './annex';
import { FormPartySchema } from './party';

// Re-export all form-related schemas
export { FormFieldSchema, FieldsetFieldSchema } from './field';
export { FormFieldsetSchema } from './fieldset';
export { FormAnnexSchema } from './annex';
export { FormPartySchema } from './party';

export const FormSchema = ArtifactSchema.extend({
	kind: z.literal('form'),
	logic: LogicSectionSchema.optional(),
	fields: z.record(
		z.string()
			.min(1)
			.max(100)
			.describe('Field identifier'),
		FormFieldSchema,
	).describe('Form field definitions keyed by field identifier. Fields define the input structure and validation rules for the form')
		.optional(),
	layers: z.record(
		z.string()
			.min(1)
			.max(100)
			.describe('Layer identifier (user-defined key)'),
		LayerSchema,
	).describe('Named layers for rendering this form into different formats. Keys are user-defined identifiers (e.g., markdown, pdf, html)')
		.optional(),
	defaultLayer: z.string()
		.min(1)
		.max(100)
		.describe('Key of the default layer to use when none specified at render time')
		.optional(),
	allowAdditionalAnnexes: z.boolean()
		.default(false)
		.describe('Whether additional ad-hoc annexes can be attached beyond those defined in the annexes record')
		.optional(),
	annexes: z.record(
		z.string()
			.min(1)
			.max(100)
			.regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/)
			.describe('Annex identifier (e.g., exhibit-a, schedule-1)'),
		FormAnnexSchema,
	).describe('Predefined annex slots keyed by identifier. Each slot can be marked as required (must be filled at runtime) or optional')
		.optional(),
	parties: z.record(
		z.string()
			.min(1)
			.max(50)
			.regex(/^[a-z][a-z0-9_-]*$/)
			.describe('Party role identifier (e.g., buyer, seller, landlord)'),
		FormPartySchema,
	).describe('Party role definitions keyed by role identifier. Each role specifies constraints on who can fill it (person/organization) and signature requirements.')
		.optional(),
}).meta({
	id: schemaId('form'),
	$schema: 'https://json-schema.org/draft/2020-12/schema',
	title: 'Form',
	description: 'A form artifact that defines a data contract with field definitions, optional layers for rendering, and optional annexes. Forms are the primary artifact type for structured data collection and document generation.',
}).strict();
