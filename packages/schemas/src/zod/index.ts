// Config
export { SCHEMA_VERSION, SCHEMA_BASE, SCHEMA_ROOT_ID, SCHEMA_VERSIONED_ID, schemaId } from './config';

// Module and Registry
export { OpenFormSchema, OpenFormRegistry } from './module';

// Artifacts
export {
	FormSchema,
	DocumentSchema,
	BundleSchema,
	ChecklistSchema,
	BundleContentItemSchema,
	ChecklistItemSchema,
} from './module';

// Form blocks
export {
	FormFieldSchema,
	FormAnnexSchema,
	FormPartySchema,
	FormFieldsetSchema,
} from './module';

// Field types
export { FieldsetFieldSchema } from './artifacts/form/field';

// Shared
export { ArtifactSchema } from './artifacts/shared/base';
export { LayerSchema } from './artifacts/shared/layer';

// Primitives
export {
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
} from './primitives';

// Logic
export {
	CondExprSchema,
	LogicSectionSchema,
	LogicExpressionSchema,
	SCALAR_LOGIC_TYPES,
	OBJECT_LOGIC_TYPES,
	ALL_LOGIC_TYPES,
} from './artifacts/logic';

export type {
	ScalarLogicType,
	ObjectLogicType,
	LogicExpressionType,
} from './artifacts/logic';

// Registry schemas
export {
	GlobalConfigSchema,
	GlobalDefaultsSchema,
	RegistryEntrySchema,
	RegistryEntryObjectSchema,
	LockFileSchema,
	LockedArtifactSchema,
	LockedLayerSchema,
	RegistryIndexSchema,
	RegistryItemSummarySchema,
	RegistryItemSchema,
	RegistryLayerSchema,
	RegistryInlineLayerSchema,
	RegistryFileLayerSchema,
} from './registry';

export type {
	GlobalConfig,
	GlobalDefaults,
	RegistryEntry,
	RegistryEntryObject,
	LockFile,
	LockedArtifact,
	LockedLayer,
	RegistryIndex,
	RegistryItemSummary,
	RegistryItem,
	RegistryLayer,
	RegistryInlineLayer,
	RegistryFileLayer,
} from './registry';

// Manifest
export { ManifestSchema } from './manifest';
export type { Manifest, ManifestRegistryEntry, ManifestArtifactConfig } from './manifest';
