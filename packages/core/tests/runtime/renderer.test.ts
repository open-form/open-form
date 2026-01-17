import { describe, test, expect, vi } from "vitest";
import { renderWithRenderer } from "@/runtime/renderer";
import type {
  RendererLayer,
  OpenFormRenderer,
  RenderRequest,
  Form,
} from "@open-form/types";

/**
 * Tests for runtime/renderer utilities.
 */
describe("runtime/renderer", () => {
  // ============================================================================
  // Test Fixtures
  // ============================================================================

  const createMockForm = (): Form => ({
    kind: "form",
    name: "test-form",
    version: "1.0.0",
    title: "Test Form",
    fields: {
      name: { type: "text", required: true },
    },
  });

  const createInlineTemplate = (): RendererLayer => ({
    type: "text/plain",
    content: "Hello, {{name}}!",
    mimeType: "text/plain",
  });

  const createFileTemplate = (): RendererLayer => ({
    type: "application/pdf",
    content: new Uint8Array([0x25, 0x50, 0x44, 0x46]), // PDF magic bytes
    mimeType: "application/pdf",
  });

  const createMockRenderer = (): OpenFormRenderer<RendererLayer, string, Record<string, unknown>> => ({
    id: "mock-renderer",
    render: vi.fn().mockResolvedValue("rendered output"),
  });

  // ============================================================================
  // renderWithRenderer Tests
  // ============================================================================

  describe("renderWithRenderer()", () => {
    describe("basic rendering", () => {
      test("calls renderer.render with correct arguments", async () => {
        const renderer = createMockRenderer();
        const form = createMockForm();
        const template = createInlineTemplate();
        const data = { fields: { name: "John" } };

        const request: RenderRequest<RendererLayer, Record<string, unknown>> = {
          template,
          form,
          data,
        };

        await renderWithRenderer(renderer, request);

        expect(renderer.render).toHaveBeenCalledWith(request);
      });

      test("returns renderer output", async () => {
        const renderer = createMockRenderer();
        const form = createMockForm();
        const template = createInlineTemplate();

        const request: RenderRequest<RendererLayer, Record<string, unknown>> = {
          template,
          form,
          data: { fields: { name: "John" } },
        };

        const result = await renderWithRenderer(renderer, request);

        expect(result).toBe("rendered output");
      });

      test("passes context to renderer", async () => {
        const renderer = createMockRenderer();
        const form = createMockForm();
        const template = createInlineTemplate();
        const ctx = { locale: "en-US" };

        const request: RenderRequest<RendererLayer, Record<string, unknown>> = {
          template,
          form,
          data: { fields: { name: "John" } },
        };

        await renderWithRenderer(renderer, request, ctx);

        expect(renderer.render).toHaveBeenCalledWith({
          template,
          form,
          data: request.data,
          ctx,
        });
      });
    });

    describe("template type validation", () => {
      test("succeeds when rendering template", async () => {
        const renderer = createMockRenderer();
        const form = createMockForm();
        const template = createFileTemplate();

        const request: RenderRequest<RendererLayer, Record<string, unknown>> = {
          template,
          form,
          data: { fields: { name: "John" } },
        };

        const result = await renderWithRenderer(renderer, request);

        expect(result).toBe("rendered output");
      });

      test("succeeds when rendering with any template type", async () => {
        const renderer = createMockRenderer();
        const form = createMockForm();
        const template = createFileTemplate(); // application/pdf

        const request: RenderRequest<RendererLayer, Record<string, unknown>> = {
          template,
          form,
          data: { fields: { name: "John" } },
        };

        const result = await renderWithRenderer(renderer, request);

        expect(result).toBe("rendered output");
      });
    });

    describe("bindings handling", () => {
      test("merges bindings into template when provided", async () => {
        const renderer = createMockRenderer();
        const form = createMockForm();
        const template = createInlineTemplate();
        const bindings = { customField: "customValue" };

        const request: RenderRequest<RendererLayer, Record<string, unknown>> = {
          template,
          form,
          data: { fields: { name: "John" } },
          bindings,
        };

        await renderWithRenderer(renderer, request);

        // Verify template was called with bindings merged
        expect(renderer.render).toHaveBeenCalledWith(
          expect.objectContaining({ bindings })
        );
      });

      test("does not modify template when bindings not provided", async () => {
        const renderer = createMockRenderer();
        const form = createMockForm();
        const template = createInlineTemplate();

        const request: RenderRequest<RendererLayer, Record<string, unknown>> = {
          template,
          form,
          data: { fields: { name: "John" } },
        };

        await renderWithRenderer(renderer, request);

        // Verify template was called without bindings
        expect(renderer.render).toHaveBeenCalledWith(request);
      });

      test("passes bindings in request", async () => {
        const renderer = createMockRenderer();
        const form = createMockForm();
        const template = createInlineTemplate();
        const bindings = { key: "value" };

        const request: RenderRequest<RendererLayer, Record<string, unknown>> = {
          template,
          form,
          data: { fields: { name: "John" } },
          bindings,
        };

        await renderWithRenderer(renderer, request);

        // Bindings should be included in the request
        expect(renderer.render).toHaveBeenCalledWith(
          expect.objectContaining({ bindings })
        );
      });
    });

    describe("async behavior", () => {
      test("awaits async renderer.render", async () => {
        const renderer = createMockRenderer();
        (renderer.render as ReturnType<typeof vi.fn>).mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve("delayed output"), 10)
            )
        );

        const form = createMockForm();
        const template = createInlineTemplate();

        const request: RenderRequest<RendererLayer, Record<string, unknown>> = {
          template,
          form,
          data: { fields: { name: "John" } },
        };

        const result = await renderWithRenderer(renderer, request);

        expect(result).toBe("delayed output");
      });

      test("propagates renderer errors", async () => {
        const renderer = createMockRenderer();
        (renderer.render as ReturnType<typeof vi.fn>).mockRejectedValue(
          new Error("Render failed")
        );

        const form = createMockForm();
        const template = createInlineTemplate();

        const request: RenderRequest<RendererLayer, Record<string, unknown>> = {
          template,
          form,
          data: { fields: { name: "John" } },
        };

        await expect(renderWithRenderer(renderer, request)).rejects.toThrow(
          "Render failed"
        );
      });
    });

    describe("different output types", () => {
      test("works with binary output renderers", async () => {
        const binaryRenderer: OpenFormRenderer<
          RendererLayer,
          Uint8Array,
          Record<string, unknown>
        > = {
          id: "binary-renderer",
          render: vi
            .fn()
            .mockResolvedValue(new Uint8Array([0x25, 0x50, 0x44, 0x46])),
        };

        const form = createMockForm();
        const template = createFileTemplate();

        const request: RenderRequest<RendererLayer, Record<string, unknown>> = {
          template,
          form,
          data: { fields: { name: "John" } },
        };

        const result = await renderWithRenderer(binaryRenderer, request);

        expect(result).toBeInstanceOf(Uint8Array);
        expect(result[0]).toBe(0x25); // PDF magic bytes
      });

      test("works with object output renderers", async () => {
        interface RenderResult {
          html: string;
          css: string;
        }

        const objectRenderer: OpenFormRenderer<
          RendererLayer,
          RenderResult,
          Record<string, unknown>
        > = {
          id: "object-renderer",
          render: vi.fn().mockResolvedValue({
            html: "<div>Hello</div>",
            css: ".div { color: red; }",
          }),
        };

        const form = createMockForm();
        const htmlTemplate: RendererLayer = {
          type: "text/html",
          content: "<div>{{name}}</div>",
          mimeType: "text/html",
        };

        const request: RenderRequest<RendererLayer, Record<string, unknown>> = {
          template: htmlTemplate,
          form,
          data: { fields: { name: "John" } },
        };

        const result = await renderWithRenderer(objectRenderer, request);

        expect(result.html).toBe("<div>Hello</div>");
        expect(result.css).toBe(".div { color: red; }");
      });
    });
  });
});
