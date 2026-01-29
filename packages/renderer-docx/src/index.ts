/**
 * @open-form/renderer-docx
 *
 * DOCX renderer package for OpenForm
 */

import type {
  OpenFormRenderer,
  RendererLayer,
  RenderRequest,
  SerializerRegistry,
} from "@open-form/types";
import { usaSerializers } from "@open-form/serialization";
import { renderDocx } from "./render";
import type { DocxSignatureOptions } from "./utils/signature-helpers";

// Re-export signature helper types and functions
export type { DocxSignatureOptions } from "./utils/signature-helpers";
export { createDocxSignatureHelpers } from "./utils/signature-helpers";

/**
 * Configuration options for the DOCX renderer.
 */
export interface DocxRendererOptions {
  /**
   * Custom serializer registry for formatting field values.
   * Defaults to USA serializers.
   */
  serializers?: SerializerRegistry;
  /**
   * Options for signature and initials template marker rendering.
   * Controls placeholder text and captured text display.
   */
  signatureOptions?: DocxSignatureOptions;
}

/**
 * Create a configured DOCX renderer instance.
 *
 * @param options - Renderer configuration (optional)
 * @returns A configured OpenFormRenderer for DOCX templates
 *
 * @example
 * ```ts
 * // Use default USA serializers
 * const renderer = docxRenderer();
 *
 * // Use custom serializers and signature options
 * const renderer = docxRenderer({
 *   serializers: customSerializers,
 *   signatureOptions: {
 *     capturedText: '✓ SIGNED',
 *     signaturePlaceholder: '[Sign Here]',
 *   }
 * });
 * ```
 */
export function docxRenderer(
  options: DocxRendererOptions = {}
): OpenFormRenderer<
  RendererLayer & { type: "docx"; content: Uint8Array },
  Uint8Array
> {
  const configuredSerializers = options.serializers || usaSerializers;
  const configuredSignatureOptions = options.signatureOptions;

  return {
    id: "docx",
    async render(request: RenderRequest<RendererLayer & { type: "docx"; content: Uint8Array }>) {
      // Extract field values from FormData for rendering
      // Note: RuntimeForm passes _adopted and _captures (with underscore prefix)
      const data = request.data as unknown as Record<string, unknown>;
      const { fields, parties, _adopted, _captures, annexes } = data;
      // Combine field values with other data for template rendering
      const dataRecord: Record<string, unknown> = {
        ...((fields as Record<string, unknown>) ?? {}),
        ...(parties ? { parties } : {}),
        ...(_adopted ? { _adopted } : {}),
        ...(_captures ? { _captures } : {}),
        ...(annexes ? { annexes } : {}),
      };
      // Priority: context serializers > configured serializers > default
      const activeSerializers = request.ctx?.serializers || configuredSerializers;
      // Priority: request bindings > template bindings
      const activeBindings = request.bindings || request.template.bindings;
      return await renderDocx({
        template: request.template.content,
        data: dataRecord,
        form: request.form,
        serializers: activeSerializers,
        bindings: activeBindings,
        signatureOptions: configuredSignatureOptions,
      });
    },
  };
}

export { renderDocx };
export type { RenderDocxOptions, DocxRenderOptions } from "./render";
