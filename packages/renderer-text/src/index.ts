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

/**
 * Configuration options for the text renderer.
 */
export interface TextRendererOptions {
  /**
   * Custom serializer registry for formatting field values.
   * Defaults to USA serializers with empty string fallbacks.
   */
  serializers?: SerializerRegistry;
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
  string,
  unknown
> {
  const configuredSerializers = options.serializers || usaSerializers;

  return {
    id: "text",
    render(
      request: RenderRequest<
        RendererLayer & { type: "text"; content: string },
        unknown
      >
    ) {
      const dataRecord = request.data as Record<string, unknown>;
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
      });
    },
  };
}

export { renderText };
