import type { Form, Field, Annex } from '@open-form/types'

// JSON Schema type for compiled output
export type JsonSchema = {
  type?: string
  properties?: Record<string, JsonSchema>
  required?: string[]
  additionalProperties?: boolean
  items?: JsonSchema
  anyOf?: JsonSchema[]
  const?: unknown
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  format?: string
  description?: string
  default?: unknown
  [key: string]: unknown
}

// ============================================================================
// TYPE MAPPERS - Convert field definitions to runtime data types
// ============================================================================

/**
 * Maps a single field definition to its runtime data type
 */
export type FieldToDataType<F> = F extends { type: 'text' }
  ? string
  : F extends { type: 'email' }
    ? string
    : F extends { type: 'uri' }
      ? string
      : F extends { type: 'uuid' }
        ? string
        : F extends { type: 'boolean' }
          ? boolean
          : F extends { type: 'number' }
            ? number
            : F extends { type: 'coordinate' }
              ? { lat: number; lon: number }
              : F extends { type: 'bbox' }
                ? {
                    southWest: { lat: number; lon: number }
                    northEast: { lat: number; lon: number }
                  }
                : F extends { type: 'money' }
                  ? { amount: number; currency: string }
                  : F extends { type: 'address' }
                    ? {
                        line1: string
                        line2?: string
                        locality: string
                        region: string
                        postalCode: string
                        country: string
                      }
                    : F extends { type: 'phone' }
                      ? { number: string; type?: string; extension?: string }
                      : F extends { type: 'duration' }
                        ? string
                        : F extends { type: 'enum'; enum: infer E }
                          ? E extends readonly (infer U)[]
                            ? U
                            : never
                          // New field types:
                          : F extends { type: 'date' }
                            ? string
                            : F extends { type: 'datetime' }
                              ? string
                              : F extends { type: 'time' }
                                ? string
                                : F extends { type: 'person' }
                                  ? {
                                      fullName: string
                                      title?: string
                                      firstName?: string
                                      middleName?: string
                                      lastName?: string
                                      suffix?: string
                                    }
                                  : F extends { type: 'organization' }
                                    ? {
                                        name: string
                                        legalName?: string
                                        domicile?: string
                                        entityType?: string
                                        entityId?: string
                                        taxId?: string
                                      }
                                    : F extends { type: 'identification' }
                                      ? {
                                          type: string
                                          number: string
                                          issuer?: string
                                          issueDate?: string
                                          expiryDate?: string
                                        }
                                      : F extends { type: 'multiselect'; options: infer E }
                                        ? E extends readonly (infer U)[]
                                          ? U[]
                                          : (string | number)[]
                                        : F extends { type: 'percentage' }
                                          ? number
                                          : F extends { type: 'rating' }
                                            ? number
                                            : F extends { type: 'fieldset'; fields: infer Fields }
                                              ? Fields extends Record<string, Field>
                                                ? FieldsToDataType<Fields>
                                                : never
                                              : unknown

/**
 * Maps a record of field definitions to their runtime data types
 * Handles required vs optional fields:
 * - Fields with `required: true` become required properties
 * - Fields without `required: true` become optional properties (key can be omitted)
 * Uses -readonly to strip readonly modifiers from as const
 */
export type FieldsToDataType<Fields extends Record<string, Field>> = {
  // Required fields - must be present
  -readonly [K in keyof Fields as Fields[K] extends { required: true }
    ? K
    : never]: FieldToDataType<Fields[K]>
} & {
  // Optional fields - can be omitted entirely
  -readonly [K in keyof Fields as Fields[K] extends { required: true }
    ? never
    : K]?: FieldToDataType<Fields[K]>
}

/**
 * Deep expand utility for nested objects - used for better IDE display
 */
type ExpandDeep<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandDeep<O[K]> }
    : never
  : T

/**
 * Helper to extract the form schema from either a raw Form or FormInstance
 */
type ExtractFormSchema<T> = T extends { schema: infer S } ? S : T

/**
 * Check if a type has annexes defined (handles Annex[], readonly Annex[], Annex[] | undefined)
 */
type HasAnnexes<T> = T extends { annexes?: infer A }
  ? NonNullable<A> extends readonly Annex[] | Annex[]
    ? true
    : false
  : false

