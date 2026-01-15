/**
 * TypeScript-Safe Validator Wrappers
 *
 * This module provides type-safe wrappers around runtime AJV validators.
 * Validators are compiled on-demand and cached for performance.
 * We provide:
 * - Type guards: `isForm(x): x is Form`
 * - Assertions: `assertForm(x): asserts x is Form`
 * - Standard Schema results: `validateFormSchema(x): StandardSchemaV1.Result<Form>`
 */

import type { StandardSchemaV1 } from '@standard-schema/spec'
import type {
  Form,
  Document,
  Bundle,
  Checklist,
  Field,
  Annex,
  Party,
  Address,
  Bbox,
  Coordinate,
  Duration,
  Identification,
  Metadata,
  Money,
  Organization,
  Person,
  Phone,
  Fieldset,
  Layer,
} from '@open-form/types'
import {
  validateForm,
  validateDocument,
  validateBundle,
  validateChecklist,
  validateField,
  validateAnnex,
  validateFieldset,
  validateParty,
  validateFormParty,
  validateWitnessRequirement,
  validateLayer,
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
  getValidatorErrors,
} from './runtime-validators'

// Alias for internal use
const _validateForm = validateForm
const _validateDocument = validateDocument
const _validateBundle = validateBundle
const _validateChecklist = validateChecklist
const _validateField = validateField
const _validateAnnex = validateAnnex
const _validateFieldset = validateFieldset
const _validateParty = validateParty
const _validateFormParty = validateFormParty
const _validateWitnessRequirement = validateWitnessRequirement
const _validateLayer = validateLayer
const _validateAddress = validateAddress
const _validateBbox = validateBbox
const _validateCoordinate = validateCoordinate
const _validateDuration = validateDuration
const _validateIdentification = validateIdentification
const _validateMetadata = validateMetadata
const _validateMoney = validateMoney
const _validateOrganization = validateOrganization
const _validatePerson = validatePerson
const _validatePhone = validatePhone

// Re-export coerce utility
export { coerceTypes } from './coerce'

// =============================================================================
// Helper Functions
// =============================================================================

interface AjvError {
  instancePath?: string
  message?: string
  keyword?: string
  params?: Record<string, unknown>
}

/**
 * Get errors from a validator function by schema name
 */
function getErrorsForValidator(validatorName: string): AjvError[] | null {
  const errors = getValidatorErrors(validatorName)
  return errors as AjvError[] | null
}

/**
 * Map AJV errors to Standard Schema issues
 */
function mapAjvErrors(errors: AjvError[] | null | undefined): StandardSchemaV1.Issue[] {
  if (!Array.isArray(errors)) return []
  return errors.map((err) => ({
    message: err.message || 'Validation failed',
    path: err.instancePath?.split('/').filter(Boolean) || [],
  }))
}

/**
 * Format AJV errors for assertion error messages
 */
function formatErrors(errors: AjvError[] | null | undefined): string {
  if (!Array.isArray(errors) || errors.length === 0) return 'Unknown error'
  return errors.map((e) => e.message || 'Validation failed').join(', ')
}

// =============================================================================
// Artifact Type Guards
// =============================================================================

export function isForm(value: unknown): value is Form {
  return _validateForm(value)
}

export function isDocument(value: unknown): value is Document {
  return _validateDocument(value)
}

export function isBundle(value: unknown): value is Bundle {
  return _validateBundle(value)
}

export function isChecklist(value: unknown): value is Checklist {
  return _validateChecklist(value)
}

// =============================================================================
// Block Type Guards
// =============================================================================

export function isField(value: unknown): value is Field {
  return _validateField(value)
}

export function isAnnex(value: unknown): value is Annex {
  return _validateAnnex(value)
}

export function isFieldset(value: unknown): value is Fieldset {
  return _validateFieldset(value)
}

export function isParty(value: unknown): value is Party {
  return _validateParty(value)
}

export function isLayer(value: unknown): value is Layer {
  return _validateLayer(value)
}

// =============================================================================
// Primitive Type Guards
// =============================================================================

export function isAddress(value: unknown): value is Address {
  return _validateAddress(value)
}

export function isBbox(value: unknown): value is Bbox {
  return _validateBbox(value)
}

export function isCoordinate(value: unknown): value is Coordinate {
  return _validateCoordinate(value)
}

export function isDuration(value: unknown): value is Duration {
  return _validateDuration(value)
}

export function isIdentification(value: unknown): value is Identification {
  return _validateIdentification(value)
}

