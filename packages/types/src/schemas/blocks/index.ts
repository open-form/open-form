/**
 * Block types: form fields and field-related types
 */

import type {
  Coordinate,
  Bbox,
  Money,
  Address,
  Phone,
  Duration,
  Person,
  Organization,
  Identification,
} from "../primitives";

// ============================================================================
// Party Types
// ============================================================================

/** Base party fields shared between person/organization parties. */
interface PartyBase {
  /** Optional signature reference (image URI, ID, etc.). */
  signature?: string;
}

/**
 * Individual person party.
 */
export interface PartyPerson extends Person, PartyBase {
  type: "person";
}

/**
 * Organization party.
 */
export interface PartyOrganization extends Organization, PartyBase {
  type: "organization";
}

/**
 * Party definition used in artifacts (either person or organization).
 */
export type Party = PartyPerson | PartyOrganization;

// ============================================================================
// Base Field Properties
// ============================================================================

/**
 * Base field properties shared across all field types
 */
export interface BaseField {
  /** Human-readable label for the field. */
  label?: string;
  /** Whether this field is required. Can be a boolean or logic expression. */
  required?: boolean | string;
  /** Whether this field is visible. Can be a boolean or logic expression. Defaults to true. */
  visible?: boolean | string;
  /** Long-form description or helper text displayed in the UI. */
  description?: string;
  /** Whether the field is read-only/disabled. Can be a boolean or logic expression. */
  disabled?: boolean | string;
  /** Custom attribute-value pairs for field metadata. */
  attrs?: Record<string, string | number | boolean>;
}

/**
 * A fieldset field that contains nested fields.
 * This is a specific discriminated type where type is always 'fieldset'.
 */
export interface FieldsetField extends BaseField {
  /** Literal 'fieldset' discriminator. */
  type: "fieldset";
  /** Nested field definitions keyed by identifier. */
  fields: Record<string, Field>;
}

/**
 * Base field type for all specific field types.
 * A field is any control that captures user input or displays data.
 *
 * Note: This is a union type of all specific field types, not a generic interface.
 * This allows TypeScript to properly discriminate field types and access type-specific properties.
 *
 * The union type is defined after all individual field types to ensure proper type resolution.
 */
export type Field =
  | TextField
  | BooleanField
  | NumberField
  | CoordinateField
  | BboxField
  | MoneyField
  | AddressField
  | PhoneField
  | DurationField
  | EmailField
  | UuidField
  | UriField
  | EnumField
  | DateField
  | DatetimeField
  | TimeField
  | PersonField
  | OrganizationField
  | IdentificationField
  | MultiselectField
  | PercentageField
  | RatingField
  | FieldsetField;

// ============================================================================
// Specific Field Types (Discriminated Union Types)
// ============================================================================

/**
 * Text input field.
 */
export interface TextField extends BaseField {
  type: "text";
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  default?: string;
}

/**
 * Boolean checkbox/toggle field.
 */
export interface BooleanField extends BaseField {
  type: "boolean";
  default?: boolean;
}

/**
 * Number input field.
 */
export interface NumberField extends BaseField {
  type: "number";
  min?: number;
  max?: number;
  default?: number;
}

/**
 * Coordinate (latitude/longitude) input field.
 */
export interface CoordinateField extends BaseField {
  type: "coordinate";
  default?: Coordinate;
}

/**
 * Bounding box (geographic area) input field.
 */
export interface BboxField extends BaseField {
  type: "bbox";
  default?: Bbox;
}

/**
 * Money amount input field.
 */
export interface MoneyField extends BaseField {
  type: "money";
  min?: number;
  max?: number;
  default?: Money;
}

/**
 * Address input field.
 */
export interface AddressField extends BaseField {
  type: "address";
  default?: Address;
}

/**
 * Phone number input field.
 */
export interface PhoneField extends BaseField {
  type: "phone";
  default?: Phone;
}

/**
 * Duration (ISO 8601) input field.
 */
export interface DurationField extends BaseField {
  type: "duration";
  default?: Duration;
}

/**
 * Email address input field.
 */
export interface EmailField extends BaseField {
  type: "email";
  minLength?: number;
  maxLength?: number;
  default?: string;
}

/**
 * UUID input field.
 */
export interface UuidField extends BaseField {
  type: "uuid";
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  default?: string;
}

/**
 * URI/URL input field.
 */
export interface UriField extends BaseField {
  type: "uri";
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  default?: string;
}

/**
 * Enum/select dropdown field.
 */
export interface EnumField extends BaseField {
  type: "enum";
  enum: (string | number)[];
  default?: string | number;
}

/**
 * Date input field (ISO 8601 format: YYYY-MM-DD).
 */
export interface DateField extends BaseField {
  type: "date";
  min?: string;
  max?: string;
  default?: string;
}

/**
 * Datetime input field (ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ).
 */
export interface DatetimeField extends BaseField {
  type: "datetime";
  min?: string;
  max?: string;
  default?: string;
}

/**
 * Time input field (HH:MM:SS format).
 */
export interface TimeField extends BaseField {
  type: "time";
  min?: string;
  max?: string;
  default?: string;
}

/**
 * Person information input field.
 */
export interface PersonField extends BaseField {
  type: "person";
  default?: Person;
}

/**
 * Organization information input field.
 */
export interface OrganizationField extends BaseField {
  type: "organization";
  default?: Organization;
}

/**
 * Identification document input field.
 */
export interface IdentificationField extends BaseField {
  type: "identification";
  allowedTypes?: string[];
  default?: Identification;
}

/**
 * Multi-select field allowing multiple selections from options.
 */
export interface MultiselectField extends BaseField {
  type: "multiselect";
  enum: (string | number)[];
  min?: number;
  max?: number;
  default?: (string | number)[];
}

/**
 * Percentage input field (0-100 by default).
 */
export interface PercentageField extends BaseField {
  type: "percentage";
  min?: number;
  max?: number;
  precision?: number;
  default?: number;
}

/**
 * Rating input field (1-5 by default).
 */
export interface RatingField extends BaseField {
  type: "rating";
  min?: number;
  max?: number;
  step?: number;
  default?: number;
}
