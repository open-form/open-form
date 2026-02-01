import { z } from 'zod';
import { schemaId } from './config';

// Artifacts
import { FormSchema } from './artifacts/form';
import { DocumentSchema } from './artifacts/document';
import { BundleSchema, BundleContentItemSchema } from './artifacts/bundle';
import { ChecklistSchema, ChecklistItemSchema } from './artifacts/checklist';

// Form blocks (design-time)
import { FormFieldSchema, FieldsetFieldSchema } from './artifacts/form/field';
import { FormAnnexSchema } from './artifacts/form/annex';
import { FormPartySchema } from './artifacts/form/party';
import { FormFieldsetSchema } from './artifacts/form/fieldset';

// Shared
import { LayerSchema } from './artifacts/shared/layer';

// Primitives
import { AddressSchema } from './primitives/address';
import { AttachmentSchema } from './primitives/attachment';
import { BboxSchema } from './primitives/bbox';
import { CoordinateSchema } from './primitives/coordinate';
import { DurationSchema } from './primitives/duration';
import { IdentificationSchema } from './primitives/identification';
import { MoneySchema } from './primitives/money';
import { MetadataSchema } from './primitives/metadata';
import { OrganizationSchema } from './primitives/organization';
import { PersonSchema } from './primitives/person';
import { PhoneSchema } from './primitives/phone';
import { SignatureSchema } from './primitives/signature';

// Logic
import { CondExprSchema } from './artifacts/logic/cond-expr';
import { LogicSectionSchema } from './artifacts/logic/logic-section';

/**
 * OpenForm Schema Registry
 *
 * This registry contains all OpenForm schemas with their metadata (id, title, description).
 * Use z.toJSONSchema(OpenFormRegistry) to generate JSON Schema with proper $refs.
 */
export const OpenFormRegistry = z.globalRegistry;

// Register all schemas with their IDs for $ref generation
OpenFormRegistry.add(FormSchema, { id: 'Form' });
OpenFormRegistry.add(DocumentSchema, { id: 'Document' });
OpenFormRegistry.add(BundleSchema, { id: 'Bundle' });
OpenFormRegistry.add(ChecklistSchema, { id: 'Checklist' });
OpenFormRegistry.add(BundleContentItemSchema, { id: 'BundleContentItem' });
OpenFormRegistry.add(ChecklistItemSchema, { id: 'ChecklistItem' });

OpenFormRegistry.add(FormFieldSchema, { id: 'FormField' });
// FieldsetFieldSchema already has id via .meta({ id: 'FieldsetField' }) - no need to add again
OpenFormRegistry.add(FormAnnexSchema, { id: 'FormAnnex' });
OpenFormRegistry.add(FormPartySchema, { id: 'FormParty' });
OpenFormRegistry.add(FormFieldsetSchema, { id: 'FormFieldset' });

OpenFormRegistry.add(LayerSchema, { id: 'Layer' });

OpenFormRegistry.add(AddressSchema, { id: 'Address' });
OpenFormRegistry.add(AttachmentSchema, { id: 'Attachment' });
OpenFormRegistry.add(BboxSchema, { id: 'Bbox' });
OpenFormRegistry.add(CoordinateSchema, { id: 'Coordinate' });
OpenFormRegistry.add(DurationSchema, { id: 'Duration' });
OpenFormRegistry.add(IdentificationSchema, { id: 'Identification' });
OpenFormRegistry.add(MoneySchema, { id: 'Money' });
OpenFormRegistry.add(MetadataSchema, { id: 'Metadata' });
OpenFormRegistry.add(OrganizationSchema, { id: 'Organization' });
OpenFormRegistry.add(PersonSchema, { id: 'Person' });
OpenFormRegistry.add(PhoneSchema, { id: 'Phone' });
OpenFormRegistry.add(SignatureSchema, { id: 'Signature' });

OpenFormRegistry.add(CondExprSchema, { id: 'CondExpr' });
OpenFormRegistry.add(LogicSectionSchema, { id: 'LogicSection' });

/**
 * OpenForm root schema - union of all artifact types
 */
export const OpenFormSchema = z.union([
	FormSchema,
	DocumentSchema,
	ChecklistSchema,
	BundleSchema,
]).meta({
	id: schemaId('open-form'),
	$schema: 'https://json-schema.org/draft/2020-12/schema',
	title: 'OpenForm',
	description: 'Root schema for any OpenForm artifact document',
});

OpenFormRegistry.add(OpenFormSchema, { id: 'OpenForm' });

// Export all schemas for direct import
export {
	// Artifacts
	FormSchema,
	DocumentSchema,
	BundleSchema,
	ChecklistSchema,
	BundleContentItemSchema,
	ChecklistItemSchema,

	// Form blocks
	FormFieldSchema,
	FieldsetFieldSchema,
	FormAnnexSchema,
	FormPartySchema,
	FormFieldsetSchema,

	// Shared
	LayerSchema,

	// Primitives
	AddressSchema,
	AttachmentSchema,
	BboxSchema,
	CoordinateSchema,
	DurationSchema,
	IdentificationSchema,
	MoneySchema,
	MetadataSchema,
	OrganizationSchema,
	PersonSchema,
	PhoneSchema,
	SignatureSchema,

	// Logic
	CondExprSchema,
	LogicSectionSchema,
};
