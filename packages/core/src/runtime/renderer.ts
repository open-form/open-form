// packages/core/src/runtime/renderer.ts
// Re-exports types from @open-form/types for backwards compatibility

// Re-export all types from @open-form/types
export type {
	BinaryContent,
	FormTemplate,
	RenderRequest,
	OpenFormRendererContext,
	OpenFormRenderer,
} from '@open-form/types';

// Import types for use in renderWithRenderer
import type {
	FormTemplate,
	RenderRequest,
	OpenFormRendererContext,
	OpenFormRenderer,
} from '@open-form/types';

/**
 * Convenience helper to enforce `supports` and call the renderer.
 * You can use this in your CLI or server rather than duplicating the check.
 */
export async function renderWithRenderer<
	Output,
	Data = unknown,
	Input extends FormTemplate = FormTemplate,
>(
	renderer: OpenFormRenderer<Input, Output, Data>,
	request: RenderRequest<Input, Data>,
	ctx?: OpenFormRendererContext,
): Promise<Output> {
	const { template, form, data, bindings } = request;

	if (!renderer.supports.includes(template.type)) {
		throw new Error(
			`Renderer "${renderer.id}" does not support template type "${template.type}". ` +
				`Supported types: ${renderer.supports.join(', ')}`,
		);
	}

	const templateWithBindings = bindings
		? ({ ...template, bindings } as Input)
		: template;

	return await renderer.render(
		templateWithBindings,
		form,
		data,
		bindings,
		ctx,
	);
}
