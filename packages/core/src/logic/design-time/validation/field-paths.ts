import type { FormField, FieldsetField } from '@open-form/types'

/**
 * Maps complex field types to their nested property names.
 * These properties are accessible at runtime via dot notation (e.g., fields.rent.value.amount).
 */
const COMPLEX_TYPE_PROPERTIES: Record<string, string[]> = {
  money: ['amount', 'currency'],
  address: ['line1', 'line2', 'locality', 'region', 'postalCode', 'country'],
  phone: ['number', 'type', 'extension'],
  coordinate: ['lat', 'lon'],
  bbox: ['north', 'south', 'east', 'west'],
  duration: ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'],
  person: ['fullName', 'firstName', 'middleName', 'lastName', 'suffix', 'title'],
  organization: ['name', 'legalName', 'entityType', 'domicile'],
  identification: ['idType', 'idNumber', 'issuingAuthority', 'issuedDate', 'expiryDate'],
}

/**
 * Collects all valid field paths from a field definition record.
 * Handles nested fieldsets recursively.
 *
 * @param fields - Record of field definitions
 * @param prefix - Path prefix (default: 'fields')
 * @returns Set of valid field paths (e.g., 'fields.name.value', 'fields.address.street.value')
 *
 * @example
 * ```typescript
 * const fields = {
 *   name: { type: 'text' },
 *   address: {
 *     type: 'fieldset',
 *     fields: {
 *       street: { type: 'text' },
 *       city: { type: 'text' }
 *     }
 *   }
 * }
 *
 * collectFieldPaths(fields)
 * // Set { 'fields.name.value', 'fields.address.value', 'fields.address.street.value', 'fields.address.city.value' }
 * ```
 */
export function collectFieldPaths(
  fields: Record<string, FormField> | undefined,
  prefix: string = 'fields'
): Set<string> {
  const paths = new Set<string>()
  if (!fields) return paths

  for (const [key, field] of Object.entries(fields)) {
    const basePath = `${prefix}.${key}`
    const valuePath = `${basePath}.value`

    // All fields have a .value property at runtime
    paths.add(valuePath)

    // Add nested property paths for complex types
    const nestedProps = COMPLEX_TYPE_PROPERTIES[field.type]
    if (nestedProps) {
      for (const prop of nestedProps) {
        paths.add(`${valuePath}.${prop}`)
      }
    }

    // Recurse into fieldsets
    if (field.type === 'fieldset') {
      const fieldset = field as FieldsetField
      if (fieldset.fields) {
        const nestedPaths = collectFieldPaths(fieldset.fields, basePath)
        nestedPaths.forEach((p) => paths.add(p))
      }
    }
  }

  return paths
}

/**
 * Collects all field IDs (keys) from a field definition record.
 * Handles nested fieldsets recursively with dot notation.
 *
 * @param fields - Record of field definitions
 * @param prefix - Path prefix (default: '')
 * @returns Set of field IDs (e.g., 'name', 'address.street', 'address.city')
 */
export function collectFieldIds(
  fields: Record<string, FormField> | undefined,
  prefix: string = ''
): Set<string> {
  const ids = new Set<string>()
  if (!fields) return ids

  for (const [key, field] of Object.entries(fields)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    ids.add(fullKey)

    // Recurse into fieldsets
    if (field.type === 'fieldset') {
      const fieldset = field as FieldsetField
      if (fieldset.fields) {
        const nestedIds = collectFieldIds(fieldset.fields, fullKey)
        nestedIds.forEach((id) => ids.add(id))
      }
    }
  }

  return ids
}
