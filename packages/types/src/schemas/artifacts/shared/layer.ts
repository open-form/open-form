/**
 * Layer types for artifact rendering
 */

/**
 * Inline layer with embedded text content.
 * Used for layers where content is stored directly in the artifact definition.
 */
export interface InlineLayer {
  /** Discriminator for inline layer type. */
  kind: "inline";
  /** MIME type of the content (e.g., text/markdown, text/html). */
  mimeType: string;
  /** Layer content with interpolation placeholders. */
  text: string;
  /** Optional human-readable title for this layer. */
  title?: string;
  /** Optional description of what this layer represents. */
  description?: string;
  /** Optional SHA-256 checksum for integrity verification. */
  checksum?: string;
  /** Optional field bindings for the layer (typically for PDF). */
  bindings?: Record<string, string>;
}

/**
 * File-backed layer with external file reference.
 * Used for layers where content is stored in a separate file.
 */
export interface FileLayer {
  /** Discriminator for file layer type. */
  kind: "file";
  /** MIME type of the file (e.g., application/pdf). */
  mimeType: string;
  /** Absolute path from repo root to the layer file. */
  path: string;
  /** Optional human-readable title for this layer. */
  title?: string;
  /** Optional description of what this layer represents. */
  description?: string;
  /** Optional SHA-256 checksum for integrity verification. */
  checksum?: string;
  /** Optional field bindings for the layer (typically for PDF). */
  bindings?: Record<string, string>;
}

/**
 * Layer specification - one of inline or file.
 * Layers are named renderings of content artifacts into specific formats.
 */
export type Layer = InlineLayer | FileLayer;

/**
 * Mapping from form field names to layer target identifiers.
 * Used to bind form fields to PDF form fields or other layer targets.
 */
export type Bindings = Record<string, string>;
