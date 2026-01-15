/**
 * @open-form/types
 *
 * Core types and formatting utilities for the OpenForm framework.
 */

// Re-export renderer types
export type {
	BinaryContent,
	FormTemplate,
	RenderRequest,
	OpenFormRendererContext,
	OpenFormRenderer,
} from './renderer.js'

// Re-export legacy formatters (deprecated - use @open-form/serialization instead)
export {
	formatMoney,
	formatAddress,
	formatPhone,
	formatPerson,
	formatOrganization,
	formatParty,
} from './format.js'

// Formatter types
export type { FormatterRegistry, FormatterConfig } from './formatters.js'

// Re-export primitive types
export type {
	Money,
	Address,
	Phone,
	Person,
	Organization,
	Coordinate,
	Bbox,
	Duration,
	Identification,
} from './primitives.js'

// Re-export party types
export type { Party, PartyPerson, PartyOrganization } from './party.js'

// Re-export logic types
export type { CondExpr, LogicSection } from './logic.js'

// Re-export form and field types
export type {
	Form,
	Field,
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
	// New field types:
	DateField,
	DatetimeField,
	TimeField,
	PersonField,
	OrganizationField,
	IdentificationField,
	MultiselectField,
	PercentageField,
	RatingField,
	Fieldset,
	ArtifactBase,
	BaseField,
	Annex,
	// Layer types (new):
	Layer,
	InlineLayer,
	FileLayer,
	// Party role and witness types:
	SignatureRequirement,
	FormParty,
	WitnessRequirement,
} from './form.js'

// Re-export artifact types
export type {
	Document,
	Checklist,
	ChecklistItem,
	StatusSpec,
	EnumStatusOption,
	Bundle,
	BundleContentItem,
	Bindings,
	Artifact,
	OpenFormPayload,
} from './artifacts.js'

// Re-export metadata type
export type { Metadata } from './metadata.js'

// Re-export resolver interface
export type { Resolver } from './resolver.js'
