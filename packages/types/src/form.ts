/**
 * Form artifact and field type definitions
 * Lightweight definitions sufficient for rendering without depending on @open-form/schemas
 */

import type { Metadata } from './metadata.js'
import type { LogicSection } from './logic.js'
import type { Coordinate, Bbox, Money, Address, Phone, Duration, Person, Organization, Identification } from './primitives.js'

/**
 * Base field properties shared across all field types
 */
export interface BaseField {
	/** Human-readable label for the field. */
	label?: string
	/** Whether this field is required. Can be a boolean or logic expression. */
	required?: boolean | string
	/** Whether this field is visible. Can be a boolean or logic expression. Defaults to true. */
	visible?: boolean | string
	/** Long-form description or helper text displayed in the UI. */
	description?: string
	/** Whether the field is read-only/disabled. Can be a boolean or logic expression. */
	disabled?: boolean | string
	/** Custom attribute-value pairs for field metadata. */
	attrs?: Record<string, string | number | boolean>
}

/**
 * A fieldset field that contains nested fields.
 * This is a specific discriminated type where type is always 'fieldset'.
 */
export interface FieldsetField extends BaseField {
	/** Literal 'fieldset' discriminator. */
	type: 'fieldset'
	/** Nested field definitions keyed by identifier. */
	fields: Record<string, Field>
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
	// New field types:
	| DateField
	| DatetimeField
	| TimeField
	| PersonField
	| OrganizationField
	| IdentificationField
	| MultiselectField
	| PercentageField
	| RatingField
	| FieldsetField

// ============================================================================
// Specific Field Types (Discriminated Union Types)
// ============================================================================

/**
 * Text input field.
 */
export interface TextField extends BaseField {
	type: 'text'
	minLength?: number
	maxLength?: number
	pattern?: string
	default?: string
}

/**
 * Boolean checkbox/toggle field.
 */
export interface BooleanField extends BaseField {
	type: 'boolean'
	default?: boolean
}

/**
 * Number input field.
 */
export interface NumberField extends BaseField {
	type: 'number'
	min?: number
	max?: number
	default?: number
}

/**
 * Coordinate (latitude/longitude) input field.
 */
export interface CoordinateField extends BaseField {
	type: 'coordinate'
	default?: Coordinate
}

/**
 * Bounding box (geographic area) input field.
 */
export interface BboxField extends BaseField {
	type: 'bbox'
	default?: Bbox
}

/**
 * Money amount input field.
 */
export interface MoneyField extends BaseField {
	type: 'money'
	min?: number
	max?: number
	default?: Money
}

/**
 * Address input field.
 */
export interface AddressField extends BaseField {
	type: 'address'
	default?: Address
}

/**
 * Phone number input field.
 */
export interface PhoneField extends BaseField {
	type: 'phone'
	default?: Phone
}

/**
 * Duration (ISO 8601) input field.
 */
export interface DurationField extends BaseField {
	type: 'duration'
	default?: Duration
}

/**
 * Email address input field.
 */
export interface EmailField extends BaseField {
	type: 'email'
	minLength?: number
	maxLength?: number
	default?: string
}

/**
 * UUID input field.
 */
export interface UuidField extends BaseField {
	type: 'uuid'
	minLength?: number
	maxLength?: number
	pattern?: string
	default?: string
}

/**
 * URI/URL input field.
 */
export interface UriField extends BaseField {
	type: 'uri'
	minLength?: number
	maxLength?: number
	pattern?: string
	default?: string
}

/**
 * Enum/select dropdown field.
 */
export interface EnumField extends BaseField {
	type: 'enum'
	enum: (string | number)[]
	default?: string | number
}

// ============================================================================
// New Field Types: Temporal, Entity, Selection, Numeric
// ============================================================================

/**
 * Date input field (ISO 8601 format: YYYY-MM-DD).
 */
export interface DateField extends BaseField {
	type: 'date'
	min?: string
	max?: string
	default?: string
}

/**
 * Datetime input field (ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ).
 */
export interface DatetimeField extends BaseField {
	type: 'datetime'
	min?: string
	max?: string
	default?: string
}

/**
 * Time input field (HH:MM:SS format).
 */
export interface TimeField extends BaseField {
	type: 'time'
	min?: string
	max?: string
	default?: string
}

/**
 * Person information input field.
 */
export interface PersonField extends BaseField {
	type: 'person'
	default?: Person
}

/**
 * Organization information input field.
 */
export interface OrganizationField extends BaseField {
	type: 'organization'
	default?: Organization
}

/**
 * Identification document input field.
 */
export interface IdentificationField extends BaseField {
	type: 'identification'
	allowedTypes?: string[]
	default?: Identification
}

/**
 * Multi-select field allowing multiple selections from options.
 */
export interface MultiselectField extends BaseField {
	type: 'multiselect'
	options: (string | number)[]
	min?: number
	max?: number
	default?: (string | number)[]
}

/**
 * Percentage input field (0-100 by default).
 */
export interface PercentageField extends BaseField {
	type: 'percentage'
	min?: number
	max?: number
	precision?: number
	default?: number
}

/**
 * Rating input field (1-5 by default).
 */
export interface RatingField extends BaseField {
	type: 'rating'
	min?: number
	max?: number
	step?: number
	default?: number
}

// ============================================================================
// Fieldset Block Type
// ============================================================================

/**
 * Logical grouping of fields rendered together.
 * This is a standalone block type (not a field type).
 */
export interface Fieldset {
	/** Fieldset identifier (slug). */
	id: string
	/** Optional title/heading. */
	title?: string
	/** Optional description/help text. */
	description?: string
	/** Map of field identifiers to field definitions. */
	fields: Record<string, Field>
	/** Whether completion of the entire fieldset is required. */
	required?: boolean
	/** Display order hint (lower numbers first). */
	order?: number
}

/**
 * Base properties for all artifact types
 */
export interface ArtifactBase {
	/** Unique identifier; must follow slug constraints. */
	name: string
	/** Artifact version. */
	version: string
	/** Human-friendly name presented to end users. */
	title: string
	/** Optional long-form description or context. */
	description?: string
	/** Optional internal code or reference number. */
	code?: string
	/** Optional ISO date string indicating when the artifact was released/published. */
	releaseDate?: string
	/** Optional custom metadata map. */
	metadata?: Metadata
}

/**
 * Inline layer with embedded text content.
 */
export interface InlineLayer {
	kind: 'inline'
	/** MIME type of the content (e.g., text/markdown, text/html). */
	mimeType: string
	/** Layer content with interpolation placeholders. */
	text: string
	/** Optional human-readable title for this layer. */
	title?: string
	/** Optional description of what this layer represents. */
	description?: string
	/** Optional SHA-256 checksum for integrity verification. */
	checksum?: string
	/** Optional field bindings for the layer (typically for PDF). */
	bindings?: Record<string, string>
}

/**
 * File-backed layer with external file reference.
 */
export interface FileLayer {
	kind: 'file'
	/** MIME type of the file (e.g., application/pdf). */
	mimeType: string
	/** Absolute path from repo root to the layer file. */
	path: string
	/** Optional human-readable title for this layer. */
	title?: string
	/** Optional description of what this layer represents. */
	description?: string
	/** Optional SHA-256 checksum for integrity verification. */
	checksum?: string
	/** Optional field bindings for the layer (typically for PDF). */
	bindings?: Record<string, string>
}

/**
 * Layer specification — one of inline or file.
 * Layers are named renderings of content artifacts into specific formats.
 */
export type Layer = InlineLayer | FileLayer

/**
 * Annex slot for supplementary documents
 */
export interface Annex {
	/** Unique annex identifier (slug format). */
	id: string
	/** Title or heading for the annex slot. */
	title: string
	/** Description of what document should be attached. */
	description?: string
	/** Whether this annex slot must be filled at runtime. Can be a boolean or expression. */
	required?: boolean | string
	/** Whether this annex is visible. Can be a boolean or expression. Defaults to true. */
	visible?: boolean | string
}

// Re-export LogicSection from logic.ts
export type { LogicSection } from './logic.js'

// ============================================================================
// Party Role and Witness Definitions (Design-Time)
// ============================================================================

/**
 * Signature requirements for a party role.
 */
export interface SignatureRequirement {
	/** Whether signature is required for this role. */
	required: boolean
	/** Type of signature accepted. */
	type?: 'electronic' | 'wet' | 'any'
	/** Signing order (1 = first signer). */
	order?: number
}

/**
 * Design-time party role definition.
 * Defines what roles exist and what constraints apply when filling a form.
 */
export interface FormParty {
	/** Unique party role identifier (slug format). */
	id: string
	/** Human-readable role name. */
	label: string
	/** Description of this role. */
	description?: string
	/** Constraint on party type (person, organization, or any). */
	partyType?: 'person' | 'organization' | 'any'
	/** Whether multiple parties can fill this role. */
	multiple?: boolean
	/** Minimum parties required (when multiple=true). */
	min?: number
	/** Maximum parties allowed (when multiple=true). */
	max?: number
	/** Whether this role is required. Can be boolean or expression. */
	required?: boolean | string
	/** Signature requirements for this role. */
	signature?: SignatureRequirement
}

/**
 * Witness requirements for form execution.
 */
export interface WitnessRequirement {
	/** Whether witnesses are required. */
	required: boolean
	/** Minimum number of witnesses required. */
	min?: number
	/** Maximum number of witnesses allowed. */
	max?: number
	/** Whether witnesses must be notarized. */
	notarized?: boolean
}

/**
 * Form artifact definition including fields, optional layers, annexes, and party roles.
 */
export interface Form extends ArtifactBase {
	/** Literal `"form"` discriminator. */
	kind: 'form'
	/** Named logic expressions that can be referenced in field/annex conditions. */
	logic?: LogicSection
	/** Field definitions keyed by identifier. */
	fields?: Record<string, Field>
	/** Named layers for rendering this form into different formats. */
	layers?: Record<string, Layer>
	/** Key of the default layer to use when none specified. */
	defaultLayer?: string
	/** Whether additional ad-hoc annexes can be attached beyond defined slots. */
	allowAnnexes?: boolean
	/** Predefined annex slots (some required, some optional). */
	annexes?: Annex[]
	/** Party role definitions with constraints and signature requirements. */
	parties?: FormParty[]
	/** Witness requirements for form execution. */
	witnesses?: WitnessRequirement
}
