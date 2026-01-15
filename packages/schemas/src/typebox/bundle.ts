import { Type, type Static } from '@sinclair/typebox';

// Artifacts
import { FormSchema } from './artifacts/form';
import { DocumentSchema } from './artifacts/document';
import { BundleSchema, BundleContentItemSchema } from './artifacts/bundle';
import { ChecklistSchema, ChecklistItemSchema } from './artifacts/checklist';

// Blocks
import { FieldSchema } from './blocks/field';
import { AnnexSchema } from './blocks/annex';
import { PartySchema } from './blocks/party';
import { FormPartySchema } from './blocks/form-party';
import { WitnessRequirementSchema } from './blocks/witness-requirement';
import { LayerSchema } from './blocks/layer';
import { FieldsetSchema } from './blocks/fieldset';

// Primitives
import { AddressSchema } from './primitives/address';
import { BboxSchema } from './primitives/bbox';
import { CoordinateSchema } from './primitives/coordinate';
import { DurationSchema } from './primitives/duration';
import { IdentificationSchema } from './primitives/identification';
import { MoneySchema } from './primitives/money';
import { MetadataSchema } from './primitives/metadata';
import { OrganizationSchema } from './primitives/organization';
import { PersonSchema } from './primitives/person';
import { PhoneSchema } from './primitives/phone';

// Logic
import { CondExprSchema } from './logic/cond-expr';
import { LogicSectionSchema } from './logic/logic-section';

import { schemaId } from './config';

// 1. Define a module that knows about all primitives + artifacts + blocks
export const OpenFormModule = Type.Module({
	// Logic (shared schemas used across multiple types)
	CondExpr: CondExprSchema,
	LogicSection: LogicSectionSchema,

	// Artifacts
	Form: FormSchema,
	Document: DocumentSchema,
	Bundle: BundleSchema,
	BundleContentItem: BundleContentItemSchema,
	Checklist: ChecklistSchema,
	ChecklistItem: ChecklistItemSchema,

	// Blocks
	Field: FieldSchema,
	Annex: AnnexSchema,
	Party: PartySchema,
	FormParty: FormPartySchema,
	WitnessRequirement: WitnessRequirementSchema,
	Layer: LayerSchema,
	Fieldset: FieldsetSchema,

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

	// 2. Define OpenForm *inside* the module, using string refs
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

// 3. Import the root type you want to expose
export const OpenForm = OpenFormModule.Import('OpenForm');
export type OpenFormPayload = Static<typeof OpenForm>;