/**
 * Infers the complete data payload type from a form definition
 * Strips readonly to allow mutation of data payloads
 * Annexes are only included if the form defines them
 *
 * Note: IDE hover may show the unexpanded type alias. Use InferFormPayload
 * for a fully expanded type that displays cleanly in IDE hovers.
 *
 * This type works with both raw Form objects and FormInstance wrappers.
 */
type InferFormDataInternal<FormSchema> = FormSchema extends { fields: infer F }
  ? F extends Record<string, Field>
    ? HasAnnexes<FormSchema> extends true
      ? { fields: FieldsToDataType<F>; annexes: Record<string, unknown> }
      : { fields: FieldsToDataType<F> }
    : { fields: Record<string, unknown> }
  : { fields: Record<string, unknown> }

export type InferFormData<Form> = InferFormDataInternal<ExtractFormSchema<Form>>

/**
 * Infers the complete data payload type from a form definition with full type expansion.
 * This version expands the type so IDE hovers show the actual structure like:
 *   { fields: { age: number; name: string | undefined } }
 * instead of:
 *   { fields: FieldsToDataType<...> }
 *
 * @example
 * ```typescript
 * const myForm = open.form({
 *   kind: 'form',
 *   name: 'example',
 *   version: '1.0.0',
 *   title: 'Example',
 *   fields: {
 *     age: { type: 'number', label: 'Age', required: true },
 *     name: { type: 'text', label: 'Name' },
 *   },
 * })
 *
 * type Payload = InferFormPayload<typeof myForm>
 * // Hovering shows: { fields: { age: number; name: string | undefined } }
 * ```
 */
export type InferFormPayload<Form> = ExpandDeep<InferFormData<Form>>

/**
 * Compile a Form into a JSON Schema for validating data payloads
 *
 * Takes a form artifact and returns a schema representing the expected data shape:
 * { fields: { fieldId: value, ... }, annexes: { annexId: value, ... } }
 *
 * @param form - The form artifact definition
 * @returns A JSON Schema for validating form data
 *
 * @example
 * ```typescript
 * import { compile } from './compile';
 *
 * const schema = compile(myForm);
 *
 * const data = {
 *   fields: { firstName: 'John', lastName: 'Doe' },
 *   annexes: {}
 * };
 * ```
 */
export function compile(form: Form): JsonSchema {
  const fieldsSchema = compileFields(form.fields || {})

  // Only include annexes if the form has them defined
  if (form.annexes && form.annexes.length > 0) {
    const annexesSchema = compileAnnexes(form.annexes)

    // Check if any annexes are required
    const hasRequiredAnnexes = form.annexes.some((annex) => annex.required)

    const properties: Record<string, JsonSchema> = {
      fields: fieldsSchema,
    }
    const required: string[] = ['fields']

    if (hasRequiredAnnexes) {
      // annexes property is required
      properties.annexes = annexesSchema
      required.push('annexes')
    } else {
      // All annexes are optional, so annexes property itself is optional
      properties.annexes = annexesSchema
    }

    return {
      type: 'object',
      properties,
      required,
      additionalProperties: false,
    }
  }

  // No annexes defined - but still accept optional empty annexes property
  // to maintain backwards compatibility with code that always passes { fields: {...}, annexes: {} }
  return {
    type: 'object',
    properties: {
      fields: fieldsSchema,
      annexes: {
        type: 'object',
        additionalProperties: false,
      },
    },
    required: ['fields'],
    additionalProperties: false,
  }
}

/**
 * Convert form field definitions into a data validation schema
 */
function compileFields(fields: Record<string, Field>): JsonSchema {
  const properties: Record<string, JsonSchema> = {}
  const required: string[] = []

  for (const [fieldId, fieldDef] of Object.entries(fields)) {
    properties[fieldId] = compileField(fieldDef)

    if (fieldDef.required) {
      required.push(fieldId)
    }
  }

  return {
    type: 'object',
    properties,
    ...(required.length > 0 && { required }),
    additionalProperties: false,
  }
}

/**
 * Convert a single field definition to its data type schema
 */
