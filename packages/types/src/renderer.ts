/**
 * Renderer types for OpenForm
 *
 * These interfaces define the contract for OpenForm renderer plugins.
 */

import type { Form } from './form.js';
import type { FormatterRegistry } from './formatters.js';

/**
 * Binary content type for templates.
 * In Node.js, Buffer is assignable to Uint8Array, so this stays platform-agnostic.
 */
export type BinaryContent = Uint8Array;

/**
 * Runtime representation of a template that a renderer operates on.
 * This is the resolved form of your spec-level `Content` union.
 */
export interface FormTemplate {
	/**
	 * Logical template type understood by renderers.
	 * Typically 'text', 'docx', 'pdf', etc., but you can extend it.
	 */
	type: 'text' | 'docx' | 'pdf' | string;

	/**
	 * Template payload in memory: either text or binary.
	 */
	content: string | BinaryContent;

	/**
	 * Original media type, when known.
	 * e.g. 'text/markdown', 'application/pdf', etc.
	 */
	mediaType?: string;

	/**
	 * Optional engine-specific metadata.
	 * For example: PDF AcroForm bindings (fieldName -> acroFieldName).
	 */
	bindings?: Record<string, string>;
}

/**
 * Parameters required to execute a render operation.
 */
export interface RenderRequest<
	Input extends FormTemplate = FormTemplate,
	Data = unknown,
> {
	template: Input;
	form: Form;
	data: Data;
	bindings?: Record<string, string>;
}

/**
 * Context passed to renderers. Kept intentionally loose/optional so you can
 * grow it over time (logger, locale, flags, etc.) without breaking plugins.
 */
export interface OpenFormRendererContext {
	locale?: string;
	logger?: {
		debug?: (...args: unknown[]) => void;
		info?: (...args: unknown[]) => void;
		warn?: (...args: unknown[]) => void;
		error?: (...args: unknown[]) => void;
	};
	/**
	 * Custom formatter registry for locale/region-specific formatting.
	 * If not provided, renderers use their default formatters.
	 */
	formatters?: FormatterRegistry;
	// Room for future options:
	// e.g. dryRun?: boolean;
	//      timezone?: string;
	[key: string]: unknown;
}

/**
 * Renderer plugin interface.
 *
 * Implement this in packages like:
 *   - @open-form/renderer-text
 *   - @open-form/renderer-docx
 *   - @open-form/renderer-pdf
 */
export interface OpenFormRenderer<
	Input extends FormTemplate = FormTemplate,
	Output = unknown,
	Data = unknown,
> {
	/**
	 * Unique ID for this renderer (e.g. 'text', 'docx', 'pdf').
	 */
	id: string;

	/**
	 * Template `type` values this renderer knows how to handle.
	 * For simple cases, this is usually a single-element array like ['docx'].
	 */
	supports: Input['type'][];

	/**
	 * File extension (without dot) for the output produced.
	 * e.g. 'txt', 'docx', 'pdf'.
	 */
	outputExtension: string;

	/**
	 * MIME type of the rendered output.
	 * e.g. 'text/plain', 'application/pdf', etc.
	 */
	outputMime: string;

	/**
	 * Perform the actual rendering.
	 */
	render(
		template: Input,
		form: Form,
		data: Data,
		pdfBindings?: Record<string, string>,
		ctx?: OpenFormRendererContext,
	): Promise<Output> | Output;
}
