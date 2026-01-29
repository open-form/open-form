/**
 * Artifact types for OpenForm
 * Includes Document, Form, Checklist, and Bundle artifacts
 */

// Shared types
export type {
  ArtifactBase,
  Layer,
  InlineLayer,
  FileLayer,
  Bindings,
  CondExpr,
  // Logic expression types
  BaseLogicExpression,
  BooleanLogicExpression,
  StringLogicExpression,
  NumberLogicExpression,
  IntegerLogicExpression,
  PercentageLogicExpression,
  RatingLogicExpression,
  DateLogicExpression,
  TimeLogicExpression,
  DatetimeLogicExpression,
  DurationLogicExpression,
  MoneyLogicExpressionValue,
  AddressLogicExpressionValue,
  PhoneLogicExpressionValue,
  CoordinateLogicExpressionValue,
  BboxLogicExpressionValue,
  PersonLogicExpressionValue,
  OrganizationLogicExpressionValue,
  IdentificationLogicExpressionValue,
  MoneyLogicExpression,
  AddressLogicExpression,
  PhoneLogicExpression,
  CoordinateLogicExpression,
  BboxLogicExpression,
  PersonLogicExpression,
  OrganizationLogicExpression,
  IdentificationLogicExpression,
  ScalarLogicExpression,
  ObjectLogicExpression,
  LogicExpression,
  ScalarLogicType,
  ObjectLogicType,
  LogicExpressionType,
  LogicSection,
} from "./shared";

// Document artifact
export type { Document } from "./document";

// Checklist artifact
export type {
  BooleanStatusSpec,
  EnumStatusOption,
  EnumStatusSpec,
  StatusSpec,
  ChecklistItem,
  Checklist,
} from "./checklist";

// Bundle artifact
export type {
  BundleContentItem,
  InlineBundleItem,
  PathBundleItem,
  RegistryBundleItem,
  Bundle,
} from "./bundle";

// Form artifact and related types
export type {
  // Form type
  Form,
  // Field types
  BaseField,
  FieldsetField,
  FormField,
  TextField,
  BooleanField,
  NumberField,
  CoordinateField,
  BboxField,
  MoneyField,
  AddressField,
  PhoneField,
  DurationField,
  EmailField,
  UuidField,
  UriField,
  EnumField,
  DateField,
  DatetimeField,
  TimeField,
  PersonField,
  OrganizationField,
  IdentificationField,
  MultiselectField,
  PercentageField,
  RatingField,
  // Fieldset
  FormFieldset,
  // Annex
  FormAnnex,
  // Party
  FormParty,
  // Signature
  FormSignature,
} from "./form";

// Union types
export type { Artifact } from "./unions";
