/**
 * @open-form/renderer-pdf
 *
 * PDF renderer plugin for OpenForm, using pdf-lib.
 */

import type { OpenFormRenderer, FormTemplate, BinaryContent, OpenFormRendererContext } from '@open-form/types'
import { renderPdf } from './render'

type PdfTemplate = FormTemplate & {
  type: 'pdf'
  content: BinaryContent // Uint8Array under the hood
}

type PdfOutput = BinaryContent

// Data = unknown here so the caller can choose; we just cast to Record inside.
export const pdfRenderer: OpenFormRenderer<PdfTemplate, PdfOutput, unknown> = {
  id: 'pdf',
  supports: ['pdf'],
  outputExtension: 'pdf',
  outputMime: 'application/pdf',

  async render(template, form, data, _pdfBindings, ctx?: OpenFormRendererContext) {
    const dataRecord = data as Record<string, unknown>

    return await renderPdf(
      template.content,
      form,
      dataRecord,
      template.bindings, // <- comes from FileContent.bindings via FormTemplate
      ctx?.formatters // <- pass custom formatters from context if available
    )
  },
}

export { renderPdf }
export { inspectPdfFields } from './inspect'
export type { PdfFieldInfo } from './inspect'
