import { Type } from '@sinclair/typebox';

// Artifacts
import { FormSchema } from './artifacts/form';
import { DocumentSchema } from './artifacts/document';
import { BundleSchema, BundleContentItemSchema } from './artifacts/bundle';
import { ChecklistSchema, ChecklistItemSchema } from './artifacts/checklist';

// Form blocks (design-time)
import { FormFieldSchema } from './artifacts/form/field';
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

import { schemaId } from './config';

// Define the OpenFormModule that knows about all primitives + artifacts + blocks + runtime
export const OpenFormModule = Type.Module({

	// Form
	Form: FormSchema,
	FormField: FormFieldSchema,
	FormAnnex: FormAnnexSchema,
	FormParty: FormPartySchema,
	FormFieldset: FormFieldsetSchema,

	// Document
	Document: DocumentSchema,

	// Bundle
	Bundle: BundleSchema,
	BundleContentItem: BundleContentItemSchema,

	// Checklist
	Checklist: ChecklistSchema,
	ChecklistItem: ChecklistItemSchema,

	// Logic (shared schemas used across multiple types)
	CondExpr: CondExprSchema,
	LogicSection: LogicSectionSchema,

	// Shared
	Layer: LayerSchema,
	
	// Primitives
	Address: AddressSchema,
	Bbox: BboxSchema,
	Coordinate: CoordinateSchema,
	Duration: DurationSchema,
	Identification: IdentificationSchema,
	Money: MoneySchema,
	Metadata: MetadataSchema,
	Organization: OrganizationSchema,
	Person: PersonSchema,
	Phone: PhoneSchema,
	Attachment: AttachmentSchema,
	Signature: SignatureSchema,

	// Define OpenForm *inside* the module, using string refs
	OpenForm: Type.Union(
		[
			Type.Ref('Form'),
			Type.Ref('Document'),
			Type.Ref('Checklist'),
			Type.Ref('Bundle'),
		],
		{
			$id: schemaId('open-form'),
			$schema: 'https://json-schema.org/draft/2020-12/schema',
			title: 'OpenForm',
			description: 'Root schema for any OpenForm artifact document',
		},
	),
});

// Import the root type you want to expose
export const OpenForm = OpenFormModule.Import('OpenForm');
