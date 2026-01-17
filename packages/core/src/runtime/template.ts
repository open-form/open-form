// packages/core/src/runtime/template.ts

import type {
  Layer,
  InlineLayer,
  FileLayer,
  Form,
  Resolver,
} from "@open-form/types";
import type { RendererLayer } from "./renderer";

// Re-export Resolver from types for convenience
export type { Resolver } from "@open-form/types";

/**
 * Options for creating an in-memory resolver.
 */
export interface MemoryResolverOptions {
  /**
   * Map of paths to content.
   * Values can be Uint8Array (binary) or string (will be UTF-8 encoded).
   */
  contents: Record<string, Uint8Array | string>;
}

/**
 * Create an in-memory resolver from a file map.
 * Useful for testing and browser environments.
 *
 * @example
 * ```typescript
 * const resolver = createMemoryResolver({
 *   contents: {
 *     '/templates/form.md': '# {{title}}',
 *     '/assets/logo.png': myLogoBytes,
 *   }
 * })
 * ```
 */
export function createMemoryResolver(options: MemoryResolverOptions): Resolver {
  const map = new Map(Object.entries(options.contents));
  const encoder = new TextEncoder();

  return {
    async read(path: string): Promise<Uint8Array> {
      const content = map.get(path);
      if (content === undefined) {
        throw new Error(`Not found: ${path}`);
      }
      if (typeof content === "string") {
        return encoder.encode(content);
      }
      return content;
    },
  };
}

/**
 * @deprecated Use Resolver instead. Will be removed in a future version.
 */
export type StorageProvider = Resolver;

/**
 * Infer a logical template "type" from an HTTP media type.
 * This is what renderer plugins use in their `supports` array.
 */
export function inferTemplateType(mediaType?: string): string {
  if (!mediaType) return "text";

  if (mediaType === "application/pdf") return "pdf";

  if (
    mediaType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }

  if (mediaType.startsWith("text/")) return "text";

  // Fallback: use the mediaType itself as the logical type.
  return mediaType;
}

/**
 * Resolve a Layer into a runtime RendererLayer.
 *
 * This function:
 *  - handles inline layers directly
 *  - loads file-based layers via the Resolver
 */
export async function resolveLayerToRendererLayer(
  layer: Layer,
  resolver: Resolver
): Promise<RendererLayer> {
  // 1. Inline layer
  if (layer.kind === "inline") {
    const inline = layer as InlineLayer;
    return {
      type: inferTemplateType(inline.mimeType),
      content: inline.text,
      mimeType: inline.mimeType,
    };
  }

  // 2. File-based layer
  const file = layer as FileLayer;
  const mimeType = file.mimeType;
  const type = inferTemplateType(mimeType);

  const location = file.path;
  if (!location) {
    throw new Error("FileLayer must include a path");
  }

  const bytes = await resolver.read(location);

  // Text-like media types: decode into string using utf-8.
  if (mimeType?.startsWith("text/")) {
    const decoder = new TextDecoder("utf-8");
    const text = decoder.decode(bytes);

    return {
      type,
      content: text,
      mimeType: mimeType,
      bindings: file.bindings,
    };
  }

  // Binary types (PDF, DOCX, etc.) stay as bytes.
  return {
    type,
    content: bytes,
    mimeType: mimeType,
    bindings: file.bindings,
  };
}

/**
 * Convenience helper: resolve a named layer from a Form.
 *
 * @param form - The form containing layers
 * @param resolver - Resolver for loading file-based layers
 * @param layerKey - Optional key of the layer to resolve. Uses defaultLayer if not provided.
 * @returns The resolved RendererLayer
 */
export async function resolveFormLayer(
  form: Form,
  resolver: Resolver,
  layerKey?: string
): Promise<RendererLayer> {
  if (!form.layers) {
    throw new Error("Form has no layers defined.");
  }

  // Determine which layer to use
  const key = layerKey || form.defaultLayer;
  if (!key) {
    throw new Error(
      "No layer key provided and no defaultLayer set on the form. " +
        "Either pass a layerKey argument or set defaultLayer on the form."
    );
  }

  const layer = form.layers[key];
  if (!layer) {
    throw new Error(
      `Layer "${key}" not found in form. Available layers: ${Object.keys(
        form.layers
      ).join(", ")}`
    );
  }

  return resolveLayerToRendererLayer(layer, resolver);
}

/**
 * @deprecated Use resolveFormLayer instead.
 */
export const resolveRendererLayer = resolveFormLayer;

/* -------------------------------------------------------------------------- */
/*                               Type Guards                                  */
/* -------------------------------------------------------------------------- */

/**
 * Check if a Layer is an inline layer.
 */
export function isInlineLayer(layer: Layer): layer is InlineLayer {
  return layer.kind === "inline";
}

/**
 * Check if a Layer is a file-backed layer.
 */
export function isFileLayer(layer: Layer): layer is FileLayer {
  return layer.kind === "file";
}
