/**
 * @open-form/renderer-text
 *
 * Text renderer package for OpenForm
 */

import type {
  OpenFormRenderer,
  FormTemplate,
  OpenFormRendererContext,
} from "@open-form/types";
import { renderText } from "./render";

export const textRenderer: OpenFormRenderer<
  FormTemplate & { type: "text"; content: string },
  string,
  unknown
> = {
  id: "text",
  supports: ["text"],
  outputExtension: "txt",
  outputMime: "text/plain",
  render(template, form, data, _pdfBindings, ctx?: OpenFormRendererContext) {
    // template.content is your text template
    // data is your form instance payload
    const dataRecord = data as Record<string, unknown>;
    // Pass custom formatters from context if available
    return renderText(template.content, dataRecord, ctx?.formatters);
  },
};

export { renderText };
