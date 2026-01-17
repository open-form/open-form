/**
 * Pure function to render DOCX templates using docx-templates
 */

import { createReport } from 'docx-templates'
import { usaSerializers, preprocessFieldData } from '@open-form/serialization'

import type { SerializerRegistry, Form, Bindings } from '@open-form/types'
import { createSerializedFieldWrapper } from './utils/field-serializer.js'
import { applyBindings } from './utils/bindings.js'

export interface DocxRenderOptions {
  /**
   * Custom command delimiter (default: ['{{', '}}'])
   */
  cmdDelimiter?: [string, string]

  /**
   * Fail on errors
   */
  failFast?: boolean

  /**
   * Additional processing options
   */
  processLineBreaks?: boolean
}

/**
 * Render DOCX template with data
 *
 * Automatically applies serializers to fields based on schema types when form is provided,
 * enabling ergonomic templates like {{fee}} instead of manually providing formatted versions.
 *
 * @param template - DOCX template as Uint8Array/Buffer
 * @param data - Data object to populate template
 * @param options - DOCX-specific rendering options
 * @param form - Optional form schema for automatic field type detection and serialization
 * @param serializers - Optional custom serializer registry. Uses USA serializers by default.
 * @param bindings - Optional mapping from template field names to form field names
 * @returns Rendered output as Uint8Array
 *
 * @example
 * ```ts
 * const template = fs.readFileSync('template.docx')
 * const data = { firstName: 'John', salePrice: { amount: 250000, currency: 'USD' } }
 * const output = await renderDocx(template, data, {}, form, serializers)
 * ```
 */
export async function renderDocx(
  template: Uint8Array,
  data: Record<string, unknown>,
  options: DocxRenderOptions = {},
  form?: Form,
  serializers: SerializerRegistry = usaSerializers,
  bindings?: Bindings
): Promise<Uint8Array> {
  // Preprocess data to wrap serializable fields if form schema is provided
  let dataToRender = data
  if (form) {
    const wrapperStrategy = (value: unknown, fieldType: string) =>
      createSerializedFieldWrapper(value, fieldType, serializers)
    dataToRender = preprocessFieldData(data, form, wrapperStrategy)
  }

  // Apply bindings to remap data keys if provided
  // This happens AFTER preprocessing so bound fields inherit serialization
  if (bindings) {
    dataToRender = applyBindings(dataToRender, bindings)
  }

  // Create report using docx-templates
  const output = await createReport({
    template: Buffer.from(template),
    data: dataToRender,
    cmdDelimiter: options.cmdDelimiter || ['{{', '}}'],
    failFast: options.failFast ?? false,
    processLineBreaks: options.processLineBreaks ?? true,
  })

  return new Uint8Array(output)
}
