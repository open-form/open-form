import type { InlineLayer, FileLayer, Layer } from '@open-form/types'

// ============================================================================
// Layer Builders
// ============================================================================

/**
 * Builder for FileLayer - a layer backed by a file.
 *
 * @example
 * ```typescript
 * open.layer()
 *   .file()
 *   .path('path/to/template.pdf')
 *   .mimeType('application/pdf')
 *   .title('PDF Version')
 *   .bindings({ name: 'field_name' })
 * ```
 */
export class FileLayerBuilder {
  private _def: Partial<FileLayer> & { kind: 'file' }

  constructor() {
    this._def = {
      kind: 'file',
    }
  }

  path(value: string): this {
    this._def.path = value
    return this
  }

  mimeType(value: string): this {
    this._def.mimeType = value
    return this
  }

  title(value: string): this {
    this._def.title = value
    return this
  }

  description(value: string): this {
    this._def.description = value
    return this
  }

  checksum(value: string): this {
    this._def.checksum = value
    return this
  }

  bindings(value: Record<string, string>): this {
    this._def.bindings = value
    return this
  }

  build(): FileLayer {
    if (!this._def.path) {
      throw new Error('FileLayer requires a path. Use .path() to set it.')
    }
    if (!this._def.mimeType) {
      throw new Error('FileLayer requires a mimeType. Use .mimeType() to set it.')
    }
    return this._def as FileLayer
  }
}

/**
 * Builder for InlineLayer - a layer with embedded text content.
 *
 * @example
 * ```typescript
 * open.layer()
 *   .inline()
 *   .text('Hello {{name}}!')
 *   .mimeType('text/plain')
 *   .title('Greeting')
 * ```
 */
export class InlineLayerBuilder {
  private _def: Partial<InlineLayer> & { kind: 'inline' }

  constructor() {
    this._def = {
      kind: 'inline',
    }
  }

  text(value: string): this {
    this._def.text = value
    return this
  }

  mimeType(value: string): this {
    this._def.mimeType = value
    return this
  }

  title(value: string): this {
    this._def.title = value
    return this
  }

  description(value: string): this {
    this._def.description = value
    return this
  }

  checksum(value: string): this {
    this._def.checksum = value
    return this
  }

  bindings(value: Record<string, string>): this {
    this._def.bindings = value
    return this
  }

  build(): InlineLayer {
    if (!this._def.text) {
      throw new Error('InlineLayer requires text content. Use .text() to set it.')
    }
    if (!this._def.mimeType) {
      throw new Error('InlineLayer requires a mimeType. Use .mimeType() to set it.')
    }
    return this._def as InlineLayer
  }
}

/**
 * Entry point builder that lets you choose the layer kind.
 *
 * @example
 * ```typescript
 * // File-backed layer
 * open.layer()
 *   .file()
 *   .path('path/to/template.md')
 *   .mimeType('text/markdown')
 *
 * // With optional properties
 * open.layer()
 *   .file()
 *   .path('path/to/template.pdf')
 *   .mimeType('application/pdf')
 *   .title('PDF Version')
 *   .bindings({ name: 'field_name' })
 *
 * // Inline layer
 * open.layer()
 *   .inline()
 *   .text('Hello {{name}}!')
 *   .mimeType('text/plain')
 * ```
 */
export class LayerBuilder {
  /**
   * Create a file-backed layer.
   * Chain with .path() and .mimeType() to set required properties.
   */
  file(): FileLayerBuilder {
    return new FileLayerBuilder()
  }

  /**
   * Create an inline layer with embedded text.
   * Chain with .text() and .mimeType() to set required properties.
   */
  inline(): InlineLayerBuilder {
    return new InlineLayerBuilder()
  }
}

// ============================================================================
// Layer API
// ============================================================================

type LayerAPI = {
  /** Start building a layer - chain with .file() or .inline() */
  (): LayerBuilder
  /** Create a file layer directly - chain with .path() and .mimeType() */
  file(): FileLayerBuilder
  /** Create an inline layer directly - chain with .text() and .mimeType() */
  inline(): InlineLayerBuilder
  /** Check if a value is a layer builder */
  isBuilder(value: unknown): value is FileLayerBuilder | InlineLayerBuilder
  /** Resolve a layer or builder to a Layer object */
  resolve(value: Layer | FileLayerBuilder | InlineLayerBuilder): Layer
}

function layerImpl(): LayerBuilder {
  return new LayerBuilder()
}

export const layer: LayerAPI = Object.assign(layerImpl, {
  file: () => new FileLayerBuilder(),
  inline: () => new InlineLayerBuilder(),
  isBuilder: (value: unknown): value is FileLayerBuilder | InlineLayerBuilder => {
    return value instanceof FileLayerBuilder || value instanceof InlineLayerBuilder
  },
  resolve: (value: Layer | FileLayerBuilder | InlineLayerBuilder): Layer => {
    if (value instanceof FileLayerBuilder || value instanceof InlineLayerBuilder) {
      return value.build()
    }
    return value
  },
})
