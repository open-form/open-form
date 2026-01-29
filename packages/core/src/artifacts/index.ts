/**
 * Artifacts-2: Closure-based artifact implementations
 *
 * This module provides closure-based implementations of Open Form artifacts,
 * replacing the class-based implementations with factory functions and composition.
 *
 * Key benefits:
 * - Reduced code duplication through shared render-layer and artifact-methods utilities
 * - Unified runtime objects (RuntimeDocument, RuntimeChecklist) instead of separate draft/final classes
 * - No class inheritance, just composition via withArtifactMethods()
 * - Smaller bundle size due to eliminated class overhead
 * - Complete independence from artifacts/ - no imports from class-based implementations
 */

// Shared utilities
export { withArtifactMethods, renderLayer, resolveLayerKey, resolveAndRenderLayer } from './shared'
export type { ArtifactMethods, LayerRenderOptions } from './shared'

// Closure-based builders (independent from artifacts/)
export {
	// Field builders
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
	// Party builder
	party,
	partyBuilder,
	// Fieldset builder
	fieldset,
	fieldsetBuilder,
	// Layer builders
	layer,
	fileLayer,
	inlineLayer,
	layerBuilder,
	// Annex builder
	annex,
	annexBuilder,
} from './builders'

// Import builders for open namespace construction
import {
	field,
	party,
	fieldset,
	layer,
	annex,
} from './builders'

export type {
	// Field builder types
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
	// Party builder types
	PartyAPI,
	PartyBuilder,
	// Fieldset builder types
	FieldsetAPI,
	FieldsetBuilder,
	// Layer builder types
	LayerAPI,
	FileLayerBuilderType,
	InlineLayerBuilderType,
	LayerBuilderType,
	// Annex builder types
	AnnexAPI,
	AnnexBuilder,
} from './builders'

// Document artifact
export { document, runtimeDocumentFromJSON } from './document'
export type { DocumentInstance, RuntimeDocument, DraftDocument, FinalDocument, DocumentInput, RuntimeDocumentJSON, DocumentBuilderInterface } from './document'

// Checklist artifact
export { checklist, runtimeChecklistFromJSON } from './checklist'
export type {
	ChecklistInstance,
	RuntimeChecklist,
	DraftChecklist,
	CompletedChecklist,
	ChecklistInput,
	RuntimeChecklistJSON,
	InferChecklistPayload,
	ItemStatusToDataType,
	ItemsToDataType,
	ChecklistBuilderInterface,
} from './checklist'

// Form artifact
export { form, runtimeFormFromJSON, FormValidationError } from './form'
export type {
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
	FormBuilderInterface,
} from './form'

// Bundle artifact
export { bundle, runtimeBundleFromJSON } from './bundle'
export type {
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
	BundleBuilderInterface,
} from './bundle'

// Import artifacts for open namespace
import { form } from './form'
import { document } from './document'
import { checklist } from './checklist'
import { bundle } from './bundle'

// Import load from serialization for open namespace
import { load, safeLoad } from '../serialization'

/**
 * The `open` namespace provides a unified API for building Open Form artifacts.
 *
 * This is the recommended entry point for creating form definitions.
 *
 * @example
 * ```ts
 * import { open } from '@open-form/core';
 *
 * const leaseForm = open.form()
 *   .name('lease-agreement')
 *   .parties({
 *     landlord: open.party().label('Landlord').signature({ required: true }),
 *     tenant: open.party().label('Tenant').signature({ required: true }),
 *   })
 *   .fields({
 *     address: open.field.address().label('Property Address').required(),
 *     monthlyRent: open.field.money().label('Monthly Rent').required(),
 *   })
 *   .build();
 * ```
 */
export const open = {
	// Artifacts
	form,
	document,
	checklist,
	bundle,

	// Load artifacts from JSON/YAML strings
	load,
	safeLoad,

	// Party role builder
	party,

	// Field builders for all supported field types
	field: {
		...field,
		text: field.text,
		boolean: field.boolean,
		number: field.number,
		coordinate: field.coordinate,
		bbox: field.bbox,
		money: field.money,
		address: field.address,
		phone: field.phone,
		duration: field.duration,
		email: field.email,
		uuid: field.uuid,
		uri: field.uri,
		enum: field.enum,
		date: field.date,
		datetime: field.datetime,
		time: field.time,
		person: field.person,
		organization: field.organization,
		identification: field.identification,
		multiselect: field.multiselect,
		percentage: field.percentage,
		rating: field.rating,
		fieldset: field.fieldset,
	},

	// Fieldset builder for grouping fields
	fieldset,

	// Annex/attachment slot builder
	annex,

	// Layer builders for content layers
	layer,
} as const

export type Open = typeof open
