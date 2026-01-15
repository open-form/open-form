/**
 * @open-form/renderer-docx
 *
 * DOCX renderer package for OpenForm
 */

import type {
  OpenFormRenderer,
  FormTemplate,
  BinaryContent,
  OpenFormRendererContext,
} from "@open-form/types";
import { renderDocx } from "./render";

export const docxRenderer: OpenFormRenderer<
  FormTemplate & { type: "docx"; content: BinaryContent },
  Uint8Array,
  unknown
> = {
  id: "docx",
  supports: ["docx"],
  outputExtension: "docx",
  outputMime:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  async render(template, form, data, _pdfBindings, ctx?: OpenFormRendererContext) {
    // template.content is your DOCX buffer
    // data is your form instance payload
    const dataRecord = data as Record<string, unknown>;
    // Pass custom formatters from context if available
    return await renderDocx(template.content, dataRecord, {}, ctx?.formatters);
  },
};

export { renderDocx };
