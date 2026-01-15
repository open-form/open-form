/**
 * Pure function to render DOCX templates using docx-templates
 */

import { createReport } from 'docx-templates'
import { usaFormatters } from '@open-form/serialization'

import type { Money, Address, Phone, Person, Organization, FormatterRegistry } from '@open-form/types'

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
 * Preprocess data to add formatted versions of complex field types
 * This allows DOCX templates to use both raw values and formatted strings
 */
function preprocessDataForDocx(data: Record<string, unknown>, formatters: FormatterRegistry = usaFormatters): Record<string, unknown> {
  const processed = { ...data }

  // Add formatted versions for common field types
  Object.entries(data).forEach(([key, value]) => {
    if (value && typeof value === 'object') {
      // Money fields
      if ('amount' in value && 'currency' in value) {
        processed[`${key}_formatted`] = formatters.formatMoney(value as Money | number | Partial<Money>)
      }

      // Address fields
      if ('line1' in value || 'city' in value || 'region' in value) {
        processed[`${key}_formatted`] = formatters.formatAddress(value as Address | Partial<Address>)
      }

      // Phone fields
      if ('number' in value || 'countryCode' in value) {
        processed[`${key}_formatted`] = formatters.formatPhone(
          value as
            | Phone
            | string
            | Partial<Phone>
            | { number?: string; countryCode?: string; extension?: string }
        )
      }

      // Person fields
      if ('firstName' in value || 'lastName' in value) {
        processed[`${key}_formatted`] = formatters.formatPerson(
          value as
            | Person
            | Partial<Person>
            | {
                fullName?: string
                title?: string
                firstName?: string
                middleName?: string
                lastName?: string
                suffix?: string
              }
        )
      }

      // Organization fields
      if ('name' in value && ('ein' in value || 'type' in value)) {
        processed[`${key}_formatted`] = formatters.formatOrganization(
          value as
            | Organization
            | Partial<Organization>
            | { name?: string; ein?: string; email?: string; phone?: string }
        )
      }
    }
  })

  return processed
}

/**
 * Render DOCX template with data
 *
 * @param template - DOCX template as Uint8Array/Buffer
 * @param data - Data object to populate template
 * @param options - DOCX-specific rendering options
 * @param formatters - Optional custom formatter registry. Uses USA formatters by default.
 * @returns Rendered output as Uint8Array
 *
 * @example
 * ```ts
 * const template = fs.readFileSync('template.docx')
 * const data = { firstName: 'John', salePrice: 250000 }
 * const output = await renderDocx(template, data)
 * ```
 */
export async function renderDocx(
  template: Uint8Array,
  data: Record<string, unknown>,
  options: DocxRenderOptions = {},
  formatters: FormatterRegistry = usaFormatters
): Promise<Uint8Array> {
  // Prepare data with formatted helpers for DOCX templates
  const processedData = preprocessDataForDocx(data, formatters)

  // Create report using docx-templates
  const output = await createReport({
    template: Buffer.from(template),
    data: processedData,
    cmdDelimiter: options.cmdDelimiter || ['{{', '}}'],
    failFast: options.failFast ?? false,
    processLineBreaks: options.processLineBreaks ?? true,
  })

  return new Uint8Array(output)
}
