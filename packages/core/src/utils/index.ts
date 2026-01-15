// Import and re-export from compile
export {
  compile,
  compileToJsonSchema,
  type JsonSchema,
  type FieldToDataType,
  type FieldsToDataType,
  type InferFormData,
  type InferFormPayload,
} from './compile'

// Import and re-export apply-defaults utilities
export { applyDefaults, withDefaults } from './apply-defaults'

// Import and re-export clone utility
export { deepClone } from './clone'

export { makeInstanceTemplate, type InstanceTemplate } from './make'

// Import formats for side effects (registers format validators)
import './formats'

// populate.ts is empty, nothing to export

// Import and re-export from validate-artifact
export {
  validate,
  validate as validateArtifact,
  validateSchema,
  parseArtifact,
  type ValidateOptions,
} from './validate-artifact'

// Import and re-export Standard Schema adapter
export { toStandardSchema } from './standard-schema-adapter'

// Re-export Standard Schema types for convenience
export type { StandardSchemaV1 } from '@standard-schema/spec'

// Import and re-export from validate
export {
  validateFormData,
  validateInstance,
  type ValidationError,
  type ValidationSuccess,
  type ValidationFailure,
  type ValidationResult,
} from './validate'

// Serialization helpers
export {
  parse,
  parseAs,
  detectFormat,
  serialize,
  convert,
  jsonToYaml,
  yamlToJson,
  toJSON,
  fromJSON,
  isJSON,
  toYAML,
  fromYAML,
  isYAML,
} from '../serialization'