export function isMetadata(value: unknown): value is Metadata {
  return _validateMetadata(value)
}

export function isMoney(value: unknown): value is Money {
  return _validateMoney(value)
}

export function isOrganization(value: unknown): value is Organization {
  return _validateOrganization(value)
}

export function isPerson(value: unknown): value is Person {
  return _validatePerson(value)
}

export function isPhone(value: unknown): value is Phone {
  return _validatePhone(value)
}

// =============================================================================
// Artifact Assertion Functions
// =============================================================================

export function assertForm(value: unknown): asserts value is Form {
  if (!_validateForm(value)) {
    throw new Error(`Invalid Form: ${formatErrors(getErrorsForValidator('form'))}`)
  }
}

export function assertDocument(value: unknown): asserts value is Document {
  if (!_validateDocument(value)) {
    throw new Error(`Invalid Document: ${formatErrors(getErrorsForValidator('document'))}`)
  }
}

export function assertBundle(value: unknown): asserts value is Bundle {
  if (!_validateBundle(value)) {
    throw new Error(`Invalid Bundle: ${formatErrors(getErrorsForValidator('bundle'))}`)
  }
}

export function assertChecklist(value: unknown): asserts value is Checklist {
  if (!_validateChecklist(value)) {
    throw new Error(`Invalid Checklist: ${formatErrors(getErrorsForValidator('checklist'))}`)
  }
}

// =============================================================================
// Block Assertion Functions
// =============================================================================

export function assertField(value: unknown): asserts value is Field {
  if (!_validateField(value)) {
    throw new Error(`Invalid Field: ${formatErrors(getErrorsForValidator('field'))}`)
  }
}

export function assertAnnex(value: unknown): asserts value is Annex {
  if (!_validateAnnex(value)) {
    throw new Error(`Invalid Annex: ${formatErrors(getErrorsForValidator('annex'))}`)
  }
}

export function assertFieldset(value: unknown): asserts value is Fieldset {
  if (!_validateFieldset(value)) {
    throw new Error(`Invalid Fieldset: ${formatErrors(getErrorsForValidator('fieldset'))}`)
  }
}

export function assertParty(value: unknown): asserts value is Party {
  if (!_validateParty(value)) {
    throw new Error(`Invalid Party: ${formatErrors(getErrorsForValidator('party'))}`)
  }
}

export function assertLayer(value: unknown): asserts value is Layer {
  if (!_validateLayer(value)) {
    throw new Error(`Invalid Layer: ${formatErrors(getErrorsForValidator('layer'))}`)
  }
}

// =============================================================================
// Primitive Assertion Functions
// =============================================================================

export function assertAddress(value: unknown): asserts value is Address {
  if (!_validateAddress(value)) {
    throw new Error(`Invalid Address: ${formatErrors(getErrorsForValidator('address'))}`)
  }
}

export function assertBbox(value: unknown): asserts value is Bbox {
  if (!_validateBbox(value)) {
    throw new Error(`Invalid Bbox: ${formatErrors(getErrorsForValidator('bbox'))}`)
  }
}

export function assertCoordinate(value: unknown): asserts value is Coordinate {
  if (!_validateCoordinate(value)) {
    throw new Error(`Invalid Coordinate: ${formatErrors(getErrorsForValidator('coordinate'))}`)
  }
}

export function assertDuration(value: unknown): asserts value is Duration {
  if (!_validateDuration(value)) {
    throw new Error(`Invalid Duration: ${formatErrors(getErrorsForValidator('duration'))}`)
  }
}

export function assertIdentification(value: unknown): asserts value is Identification {
  if (!_validateIdentification(value)) {
    throw new Error(`Invalid Identification: ${formatErrors(getErrorsForValidator('identification'))}`)
  }
}

export function assertMetadata(value: unknown): asserts value is Metadata {
  if (!_validateMetadata(value)) {
    throw new Error(`Invalid Metadata: ${formatErrors(getErrorsForValidator('metadata'))}`)
  }
}

export function assertMoney(value: unknown): asserts value is Money {
  if (!_validateMoney(value)) {
    throw new Error(`Invalid Money: ${formatErrors(getErrorsForValidator('money'))}`)
  }
}

export function assertOrganization(value: unknown): asserts value is Organization {
  if (!_validateOrganization(value)) {
    throw new Error(`Invalid Organization: ${formatErrors(getErrorsForValidator('organization'))}`)
  }
}

export function assertPerson(value: unknown): asserts value is Person {
  if (!_validatePerson(value)) {
    throw new Error(`Invalid Person: ${formatErrors(getErrorsForValidator('person'))}`)
  }
}

