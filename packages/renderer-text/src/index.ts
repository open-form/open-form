/**
 * @open-form/renderer-text
 *
 * Text renderer package for OpenForm
 */

import type {
  OpenFormRenderer,
  RendererLayer,
  RenderRequest,
  SerializerRegistry,
} from "@open-form/types";
import { usaSerializers } from "@open-form/serialization";
import { renderText } from "./render";
import type { TextSignatureOptions } from "./utils/signature-helpers";

// Re-export signature helper types and functions
export type { TextSignatureOptions } from "./utils/signature-helpers";
export {
  createSignatureHelper,
  createInitialsHelper,
  registerSignatureHelpers,
} from "./utils/signature-helpers";

/**
 * Configuration options for the text renderer.
 */
export interface TextRendererOptions {
  /**
   * Custom serializer registry for formatting field values.
   * Defaults to USA serializers with empty string fallbacks.
   */
  serializers?: SerializerRegistry;
  /**
   * Options for signature and initials template marker rendering.
   * Controls format (text/html/markdown) and placeholder text.
   */
  signatureOptions?: TextSignatureOptions;
}

/**
 * Create a configured text renderer instance.
 *
 * @param options - Renderer configuration (optional)
 * @returns A configured OpenFormRenderer for text templates
 *
 * @example
 * ```ts
 * // Use default USA serializers
 * const renderer = textRenderer();
 *
 * // Use custom serializers with fallbacks
 * const renderer = textRenderer({
 *   serializers: createSerializer({
 *     regionFormat: "eu",
 *     fallbacks: { money: "N/A" }
 *   })
 * });
 * ```
 */
export function textRenderer(
  options: TextRendererOptions = {}
): OpenFormRenderer<
  RendererLayer & { type: "text"; content: string },
  string
> {
  const configuredSerializers = options.serializers || usaSerializers;
  const configuredSignatureOptions = options.signatureOptions;

  return {
    id: "text",
    render(
      request: RenderRequest<
        RendererLayer & { type: "text"; content: string }
      >
    ) {
      // Build data record for template rendering
      // Handle both FormData (with fields) and other artifacts (schema, items, etc.)
      let dataRecord: Record<string, unknown>;

      if ("fields" in request.data) {
        // FormData format: spread fields at top level, keep parties/annexes/logic namespaced
        const { fields, parties, annexes, logic, ...rest } = request.data as {
          fields?: Record<string, unknown>;
          parties?: Record<string, unknown>;
          annexes?: Record<string, unknown>;
          logic?: Record<string, unknown>;
          _signatures?: Record<string, unknown>;
        };
        dataRecord = {
          ...fields,
          ...(parties && { parties }),
          ...(annexes && { annexes }),
          ...(logic && { logic }),
          ...rest, // Include _signatures and other special keys
        };
      } else {
        // Checklist/Document format: pass through as-is (schema, items, etc.)
        dataRecord = request.data as Record<string, unknown>;
      }
      // Priority: context serializers > configured serializers > default
      const activeSerializers =
        request.ctx?.serializers || configuredSerializers;
      // Priority: request bindings > template bindings
      const activeBindings = request.bindings || request.template.bindings;
      return renderText({
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

export { renderText };
