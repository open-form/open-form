// src/inspect.ts

import {
  PDFDocument,
  PDFCheckBox,
  PDFDropdown,
  PDFRadioGroup,
  PDFTextField,
  PDFButton,
  PDFSignature,
} from "pdf-lib";

import type { BinaryContent } from "@open-form/types";

export type PdfFieldType =
  | "text"
  | "checkbox"
  | "dropdown"
  | "radio"
  | "button"
  | "signature"
  | "unknown";

export interface PdfFieldInfo {
  name: string;
  type: PdfFieldType;
  value?: string | boolean | string[];
  required?: boolean;
}

export interface InspectOptions {
  includeButton?: boolean;
  includeSignature?: boolean;
}

/**
 * Inspect a PDF template and return basic information about its AcroForm fields.
 *
 * @param template - PDF bytes (BinaryContent / Uint8Array)
 * @param options - Optional configuration to include button and signature fields
 */
export async function inspectAcroFormFields(
  template: BinaryContent,
  options: InspectOptions = {}
): Promise<PdfFieldInfo[]> {
  const { includeButton = false, includeSignature = false } = options;

  const pdfDoc = await PDFDocument.load(template, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  return fields
    .map((field): PdfFieldInfo | null => {
      const name = field.getName();
      let type: PdfFieldType = "unknown";
      let value: string | boolean | string[] | undefined;
      let required: boolean | undefined;

      if (field instanceof PDFTextField) {
        type = "text";
        value = field.getText();
        required = field.isRequired();
      } else if (field instanceof PDFCheckBox) {
        type = "checkbox";
        value = field.isChecked();
        required = field.isRequired();
      } else if (field instanceof PDFDropdown) {
        type = "dropdown";
        value = field.getSelected();
        required = field.isRequired();
      } else if (field instanceof PDFRadioGroup) {
        type = "radio";
        value = field.getSelected();
        required = field.isRequired();
      } else if (field instanceof PDFButton) {
        type = "button";
        if (!includeButton) return null;
      } else if (field instanceof PDFSignature) {
        type = "signature";
        if (!includeSignature) return null;
      }

      return { name, type, value, required };
    })
    .filter((field): field is PdfFieldInfo => field !== null);
}
