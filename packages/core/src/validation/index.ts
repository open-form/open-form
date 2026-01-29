/**
 * Validation module - type guards, validators, coercion
 */

// AJV validators
export {
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
  getValidatorErrors,
} from './validators'

// Type guards
export {
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
} from './type-guards'

// Coercion
export { coerceTypes } from './coerce'

// Party validation
export {
  validatePartyForRole,
  isPartyTypeAllowed,
  isPerson as isPersonParty,
  isOrganization as isOrganizationParty,
  inferPartyType,
  expectsArrayFormat,
  validatePartyId,
  validatePartiesForRole,
} from './party'
export type { PartyValidationResult, ExtendedValidationResult } from './party'

// Artifact validation
export { validateSchema, validate as validateArtifact, parseArtifact } from './artifact'

// Data validation
export { validateFormData, validateInstance } from './data'

// Types
export type {
  ValidationError,
  ValidationSuccess,
  ValidationFailure,
  ValidationResult,
  ValidateOptions,
} from '@/types'

// AJV instance
export { ajv } from './ajv-instance'

// Primitive parsers (ready-to-use parse functions)
export {
  parseAddress,
  parseBbox,
  parseCoordinate,
  parseDuration,
  parseIdentification,
  parseMetadata,
  parseMoney,
  parseOrganization,
  parsePerson,
  parsePhone,
} from './parsers'

// Artifact parsers (ready-to-use parse functions for artifacts and blocks)
export {
  parseForm,
  parseBundle,
  parseDocument,
  parseChecklist,
  parseFormField,
  parseFormAnnex,
  parseFormFieldset,
  parseFormParty,
  parseLayer,
  parseBundleContentItem,
  parseChecklistItem,
} from './artifact-parsers'
