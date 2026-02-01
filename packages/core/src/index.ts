// ============================================================================
// ARTIFACTS (Design-time + Runtime)
// ============================================================================

export {
  // Form
  FormValidationError,
  form,
  field,
  textField,
  booleanField,
  numberField,
  coordinateField,
  bboxField,
  moneyField,
  addressField,
  phoneField,
  durationField,
  emailField,
  uuidField,
  uriField,
  enumField,
  dateField,
  datetimeField,
  timeField,
  personField,
  organizationField,
  identificationField,
  multiselectField,
  percentageField,
  ratingField,
  fieldsetField,
  fieldset,
  annex,
  party,
  // Checklist
  checklist,
  // Document
  document,
  // Bundle
  bundle,
  // Shared
  layer,
  fileLayer,
  inlineLayer,
  // Serialization helpers
  runtimeFormFromJSON,
  runtimeDocumentFromJSON,
  runtimeChecklistFromJSON,
  runtimeBundleFromJSON,
  // Shared utilities
  withArtifactMethods,
  renderLayer,
  resolveLayerKey,
  resolveAndRenderLayer,
  // Unified namespace
  open,
} from "./artifacts";

export type {
  // Form types
  FormInstance,
  RuntimeForm,
  DraftForm,
  SignableForm,
  ExecutedForm,
  FormInput,
  RuntimeFormJSON,
  InferFormPayload,
  ExtractFields,
  FieldKeys,
  PartyRoleKeys,
  CaptureOptions,
  // Document types
  DocumentInstance,
  RuntimeDocument,
  DraftDocument,
  FinalDocument,
  DocumentInput,
  RuntimeDocumentJSON,
  // Checklist types
  ChecklistInstance,
  RuntimeChecklist,
  DraftChecklist,
  CompletedChecklist,
  ChecklistInput,
  RuntimeChecklistJSON,
  InferChecklistPayload,
  ItemStatusToDataType,
  ItemsToDataType,
  // Bundle types
  BundleInstance,
  RuntimeBundle,
  DraftBundle,
  SignableBundle,
  ExecutedBundle,
  BundleInput,
  RuntimeBundleJSON,
  RuntimeInstance,
  RuntimeBundleContents,
  RuntimeBundleRenderOptions,
  RuntimeBundleRenderedOutput,
  RuntimeBundleRendered,
  // Shared types
  ArtifactMethods,
  LayerRenderOptions,
  // Builder types
  FieldAPI,
  TextFieldBuilder,
  BooleanFieldBuilder,
  NumberFieldBuilder,
  CoordinateFieldBuilder,
  BboxFieldBuilder,
  MoneyFieldBuilder,
  AddressFieldBuilder,
  PhoneFieldBuilder,
  DurationFieldBuilder,
  EmailFieldBuilder,
  UuidFieldBuilder,
  UriFieldBuilder,
  EnumFieldBuilder,
  DateFieldBuilder,
  DatetimeFieldBuilder,
  TimeFieldBuilder,
  PersonFieldBuilder,
  OrganizationFieldBuilder,
  IdentificationFieldBuilder,
  MultiselectFieldBuilder,
  PercentageFieldBuilder,
  RatingFieldBuilder,
  FieldsetFieldBuilder,
  PartyAPI,
  PartyBuilder,
  FieldsetAPI,
  FieldsetBuilder,
  LayerAPI,
  FileLayerBuilderType,
  InlineLayerBuilderType,
  LayerBuilderType,
  AnnexAPI,
  AnnexBuilder,
  Open,
} from "./artifacts";

// ============================================================================
// PRIMITIVES
// ============================================================================

export {
  address,
  attachment,
  bbox,
  coordinate,
  date,
  datetime,
  duration,
  identification,
  metadata,
  money,
  organization,
  partyData,
  percentage,
  person,
  phone,
  rating,
  signature,
  time,
} from "./primitives";

// ============================================================================
// RENDERING
// ============================================================================

export { assembleBundle } from "./rendering";

export type {
  ResolvedArtifact,
  ArtifactResolver,
  RendererRegistry,
  AssemblyContentEntry,
  BundleAssemblyOptions,
  AssembledBundleOutput,
  AssembledBundle,
} from "./rendering";

// ============================================================================
// RESOLVERS
// ============================================================================

export { createMemoryResolver } from "./resolvers";

export type {
  MemoryResolverOptions,
  Resolver,
} from "./resolvers";

// ============================================================================
// VALIDATION
// ============================================================================

