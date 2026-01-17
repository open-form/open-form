/**
 * @open-form/renderer-pdf
 *
 * PDF renderer plugin for OpenForm, using pdf-lib.
 */

import type { OpenFormRenderer, RendererLayer, OpenFormRendererContext, RenderRequest } from '@open-form/types'
import { renderPdf } from './render'

type PdfTemplate = RendererLayer & {
  type: 'pdf'
  content: Uint8Array
}

type PdfOutput = Uint8Array

// Data = unknown here so the caller can choose; we just cast to Record inside.
export const pdfRenderer: OpenFormRenderer<PdfTemplate, PdfOutput, unknown> = {
  id: 'pdf',

  async render(request: RenderRequest<PdfTemplate, unknown>, ctx?: OpenFormRendererContext) {
    const dataRecord = request.data as Record<string, unknown>

    return await renderPdf(
      request.template.content,
      request.form,
      dataRecord,
      request.template.bindings, // <- comes from FormTemplate.bindings
      ctx?.serializers // <- pass custom serializers from context if available
    )
  },
}

export { renderPdf }
export { inspectPdfFields } from './inspect'
export type { PdfFieldInfo } from './inspect'
