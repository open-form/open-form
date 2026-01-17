/**
 * Common artifact infrastructure shared across all artifact types
 */

import type { Metadata } from "../primitives";

/**
 * Base properties for all artifact types
 */
export interface ArtifactBase {
  /** Unique identifier; must follow slug constraints. */
  name: string;
  /** Artifact version (semantic versioning). Required for publishing to registry. */
  version?: string;
  /** Human-friendly name presented to end users. Recommended for published/shared artifacts and directory browsing. */
  title?: string;
  /** Optional long-form description or context. */
  description?: string;
  /** Optional internal code or reference number. */
  code?: string;
  /** Optional ISO date string indicating when the artifact was released/published. */
  releaseDate?: string;
  /** Optional custom metadata map. */
  metadata?: Metadata;
}

/**
 * Inline layer with embedded text content.
 */
export interface InlineLayer {
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
 */
export interface FileLayer {
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
 * Layer specification — one of inline or file.
 * Layers are named renderings of content artifacts into specific formats.
 */
export type Layer = InlineLayer | FileLayer;

/**
 * Mapping from form field names to layer target identifiers.
 */
export type Bindings = Record<string, string>;
