import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import type { Form } from '@open-form/types'
import { compile, type InferFormPayload } from '@/inference'
import { deepClone } from '@/utils/clone'

// Re-export types from centralized types.ts
export type { ValidationError, ValidationSuccess, ValidationFailure, ValidationResult, InstanceTemplate } from '@/types'

// Import types for internal use
import type { ValidationError, ValidationResult, InstanceTemplate } from '@/types'

// Initialize AJV with JSON Schema 2020-12 support and formats
const ajv = new Ajv({
  strict: false,
  allErrors: true,
  verbose: true,
  useDefaults: true,
})

// Add format validators (date, email, uri, uuid, etc.)
addFormats(ajv)

/**
 * Validate user-submitted data against a form definition
 *
 * @param form - The form definition (artifact schema)
 * @param data - The data payload to validate
 * @returns Validation result with success status, data (with defaults applied), and errors
 */
export function validateFormData<F extends Form>(
  form: F,
  data: Record<string, unknown>
): ValidationResult<InferFormPayload<F>> {
  // Compile the form to a JSON Schema
  const schema = compile(form)

  // Compile the schema with AJV
  const validateFn = ajv.compile(schema)

  // Deep clone data to avoid mutating the original (AJV will apply defaults to this copy)
  // Handle null/undefined gracefully by defaulting to empty object
  const dataCopy = data != null ? deepClone(data) : {}

  // Validate the data (AJV will apply defaults from schema)
  const isValid = validateFn(dataCopy)

  if (isValid) {
    return {
      success: true,
      data: dataCopy as InferFormPayload<F>,
      errors: null,
    }
  }

  // Map AJV errors to our error format
  const errors: ValidationError[] = (validateFn.errors || []).map((err) => {
    let field = err.instancePath || '/'

    // Remove leading slash and convert JSON pointer to dot notation
    field = field.replace(/^\//, '').replace(/\//g, '.')

    // Handle root level errors
    if (!field) {
      field = (err.params?.missingProperty as string) || 'root'
    }

    let message = err.message || 'Validation failed'

    // Enhance error messages based on keyword
    switch (err.keyword) {
      case 'required':
        message = `Missing required field: ${err.params?.missingProperty}`
        field = err.params?.missingProperty as string
        break
      case 'type':
        message = `Expected type ${err.params?.type}`
        break
      case 'minLength':
        message = `Must be at least ${err.params?.limit} characters`
        break
      case 'maxLength':
        message = `Must be at most ${err.params?.limit} characters`
        break
      case 'minimum':
        message = `Must be at least ${err.params?.limit}`
        break
      case 'maximum':
        message = `Must be at most ${err.params?.limit}`
        break
      case 'pattern': {
        const pattern = err.params?.pattern as string | undefined
        if (pattern) {
          // Provide human-readable hints for common patterns
          if (pattern.includes('P(?:\\d+Y)?(?:\\d+M)?')) {
            message = `Must be a valid ISO 8601 duration (e.g., "P1Y", "P6M", "P30D", "PT2H30M")`
          } else if (pattern.includes('^\\+[1-9]')) {
            message = `Must be a valid E.164 phone number (e.g., "+14155551234")`
          } else if (pattern.includes('([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d')) {
            message = `Must be a valid time in HH:MM:SS format (e.g., "14:30:00")`
          } else {
            message = `Does not match required pattern: ${pattern}`
          }
        } else {
          message = `Does not match required pattern`
        }
        break
      }
      case 'format':
        message = `Invalid ${err.params?.format} format`
        break
      case 'enum':
        message = `Must be one of: ${(err.params?.allowedValues as string[])?.join(', ')}`
        break
      case 'additionalProperties':
        message = `Unknown field: ${err.params?.additionalProperty}`
        field = err.params?.additionalProperty as string
        break
    }

    return {
      field,
      message,
      value: err.data,
    }
  })

  return {
    success: false,
    data: null,
    errors,
  }
}

/**
 * Validate an instance template against a form definition
 *
 * This function validates both fields and annexes according to the form's schema.
 * It uses the same validation logic as validateFormData but with proper InstanceTemplate typing.
 *
 * @param form - The form definition (artifact schema)
 * @param instance - The instance template to validate
 * @returns Validation result with success status, data (with defaults applied), and errors
 */
export function validateInstance<F extends Form>(
  form: F,
  instance: InstanceTemplate
): ValidationResult<InferFormPayload<F>> {
  // InstanceTemplate extends Record<string, unknown> so it's compatible
  // with validateFormData which expects { fields: {...}, annexes: {...} }
  return validateFormData(form, instance)
}
