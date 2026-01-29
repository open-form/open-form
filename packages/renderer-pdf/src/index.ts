/**
 * @open-form/renderer-pdf
 *
 * PDF renderer plugin for OpenForm, using pdf-lib.
 */

import type { OpenFormRenderer, RendererLayer, RenderRequest, SerializerRegistry } from '@open-form/types'
import { usaSerializers } from '@open-form/serialization'
import { renderPdf } from './render'
import type { PdfSignatureOptions } from './utils/signature-helpers'

// Re-export signature helper types
export type { PdfSignatureOptions } from './utils/signature-helpers'
export { resolvePdfSignatureOptions } from './utils/signature-helpers'

type PdfTemplate = RendererLayer & {
  type: 'pdf'
  content: Uint8Array
}

type PdfOutput = Uint8Array

/**
 * Configuration options for the PDF renderer.
 */
export interface PdfRendererOptions {
  /**
   * Custom serializer registry for formatting field values.
   * Defaults to USA serializers.
   */
  serializers?: SerializerRegistry
  /**
   * Options for signature and initials rendering.
   * Note: Full signature helper implementation for PDF is deferred.
   */
  signatureOptions?: PdfSignatureOptions
}

/**
 * Create a configured PDF renderer instance.
 *
 * @param options - Renderer configuration (optional)
 * @returns A configured OpenFormRenderer for PDF templates
 *
 * @example
 * ```ts
 * // Use default USA serializers
 * const renderer = pdfRenderer();
 *
 * // Use custom serializers and signature options
 * const renderer = pdfRenderer({
 *   serializers: customSerializers,
 *   signatureOptions: {
 *     capturedText: '[Signed]',
 *     signaturePlaceholder: '___________',
 *   }
 * });
 * ```
 */
export function pdfRenderer(
  options: PdfRendererOptions = {}
): OpenFormRenderer<PdfTemplate, PdfOutput> {
  const configuredSerializers = options.serializers || usaSerializers
  const configuredSignatureOptions = options.signatureOptions

  return {
    id: 'pdf',

    async render(request: RenderRequest<PdfTemplate>) {
      // Extract field values from FormData for rendering
      // Note: RuntimeForm passes _adopted and _captures (with underscore prefix)
      const data = request.data as unknown as Record<string, unknown>
      const { fields, parties, _adopted, _captures, annexes } = data
      // Combine field values with other data for template rendering
      const dataRecord: Record<string, unknown> = {
        ...((fields as Record<string, unknown>) ?? {}),
        ...(parties ? { parties } : {}),
        ...(_adopted ? { _adopted } : {}),
        ...(_captures ? { _captures } : {}),
        ...(annexes ? { annexes } : {}),
      }

      // Priority: context serializers > configured serializers > default
      const activeSerializers = request.ctx?.serializers || configuredSerializers

      return await renderPdf({
        template: request.template.content,
        form: request.form,
        data: dataRecord,
        bindings: request.template.bindings,
        serializers: activeSerializers,
        signatureOptions: configuredSignatureOptions,
      })
    },
  }
}

export { renderPdf }
export type { RenderPdfOptions } from './render'
export { inspectAcroFormFields } from './inspect'
export type { PdfFieldInfo } from './inspect'
