/**
 * @open-form/renderer-docx
 *
 * DOCX renderer package for OpenForm
 */

import type {
  OpenFormRenderer,
  RendererLayer,
  OpenFormRendererContext,
} from "@open-form/types";
import { renderDocx } from "./render";
import type { RenderRequest } from "@open-form/types";

export const docxRenderer: OpenFormRenderer<
  RendererLayer & { type: "docx"; content: Uint8Array },
  Uint8Array,
  unknown
> = {
  id: "docx",
  async render(request: RenderRequest<RendererLayer & { type: "docx"; content: Uint8Array }, unknown>, ctx?: OpenFormRendererContext) {
    // Extract data as record
    const dataRecord = request.data as Record<string, unknown>;
    // Pass custom serializers from context if available
    // Priority: request bindings > template bindings
    const activeBindings = request.bindings || request.template.bindings;
    return await renderDocx(request.template.content, dataRecord, {}, request.form, ctx?.serializers, activeBindings);
  },
};

export { renderDocx };
