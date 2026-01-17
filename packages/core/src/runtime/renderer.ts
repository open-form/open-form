// packages/core/src/runtime/renderer.ts
// Re-exports types from @open-form/types for backwards compatibility

// Re-export all types from @open-form/types
export type {
  BinaryContent,
  RendererLayer,
  RenderRequest,
  OpenFormRendererContext,
  OpenFormRenderer,
} from "@open-form/types";

// Import types for use in renderWithRenderer
import type {
  RendererLayer,
  RenderRequest,
  OpenFormRendererContext,
  OpenFormRenderer,
} from "@open-form/types";

/**
 * Convenience helper to call a renderer.
 * The renderer's type parameter ensures type safety at compile time.
 */
export async function renderWithRenderer<
  Output,
  Data = unknown,
  Input extends RendererLayer = RendererLayer
>(
  renderer: OpenFormRenderer<Input, Output, Data>,
  request: RenderRequest<Input, Data>,
  ctx?: OpenFormRendererContext
): Promise<Output> {
  const { template, form, data, bindings } = request;

  const templateWithBindings = bindings
    ? ({ ...template, bindings } as Input)
    : template;

  return await renderer.render({
    template: templateWithBindings,
    form,
    data,
    bindings,
    ctx,
  });
}
