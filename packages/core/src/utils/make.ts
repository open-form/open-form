import type { Form, Field } from '@open-form/types'

/**
 * Instance template structure containing default field values and optional annexes.
 * Annexes are an array of objects (matching the form structure).
 * Annexes are only included if the form has allowAnnexes set to true.
 * Extends Record<string, unknown> to be compatible with validation functions.
 */
export interface InstanceTemplate extends Record<string, unknown> {
  fields: Record<string, unknown>
  annexes?: unknown[]
}

/**
 * Creates an instance template from a form definition.
 *
 * The template provides default values for all fields:
 * - Uses field default values if present
 * - For strings: empty string
 * - For numbers: 0
 * - For booleans: true
 * - For enums: first item in the enum array
 * - For complex types: sensible empty structures
 * - For fieldsets: recursively processes nested fields
 *
 * @param form - The form artifact definition
 * @returns An instance template with default field values and annexes
 */
export function makeInstanceTemplate(form: Form): InstanceTemplate {
  // Process fields (mirrors compile function structure)
  const fields = getFieldsDefaultValues(form.fields || {})

  // Only include annexes if allowAnnexes is true
  const template: InstanceTemplate = { fields }

  if (form.allowAnnexes === true) {
    // Process annexes as array of objects (matching form structure)
    const annexes: unknown[] = []
    if (form.annexes) {
      for (const annex of form.annexes) {
        // Default value for each annex is an object with the annex id
        // The actual value can be replaced with file reference or other data
        annexes.push({ id: annex.id })
      }
    }
    template.annexes = annexes
  }

  return template
}

/**
 * Gets the default value for a field based on its type and configuration.
 * Mirrors the structure of compileField in compile.ts for consistency.
 */
function getFieldDefaultValue(field: Field): unknown {
  // If field has a default value, use it
  if ('default' in field && field.default !== undefined) {
    return field.default
  }

  // Otherwise, generate default based on field type
  // Case order matches compileField in compile.ts
  switch (field.type) {
    case 'text':
    case 'email':
    case 'uri':
    case 'uuid':
      return ''

    case 'boolean':
      return true

    case 'number':
      return 0

    case 'coordinate':
      return { lat: 0, lon: 0 }

    case 'bbox':
      return {
        southWest: { lat: 0, lon: 0 },
        northEast: { lat: 0, lon: 0 },
      }

    case 'money':
      return { amount: 0, currency: 'USD' }

    case 'address':
      return {
        line1: '',
        locality: '',
        region: '',
        postalCode: '',
        country: '',
      }

    case 'phone':
      return { number: '' }

    case 'duration':
      return ''

    case 'enum':
      // Use the first item in the enum array
      if ('enum' in field && Array.isArray(field.enum) && field.enum.length > 0) {
        return field.enum[0]
      }
      return ''

    case 'fieldset':
      // Recursively process nested fields (mirrors compileFields pattern)
      if ('fields' in field && field.fields) {
        return getFieldsDefaultValues(field.fields)
      }
      return {}

    default:
      // Fallback for unknown field types
      return null
  }
}

/**
 * Convert form field definitions into default values.
 * Mirrors the structure of compileFields in compile.ts for consistency.
 */
function getFieldsDefaultValues(fields: Record<string, Field>): Record<string, unknown> {
  const defaultValues: Record<string, unknown> = {}

  for (const [fieldId, fieldDef] of Object.entries(fields)) {
    defaultValues[fieldId] = getFieldDefaultValue(fieldDef)
  }

  return defaultValues
}
