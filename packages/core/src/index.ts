// Initialize format validators
import './utils/formats'

// Serialization
export * from './serialization/index'

export * from './schemas/primitives/index'
export * from './schemas/blocks/index'
export * from './runtime/index'

// Export builders
export * from './builders'

// Export FilledForm class
export { FilledForm } from './filled-form'

// Export load functions
export { load, safeLoad, loadFromObject, safeLoadFromObject, LoadError, type AnyArtifactInstance } from './load'

// Export all public types from centralized types.ts
export type {
  // Validation types
  ValidationError,
  ValidationSuccess,
  ValidationFailure,
  ValidationResult,
  ValidateOptions,
  // Serialization types
  SerializationFormat,
  SerializationOptions,
  // Instance interface
  IArtifactInstance,
  // Render options
  RenderOptions,
  FilledFormRenderOptions,
  FillOptions,
  // Input types
  FormInput,
  DocumentInput,
  BundleInput,
  ChecklistInput,
} from './types'

// Export instance classes
export { FormInstance, FormValidationError } from './builders/artifacts/form'
export { DocumentInstance } from './builders/artifacts/document'
export { BundleInstance } from './builders/artifacts/bundle'
export { ChecklistInstance } from './builders/artifacts/checklist'

// Import functions for open namespace
import { validate, toStandardSchema, parse } from './utils'
import { load, safeLoad } from './load'

// ============================================================================
// ARTIFACTS
// ============================================================================

export {
  type ArtifactBase,
  type Form,
  type Document,
  type Checklist,
  type ChecklistItem,
  type StatusSpec,
  type EnumStatusOption,
  type Bundle,
  type BundleContentItem,
  type Layer,
  type InlineLayer,
  type FileLayer,
  type Artifact,
} from './schemas/artifacts'

// ============================================================================
// LOGIC
// ============================================================================

export {
  type CondExpr,
  type LogicSection,
} from './logic'

// Logic type inference
export type {
  InferredPrimitiveType,
  InferredCompositeType,
  InferredType,
  TypeConfidence,
  TypeInferenceResult,
  TypeValidationSeverity,
  TypeValidationResult,
} from './logic'

// Artifact type guards
export {
  isForm,
  isDocument,
  isBundle,
  isChecklist,
  getArtifactKind,
  hasValidKind,
  type ArtifactKind,
} from './schemas/artifacts'

// ---------------------------
// Open API - Unified namespace
// ---------------------------

// Import all builders for the open namespace (re-import for convenience)
import { form, document, checklist, bundle } from './builders/artifacts'
import { field, fieldset, annex, party, formParty, partyData, witnessRequirement } from './builders/blocks'
import {
  coordinate,
  address,
  phone,
  money,
  duration,
  layer,
  person,
  organization,
  identification,
  bbox,
  metadata,
  date,
  datetime,
  time,
  percentage,
  rating,
} from './builders/primitives'

// Import only the useful utils for the open.utils namespace
import { makeInstanceTemplate, applyDefaults, withDefaults } from './utils'

// Re-export serializer types from types
export type { SerializerRegistry, SerializerConfig } from '@open-form/types'

// Type for the open namespace
type OpenAPI = {
  // Artifacts (all return instances)
  form: typeof form
  document: typeof document
  checklist: typeof checklist
  bundle: typeof bundle

  // Blocks - Definition-time (form schema building)
  field: typeof field
  fieldset: typeof fieldset
  annex: typeof annex
  party: typeof party           // Definition-time: party role definition
  formParty: typeof formParty   // Alias for party (backwards compatibility)
  witnessRequirement: typeof witnessRequirement

  // Blocks - Runtime (filling forms)
  partyData: typeof partyData   // Runtime: actual party data (person/organization)

  // Primitives (return plain data)
  coordinate: typeof coordinate
  address: typeof address
  phone: typeof phone
  money: typeof money
  duration: typeof duration
  layer: typeof layer
  person: typeof person
  organization: typeof organization
  identification: typeof identification
  bbox: typeof bbox
  metadata: typeof metadata
  date: typeof date
  datetime: typeof datetime
  time: typeof time
  percentage: typeof percentage
  rating: typeof rating

  // Loading (for unknown artifact types)
  load: typeof load
  safeLoad: typeof safeLoad

  // Parsing (auto-detect JSON/YAML)
  parse: typeof parse

  // Validation (convenience, also available on instances)
  validate: typeof validate
  toStandardSchema: typeof toStandardSchema

  // Utilities (power users)
  utils: {
    makeInstanceTemplate: typeof makeInstanceTemplate
    applyDefaults: typeof applyDefaults
    withDefaults: typeof withDefaults
  }
}

export const open: OpenAPI = {
  // Artifacts (all return instances)
  form,
  document,
  checklist,
  bundle,

  // Blocks - Definition-time (form schema building)
  field,
  fieldset,
  annex,
  party,
  formParty,
  witnessRequirement,

  // Blocks - Runtime (filling forms)
  partyData,

  // Primitives (return plain data)
  coordinate,
  address,
  phone,
  money,
  duration,
  layer,
  person,
  organization,
  identification,
  bbox,
  metadata,
  date,
  datetime,
  time,
  percentage,
  rating,

  // Loading
  load,
  safeLoad,

  // Parsing (auto-detect JSON/YAML)
  parse,

  // Validation
  validate,
  toStandardSchema,

  // Utilities (power users)
  utils: {
    makeInstanceTemplate,
    applyDefaults,
    withDefaults,
  },
}

export * from './utils'
