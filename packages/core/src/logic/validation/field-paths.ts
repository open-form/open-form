import type { Field, FieldsetField } from '@open-form/types'

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
  fields: Record<string, Field> | undefined,
  prefix: string = 'fields'
): Set<string> {
  const paths = new Set<string>()
  if (!fields) return paths

  for (const [key, field] of Object.entries(fields)) {
    const basePath = `${prefix}.${key}`

    // All fields have a .value property at runtime
    paths.add(`${basePath}.value`)

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
  fields: Record<string, Field> | undefined,
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