export {
  // Type guards
  isForm,
  isDocument,
  isBundle,
  isChecklist,
  isFormField,
  isFormAnnex,
  isFormFieldset,
  isFormParty,
  isLayer,
  isParty,
  isSignature,
  isAttachment,
  isAddress,
  isBbox,
  isCoordinate,
  isDuration,
  isIdentification,
  isMetadata,
  isMoney,
  isOrganization,
  isPerson,
  isPhone,
  // Validators
  validateForm,
  validateDocument,
  validateBundle,
  validateChecklist,
  validateFormField,
  validateFormAnnex,
  validateFormFieldset,
  validateFormParty,
  validateLayer,
  validateChecklistItem,
  validateBundleContentItem,
  validateSignature,
  validateAttachment,
  validateAddress,
  validateBbox,
  validateCoordinate,
  validateDuration,
  validateIdentification,
  validateMetadata,
  validateMoney,
  validateOrganization,
  validatePerson,
  validatePhone,
  // Party validation
  validatePartyForRole,
  isPartyTypeAllowed,
  inferPartyType,
  expectsArrayFormat,
  validatePartyId,
  validatePartiesForRole,
  // Artifact validation
  validateArtifact,
  parseArtifact,
} from "./validation";

export type {
  ValidationError,
  ValidationSuccess,
  ValidationFailure,
  ValidationResult,
  ValidateOptions,
  PartyValidationResult,
  ExtendedValidationResult,
} from "./validation";

// ============================================================================
// INFERENCE (Type utilities)
// ============================================================================

export type {
  JsonSchema,
  FieldToDataType,
  FieldsToDataType,
  InferFormData,
  // InferFormPayload is already exported from ./artifacts
} from "./inference";

export { compile, compileToJsonSchema } from "./inference";

// ============================================================================
// SERIALIZATION
// ============================================================================

export * from "./serialization";

// ============================================================================
// CONSTANTS
// ============================================================================

export { OPENFORM_SCHEMA_URL } from "@open-form/schemas";

// ============================================================================
// LOGIC
// ============================================================================

export * from "./logic";

// ============================================================================
// SCHEMAS (Type re-exports from @open-form/types)
// ============================================================================

// Artifact types
export type {
  ArtifactBase,
  Form,
  Document,
  Checklist,
  ChecklistItem,
  StatusSpec,
  EnumStatusOption,
  Bundle,
  BundleContentItem,
  Layer,
  InlineLayer,
  FileLayer,
} from "@open-form/types";

// Block types (fields, fieldsets, annexes, parties)
export type {
  FormField,
  FieldsetField,
  TextField,
  NumberField,
  BooleanField,
  EnumField,
  EmailField,
  UriField,
  UuidField,
  AddressField,
  PhoneField,
  CoordinateField,
  BboxField,
  MoneyField,
  DurationField,
  FormFieldset,
  FormAnnex,
  Party,
  Bindings,
} from "@open-form/types";

// Primitive types
export type {
  Coordinate,
  Address,
  Phone,
  Money,
  Duration,
  Person,
  Organization,
  Identification,
  Bbox,
  Metadata,
} from "@open-form/types";

// Artifact union type and kind
export type { Artifact } from "@open-form/types";
export type ArtifactKind = "form" | "document" | "checklist" | "bundle";

// ============================================================================
// LOAD
// ============================================================================

export {
  load,
  safeLoad,
  loadFromObject,
  safeLoadFromObject,
  LoadError,
  // Type guards for artifact discrimination
  isFormInstance,
  isDocumentInstance,
  isBundleInstance,
  isChecklistInstance,
} from "./serialization";

export type { AnyArtifactInstance } from "./serialization";

// ============================================================================
// TYPES
// ============================================================================

export type {
  SerializationFormat,
  SerializationOptions,
  RenderOptions,
  RuntimeFormRenderOptions,
  RuntimeChecklistRenderOptions,
  FillOptions,
  InstanceTemplate,
} from "./types";

// Re-export from @open-form/types
export type {
  ChecklistData,
  SerializerRegistry,
  SerializerConfig,
} from "@open-form/types";

// Re-export sealing types from @open-form/types
export type {
  SigningFieldType,
  SigningField,
  SealingRequest,
  SealingResult,
  Sealer,
  // Legacy aliases (deprecated)
  FormalSigningRequest,
  FormalSigningResponse,
  FormalSigningAdapter,
} from "@open-form/types";

// ============================================================================
// UTILITIES
// ============================================================================

export { validateArtifact as validate } from "./validation";
export { parse } from "./serialization";