export function assertPhone(value: unknown): asserts value is Phone {
  if (!_validatePhone(value)) {
    throw new Error(`Invalid Phone: ${formatErrors(getErrorsForValidator('phone'))}`)
  }
}

// =============================================================================
// Artifact Standard Schema Validators
// =============================================================================

export function validateFormSchema(value: unknown): StandardSchemaV1.Result<Form> {
  if (_validateForm(value)) {
    return { value: value as Form }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('form')) }
}

export function validateDocumentSchema(value: unknown): StandardSchemaV1.Result<Document> {
  if (_validateDocument(value)) {
    return { value: value as Document }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('document')) }
}

export function validateBundleSchema(value: unknown): StandardSchemaV1.Result<Bundle> {
  if (_validateBundle(value)) {
    return { value: value as Bundle }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('bundle')) }
}

export function validateChecklistSchema(value: unknown): StandardSchemaV1.Result<Checklist> {
  if (_validateChecklist(value)) {
    return { value: value as Checklist }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('checklist')) }
}

// =============================================================================
// Block Standard Schema Validators
// =============================================================================

export function validateFieldSchema(value: unknown): StandardSchemaV1.Result<Field> {
  if (_validateField(value)) {
    return { value: value as Field }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('field')) }
}

export function validateAnnexSchema(value: unknown): StandardSchemaV1.Result<Annex> {
  if (_validateAnnex(value)) {
    return { value: value as Annex }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('annex')) }
}

export function validateFieldsetSchema(value: unknown): StandardSchemaV1.Result<Fieldset> {
  if (_validateFieldset(value)) {
    return { value: value as Fieldset }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('fieldset')) }
}

export function validatePartySchema(value: unknown): StandardSchemaV1.Result<Party> {
  if (_validateParty(value)) {
    return { value: value as Party }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('party')) }
}

export function validateLayerSchema(value: unknown): StandardSchemaV1.Result<Layer> {
  if (_validateLayer(value)) {
    return { value: value as Layer }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('layer')) }
}

// =============================================================================
// Primitive Standard Schema Validators
// =============================================================================

export function validateAddressSchema(value: unknown): StandardSchemaV1.Result<Address> {
  if (_validateAddress(value)) {
    return { value: value as Address }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('address')) }
}

export function validateBboxSchema(value: unknown): StandardSchemaV1.Result<Bbox> {
  if (_validateBbox(value)) {
    return { value: value as Bbox }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('bbox')) }
}

export function validateCoordinateSchema(value: unknown): StandardSchemaV1.Result<Coordinate> {
  if (_validateCoordinate(value)) {
    return { value: value as Coordinate }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('coordinate')) }
}

export function validateDurationSchema(value: unknown): StandardSchemaV1.Result<Duration> {
  if (_validateDuration(value)) {
    return { value: value as Duration }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('duration')) }
}

export function validateIdentificationSchema(value: unknown): StandardSchemaV1.Result<Identification> {
  if (_validateIdentification(value)) {
    return { value: value as Identification }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('identification')) }
}

export function validateMetadataSchema(value: unknown): StandardSchemaV1.Result<Metadata> {
  if (_validateMetadata(value)) {
    return { value: value as Metadata }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('metadata')) }
}

export function validateMoneySchema(value: unknown): StandardSchemaV1.Result<Money> {
  if (_validateMoney(value)) {
    return { value: value as Money }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('money')) }
}

export function validateOrganizationSchema(value: unknown): StandardSchemaV1.Result<Organization> {
  if (_validateOrganization(value)) {
    return { value: value as Organization }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('organization')) }
}

export function validatePersonSchema(value: unknown): StandardSchemaV1.Result<Person> {
  if (_validatePerson(value)) {
    return { value: value as Person }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('person')) }
}

export function validatePhoneSchema(value: unknown): StandardSchemaV1.Result<Phone> {
  if (_validatePhone(value)) {
    return { value: value as Phone }
  }
  return { issues: mapAjvErrors(getErrorsForValidator('phone')) }
}

// =============================================================================
// Raw Validator Exports (for advanced use)
// =============================================================================

// Re-export validators directly
export {
  validateForm,
  validateDocument,
  validateBundle,
  validateChecklist,
  validateField,
  validateAnnex,
  validateFieldset,
  validateParty,
  validateFormParty,
  validateWitnessRequirement,
  validateLayer,
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
  validateChecklistItem,
  validateBundleContentItem,
} from './runtime-validators'