function compileField(field: Field): JsonSchema {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'uri':
    case 'uuid': {
      const stringSchema: JsonSchema = {
        type: 'string',
      }
      if ('minLength' in field && typeof field.minLength === 'number') {
        stringSchema.minLength = field.minLength
      }
      if ('maxLength' in field && typeof field.maxLength === 'number') {
        stringSchema.maxLength = field.maxLength
      }
      if ('pattern' in field && typeof field.pattern === 'string') {
        stringSchema.pattern = field.pattern
      }
      if ('default' in field && field.default !== undefined) {
        stringSchema.default = field.default
      }
      return stringSchema
    }

    case 'boolean':
      return {
        type: 'boolean',
        ...('default' in field && field.default !== undefined && { default: field.default }),
      }

    case 'number': {
      const numberSchema: JsonSchema = {
        type: 'number',
      }
      if ('min' in field && typeof field.min === 'number') {
        numberSchema.minimum = field.min
      }
      if ('max' in field && typeof field.max === 'number') {
        numberSchema.maximum = field.max
      }
      if ('default' in field && field.default !== undefined) {
        numberSchema.default = field.default
      }
      return numberSchema
    }

    case 'coordinate':
      return {
        type: 'object',
        properties: {
          lat: { type: 'number', minimum: -90, maximum: 90 },
          lon: { type: 'number', minimum: -180, maximum: 180 },
        },
        required: ['lat', 'lon'],
        additionalProperties: false,
        ...('default' in field && field.default !== undefined && { default: field.default }),
      }

    case 'bbox':
      return {
        type: 'object',
        properties: {
          southWest: {
            type: 'object',
            properties: {
              lat: { type: 'number', minimum: -90, maximum: 90 },
              lon: { type: 'number', minimum: -180, maximum: 180 },
            },
            required: ['lat', 'lon'],
            additionalProperties: false,
          },
          northEast: {
            type: 'object',
            properties: {
              lat: { type: 'number', minimum: -90, maximum: 90 },
              lon: { type: 'number', minimum: -180, maximum: 180 },
            },
            required: ['lat', 'lon'],
            additionalProperties: false,
          },
        },
        required: ['southWest', 'northEast'],
        additionalProperties: false,
        ...('default' in field && field.default !== undefined && { default: field.default }),
      }

    case 'money':
      return {
        type: 'object',
        properties: {
          amount: (() => {
            const amountSchema: JsonSchema = { type: 'number' }
            if ('min' in field && typeof field.min === 'number') {
              amountSchema.minimum = field.min
            }
            if ('max' in field && typeof field.max === 'number') {
              amountSchema.maximum = field.max
            }
            return amountSchema
          })(),
          currency: { type: 'string', minLength: 3, maxLength: 3 },
        },
        required: ['amount', 'currency'],
        additionalProperties: false,
        ...('default' in field && field.default !== undefined && { default: field.default }),
      }

    case 'address':
      return {
        type: 'object',
        properties: {
          line1: { type: 'string' },
          line2: { type: 'string' },
          locality: { type: 'string' },
          region: { type: 'string' },
          postalCode: { type: 'string' },
          country: { type: 'string' },
        },
        required: ['line1', 'locality', 'region', 'postalCode', 'country'],
        additionalProperties: false,
        ...('default' in field && field.default !== undefined && { default: field.default }),
      }

    case 'phone':
      return {
        type: 'object',
        properties: {
          number: { type: 'string', pattern: '^\\+[1-9]\\d{1,14}$' },
          type: {
            anyOf: [{ const: 'mobile' }, { const: 'work' }, { const: 'home' }],
          },
        },
        required: ['number'],
        additionalProperties: false,
        ...('default' in field && field.default !== undefined && { default: field.default }),
      }

    case 'duration':
      return {
        type: 'string',
        pattern: '^P(?:\\d+Y)?(?:\\d+M)?(?:\\d+D)?(?:T(?:\\d+H)?(?:\\d+M)?(?:\\d+(?:\\.\\d+)?S)?)?$',
        ...('default' in field && field.default !== undefined && { default: field.default }),
      }

    case 'enum':
      if ('enum' in field && Array.isArray(field.enum) && field.enum.length > 0) {
        const anyOf = field.enum.map((val: string | number) => ({ const: val }))
        return {
          anyOf,
          ...('default' in field && field.default !== undefined && { default: field.default }),
        }
      }
      return { type: 'string' }

    // New field types: Temporal
    case 'date':
      return {
        type: 'string',
        format: 'date',
        ...('default' in field && field.default !== undefined && { default: field.default }),
      }

    case 'datetime':
      return {
        type: 'string',
        format: 'date-time',
        ...('default' in field && field.default !== undefined && { default: field.default }),
      }

    case 'time':
      return {
        type: 'string',
        pattern: '^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$',
        ...('default' in field && field.default !== undefined && { default: field.default }),
      }

    // New field types: Entity
    case 'person':
      return {
        type: 'object',
        properties: {
          fullName: { type: 'string' },
          title: { type: 'string' },
          firstName: { type: 'string' },
          middleName: { type: 'string' },
          lastName: { type: 'string' },
          suffix: { type: 'string' },
        },
        required: ['fullName'],
        additionalProperties: false,
        ...('default' in field && field.default !== undefined && { default: field.default }),
      }

    case 'organization':
      return {
        type: 'object',
        properties: {
          name: { type: 'string' },
          legalName: { type: 'string' },
          domicile: { type: 'string' },
          entityType: { type: 'string' },
          entityId: { type: 'string' },
          taxId: { type: 'string' },
        },
        required: ['name'],
        additionalProperties: false,
        ...('default' in field && field.default !== undefined && { default: field.default }),
      }

    case 'identification':
      return {
        type: 'object',
        properties: {
          type: { type: 'string' },
          number: { type: 'string' },
          issuer: { type: 'string' },
          issueDate: { type: 'string', format: 'date' },
          expiryDate: { type: 'string', format: 'date' },
        },
        required: ['type', 'number'],
        additionalProperties: false,
        ...('default' in field && field.default !== undefined && { default: field.default }),
      }

    // New field types: Selection
    case 'multiselect':
      if ('options' in field && Array.isArray(field.options) && field.options.length > 0) {
        const itemSchema: JsonSchema = {
          anyOf: field.options.map((val: string | number) => ({ const: val })),
        }
        const schema: JsonSchema = {
          type: 'array',
          items: itemSchema,
          uniqueItems: true,
        }
        if ('min' in field && typeof field.min === 'number') {
          schema.minItems = field.min
        }
        if ('max' in field && typeof field.max === 'number') {
          schema.maxItems = field.max
        }
        if ('default' in field && field.default !== undefined) {
          schema.default = field.default
        }
        return schema
      }
      return { type: 'array', items: { type: 'string' } }

    // New field types: Numeric
    case 'percentage': {
      const percentageSchema: JsonSchema = {
        type: 'number',
      }
      if ('min' in field && typeof field.min === 'number') {
        percentageSchema.minimum = field.min
      }
      if ('max' in field && typeof field.max === 'number') {
        percentageSchema.maximum = field.max
      }
      if ('default' in field && field.default !== undefined) {
        percentageSchema.default = field.default
      }
      return percentageSchema
    }

    case 'rating': {
      const ratingSchema: JsonSchema = {
        type: 'number',
      }
      if ('min' in field && typeof field.min === 'number') {
        ratingSchema.minimum = field.min
      }
      if ('max' in field && typeof field.max === 'number') {
        ratingSchema.maximum = field.max
      }
      if ('default' in field && field.default !== undefined) {
        ratingSchema.default = field.default
      }
      return ratingSchema
    }

    case 'fieldset':
      if ('fields' in field && field.fields) {
        return compileFields(field.fields)
      }
      return { type: 'object', additionalProperties: false }

    default:
      // Fallback for unknown types
      return {}
  }
}

/**
 * Convert annex definitions into a data validation schema
 */
function compileAnnexes(annexes: Annex[]): JsonSchema {
  if (annexes.length === 0) {
    return { type: 'object', additionalProperties: false }
  }

  const properties: Record<string, JsonSchema> = {}
  const required: string[] = []

  for (const annex of annexes) {
    // Annexes typically contain files or references
    // For now, we'll accept any value (could be file descriptor, path, etc.)
    properties[annex.id] = {
      description: annex.description || annex.title,
    }

    if (annex.required) {
      required.push(annex.id)
    }
  }

  return {
    type: 'object',
    properties,
    ...(required.length > 0 && { required }),
    additionalProperties: false,
  }
}

/**
 * Compile and return as plain JSON Schema object
 */
export function compileToJsonSchema(form: Form): JsonSchema {
  return compile(form)
}
