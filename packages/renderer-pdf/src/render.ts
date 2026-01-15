/**
 * Pure function to render PDF templates using pdf-lib
 */

import { PDFDocument } from 'pdf-lib'
import type { Form, Field, BinaryContent, FormatterRegistry } from '@open-form/types'
import { usaFormatters } from '@open-form/serialization'

/**
 * Get a value from a nested object using dot notation path.
 * e.g., getNestedValue({ a: { b: 1 } }, 'a.b') => 1
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.')
  let value: unknown = obj
  for (const part of parts) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return value
}

/**
 * Render PDF template with form data.
 *
 * @param template - PDF template as BinaryContent (Uint8Array)
 * @param form - Form definition containing field schemas
 * @param data - Data object to populate form fields
 * @param bindings - Optional mapping from form field names to PDF AcroForm field names
 * @param formatters - Optional custom formatter registry. Uses USA formatters by default.
 * @returns Rendered PDF as BinaryContent
 *
 * @example
 * ```ts
 * const template = fs.readFileSync('template.pdf')
 * const form = { fields: { firstName: { type: 'text' } } }
 * const data = { firstName: 'John' }
 * const output = await renderPdf(template, form, data)
 * ```
 */
export async function renderPdf(
  template: BinaryContent,
  form: Form,
  data: Record<string, unknown>,
  bindings?: Record<string, string>,
  formatters: FormatterRegistry = usaFormatters
): Promise<BinaryContent> {
  // Load PDF document (ignoreEncryption allows filling encrypted forms)
  const pdfDoc = await PDFDocument.load(template, { ignoreEncryption: true })

  // Get the AcroForm
  const acroForm = pdfDoc.getForm()

  // Bindings format: { pdfFieldName: formFieldBinding }
  // Where formFieldBinding can be:
  //   - "fieldName" - simple mapping
  //   - "fieldName:value" - for enum checkboxes (check if field equals value)
  //   - "fieldName:1", "fieldName:2" - for split fields (SSN, EIN)
  //   - "field1,field2,field3" - for combined fields (city,state,zip)

  if (bindings) {
    // Iterate over PDF fields defined in bindings
    for (const [pdfFieldName, formFieldBinding] of Object.entries(bindings)) {
      try {
        // Parse the binding
        if (formFieldBinding.includes(',')) {
          // Combined fields: "city,state,zipCode" -> "San Francisco, CA 94105"
          const fieldNames = formFieldBinding.split(',')
          const values = fieldNames.map((name) => getNestedValue(data, name.trim())).filter(Boolean)
          const combined = values.join(', ')
          if (combined) {
            const textField = acroForm.getTextField(pdfFieldName)
            textField.setText(combined)
          }
        } else if (formFieldBinding.includes(':')) {
          // Special binding: "fieldName:qualifier"
          const colonIndex = formFieldBinding.indexOf(':')
          const fieldName = formFieldBinding.slice(0, colonIndex)
          const qualifier = formFieldBinding.slice(colonIndex + 1)
          const value = getNestedValue(data, fieldName)
          // For nested paths, get the root field name for field definition lookup
          const rootFieldName = fieldName.split('.')[0] ?? fieldName
          const fieldDef = rootFieldName ? form.fields?.[rootFieldName] : undefined

          if (fieldDef?.type === 'enum' || fieldDef?.type === 'boolean') {
            // Enum checkbox: check if value matches qualifier
            // e.g., "taxClassification:llc" -> check if taxClassification === 'llc'
            const checkbox = acroForm.getCheckBox(pdfFieldName)
            if (fieldDef.type === 'boolean') {
              // For boolean with qualifier, check if value is truthy
              if (value) checkbox.check()
              else checkbox.uncheck()
            } else {
              // For enum, check if value matches the qualifier
              if (String(value) === qualifier) {
                checkbox.check()
              }
            }
          } else {
            // Split field: "socialSecurityNumber:1" -> extract part 1
            // Assumes value is formatted like "123-45-6789" for SSN or "12-3456789" for EIN
            const partIndex = parseInt(qualifier, 10) - 1
            if (!Number.isNaN(partIndex) && value != null) {
              const valueParts = String(value).split('-')
              if (valueParts[partIndex]) {
                const textField = acroForm.getTextField(pdfFieldName)
                textField.setText(valueParts[partIndex])
              }
            }
          }
        } else {
          // Simple binding: "fieldName" or "nested.path"
          const fieldName = formFieldBinding
          const value = getNestedValue(data, fieldName)

          if (value == null) continue

          // Check if this is a nested path (accessing sub-properties of complex types)
          const isNestedPath = fieldName.includes('.')
          // For nested paths, get the root field name for field definition lookup
          const rootFieldName = fieldName.split('.')[0] ?? fieldName
          const fieldDef = rootFieldName ? form.fields?.[rootFieldName] : undefined

          // Boolean values: always use checkbox (works for nested or non-nested)
          if (typeof value === 'boolean' || fieldDef?.type === 'boolean') {
            const checkbox = acroForm.getCheckBox(pdfFieldName)
            if (value) checkbox.check()
            else checkbox.uncheck()
          } else if (!isNestedPath && fieldDef?.type === 'money') {
            // Money: only format if accessing the full money object (not a sub-property)
            const textField = acroForm.getTextField(pdfFieldName)
            textField.setText(formatters.formatMoney(value))
          } else if (!isNestedPath && fieldDef?.type === 'address') {
            // Address: only format if accessing the full address object
            const textField = acroForm.getTextField(pdfFieldName)
            textField.setText(formatters.formatAddress(value))
          } else if (!isNestedPath && fieldDef?.type === 'phone') {
            // Phone: only format if accessing the full phone object
            const textField = acroForm.getTextField(pdfFieldName)
            textField.setText(formatters.formatPhone(value))
          } else {
            // Default: text field (includes nested sub-properties like address.locality)
            const textField = acroForm.getTextField(pdfFieldName)
            textField.setText(String(value))
          }
        }
      } catch {
        // Field not present or wrong type in PDF – just skip
      }
    }
  } else {
    // No bindings: use form field names directly as PDF field names
    if (form.fields) {
      const fieldEntries = Object.entries(form.fields) as [string, Field][]
      for (const [fieldName, fieldDef] of fieldEntries) {
        const value = data[fieldName]
        if (value == null) continue
        if (fieldDef.type === 'fieldset') continue

        try {
          if (fieldDef.type === 'boolean') {
            const checkbox = acroForm.getCheckBox(fieldName)
            if (value) checkbox.check()
            else checkbox.uncheck()
          } else {
            const textField = acroForm.getTextField(fieldName)
            textField.setText(String(value))
          }
        } catch {
          // Skip if field not found
        }
      }
    }
  }

  const bytes = await pdfDoc.save()
  return new Uint8Array(bytes)
}
