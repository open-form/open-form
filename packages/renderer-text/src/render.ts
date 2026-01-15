/**
 * Pure function to render text-based templates using Handlebars
 */

import Handlebars from "handlebars";
import { registerOpenFormHelpers } from "./helpers/index.js";
import type { FormatterRegistry } from "@open-form/types";
import { usaFormatters } from "@open-form/serialization";

/**
 * Render text-based template with Handlebars
 * Works with HTML, Markdown, plain text, and any text-based format
 *
 * @param template - Template string (can contain Handlebars syntax)
 * @param data - Data object to populate template
 * @param formatters - Optional custom formatter registry. Uses USA formatters by default.
 * @returns Rendered output string
 *
 * @example
 * ```ts
 * const template = 'Hello {{name}}, your sale price is {{money salePrice}}'
 * const data = { name: 'John', salePrice: { amount: 250000, currency: 'USD' } }
 * const output = renderText(template, data)
 * // output: "Hello John, your sale price is $250,000.00"
 * ```
 */
export function renderText(
  template: string,
  data: Record<string, unknown>,
  formatters: FormatterRegistry = usaFormatters,
): string {
  // Create a new Handlebars instance to avoid global state issues
  const handlebars = Handlebars.create();

  // Register OpenForm helpers with optional custom formatters
  registerOpenFormHelpers(handlebars, formatters);

  // Compile and render template
  const compiledTemplate = handlebars.compile(template, {
    strict: false,
    noEscape: false,
  });

  return compiledTemplate(data);
}

