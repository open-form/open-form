/**
 * Pure function to render text-based templates using Handlebars
 */

import Handlebars from "handlebars";
import type { SerializerRegistry, Form, Bindings } from "@open-form/types";
import { usaSerializers, preprocessFieldData } from "@open-form/serialization";
import { createSerializedFieldWrapper } from "./utils/field-serializer.js";
import { applyBindings } from "./utils/bindings.js";

/**
 * Render text-based template with Handlebars
 * Works with HTML, Markdown, plain text, and any text-based format
 *
 * Automatically applies serializers to fields based on schema types when form is provided,
 * enabling ergonomic templates like {{fee}} instead of {{money fee}}.
 *
 * @param options - Render options
 * @param options.template - Template string (can contain Handlebars syntax)
 * @param options.data - Data object to populate template
 * @param options.form - Optional form schema for automatic field type detection and serialization
 * @param options.serializers - Optional custom serializer registry. Uses USA serializers by default.
 * @param options.bindings - Optional mapping from template field names to form field names
 * @returns Rendered output string
 *
 * @example
 * ```ts
 * // With automatic serialization (when form schema is provided)
 * const output = renderText({
 *   template: 'Hello {{name}}, your fee is {{fee}}',
 *   data: { name: 'John', fee: { amount: 100, currency: 'USD' } },
 *   form: schema // form schema with fee as Money field
 * })
 * // output: "Hello John, your fee is $100.00"
 * ```
 */
export function renderText(options: {
  template: string;
  data: Record<string, unknown>;
  form?: Form;
  serializers?: SerializerRegistry;
  bindings?: Bindings;
}): string {
  // Create a new Handlebars instance to avoid global state issues
  const handlebars = Handlebars.create();

  // Use provided serializers or default to USA serializers
  const serializers = options.serializers || usaSerializers;

  // Preprocess data to wrap serializable fields if form schema is provided
  let dataToRender = options.data;
  if (options.form) {
    const wrapperStrategy = (value: unknown, fieldType: string) =>
      createSerializedFieldWrapper(value, fieldType, serializers);
    dataToRender = preprocessFieldData(options.data, options.form, wrapperStrategy);
  }

  // Apply bindings to remap data keys if provided
  // This happens AFTER preprocessing so bound fields inherit serialization
  if (options.bindings) {
    dataToRender = applyBindings(dataToRender, options.bindings);
  }

  // Compile and render template
  const compiledTemplate = handlebars.compile(options.template, {
    strict: false,
    noEscape: false,
  });

  return compiledTemplate(dataToRender);
}

