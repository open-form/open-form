import { coerceTypes } from '@/validators/coerce'
import { validateDocument, validateLayer } from '@/validators'
import type { Metadata, Document, Layer } from '@open-form/types'
import { extractSchema } from '@/schemas/extract'
import { MetadataBuilder } from '../primitives/metadata'
import { layer as layerBuilder, FileLayerBuilder, InlineLayerBuilder } from '../primitives/layer'
import { BaseArtifactInstance } from './base-instance'

const documentSchema = extractSchema('Document') as Record<string, unknown>
const layerSchema = extractSchema('Layer') as Record<string, unknown>

function parseDocumentSchema(input: unknown): Document {
  const coerced = coerceTypes(documentSchema, input) as Record<string, unknown>
  if (!validateDocument(coerced)) {
    const errors = (validateDocument as unknown as { errors: Array<{ message?: string }> }).errors
    throw new Error(`Invalid Document: ${errors?.[0]?.message || 'validation failed'}`)
  }
  return coerced as unknown as Document
}

function parseLayer(input: unknown): Layer {
  const coerced = coerceTypes(layerSchema, input) as Record<string, unknown>
  if (!validateLayer(coerced)) {
    const errors = (validateLayer as unknown as { errors: Array<{ message?: string }> }).errors
    throw new Error(`Invalid Layer: ${errors?.[0]?.message || 'validation failed'}`)
  }
  return coerced as unknown as Layer
}

// ============================================================================
// DocumentInstance - Wrapper class for Document artifacts
// ============================================================================

/**
 * DocumentInstance wraps a Document definition and provides validation,
 * serialization, and mutation methods.
 *
 * Document is a static content artifact (replaces Enclosure) used for
 * disclosures, pamphlets, or any static content that can be rendered
 * to different formats via layers.
 */
export class DocumentInstance<D extends Document> extends BaseArtifactInstance<D> {
  constructor(document: D) {
    super(document)
  }

  // ============================================================================
  // Document-Specific Property Getters
  // ============================================================================

  get layers() {
    return this.schema.layers
  }

  get defaultLayer() {
    return this.schema.defaultLayer
  }

  // ============================================================================
  // Mutation Methods
  // ============================================================================

  clone(): DocumentInstance<D> {
    return new DocumentInstance(structuredClone(this.schema))
  }

  with(partial: Partial<DocumentInput>): DocumentInstance<Document> {
    const merged = { ...this.schema, ...partial }
    const parsed = parseDocumentSchema(merged)
    return new DocumentInstance(parsed)
  }
}

// ============================================================================
// DocumentBuilder - Fluent builder for creating documents
// ============================================================================

class DocumentBuilder {
  private _def: Record<string, unknown> = {
    kind: 'document',
    name: '',
    version: '',
    title: '',
    description: undefined,
    code: undefined,
    releaseDate: undefined,
    metadata: {},
    layers: undefined,
    defaultLayer: undefined,
  }

  from(documentValue: Document): this {
    this._def = {
      kind: 'document',
      name: documentValue.name,
      version: documentValue.version,
      title: documentValue.title,
      description: documentValue.description,
      code: documentValue.code,
      releaseDate: documentValue.releaseDate,
      metadata: documentValue.metadata ? { ...documentValue.metadata } : {},
      layers: documentValue.layers
        ? Object.fromEntries(
            Object.entries(documentValue.layers).map(([key, layer]) => [key, parseLayer(layer)])
          )
        : undefined,
      defaultLayer: documentValue.defaultLayer,
    }
    return this
  }

  name(value: string): this {
    this._def.name = value
    return this
  }

  version(value: string): this {
    this._def.version = value
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

  code(value: string): this {
    this._def.code = value
    return this
  }

  releaseDate(value: string): this {
    this._def.releaseDate = value
    return this
  }

  /**
   * Sets the layers record for this document.
   * Accepts Layer objects or layer builders (FileLayerBuilder/InlineLayerBuilder).
   */
  layers(value: Record<string, Layer | FileLayerBuilder | InlineLayerBuilder>): this {
    const parsed: Record<string, Layer> = {}
    for (const [key, layerValue] of Object.entries(value)) {
      const resolved = layerBuilder.isBuilder(layerValue) ? layerBuilder.resolve(layerValue) : layerValue
      parsed[key] = parseLayer(resolved)
    }
    this._def.layers = parsed
    return this
  }

  /**
   * Adds a single layer to the layers record.
   * Accepts Layer object or layer builder (FileLayerBuilder/InlineLayerBuilder).
   */
  layer(key: string, layerDef: Layer | FileLayerBuilder | InlineLayerBuilder): this {
    const layers = (this._def.layers as Record<string, Layer>) || {}
    const resolved = layerBuilder.isBuilder(layerDef) ? layerBuilder.resolve(layerDef) : layerDef
    layers[key] = parseLayer(resolved)
    this._def.layers = layers
    return this
  }

  /**
   * Adds an inline layer with embedded text content.
   */
  inlineLayer(
    key: string,
    mimeType: string,
    text: string,
    options?: { title?: string; description?: string; checksum?: string; bindings?: Record<string, string> }
  ): this {
    return this.layer(key, {
      kind: 'inline',
      mimeType,
      text,
      ...options,
    })
  }

  /**
   * Adds a file-backed layer.
   */
  fileLayer(
    key: string,
    mimeType: string,
    path: string,
    options?: { title?: string; description?: string; checksum?: string; bindings?: Record<string, string> }
  ): this {
    return this.layer(key, {
      kind: 'file',
      mimeType,
      path,
      ...options,
    })
  }

  /**
   * Sets the default layer key.
   */
  defaultLayer(key: string): this {
    this._def.defaultLayer = key
    return this
  }

  metadata(value: Metadata | MetadataBuilder): this {
    const metadataValue = value instanceof MetadataBuilder ? value.build() : value
    this._def.metadata = metadataValue
    return this
  }

  build(): DocumentInstance<Document> {
    const payload = Object.fromEntries(
      Object.entries(this._def).filter(([, value]) => value !== undefined)
    )
    const result = parseDocumentSchema(payload)
    return new DocumentInstance(result)
  }
}

// ============================================================================
// Document API
// ============================================================================

export type DocumentInput = Omit<Document, 'kind'> & { kind?: 'document' }

type DocumentAPI = {
  (): DocumentBuilder
  <const T extends DocumentInput>(input: T): DocumentInstance<T & { kind: 'document' }>
  from(input: unknown): DocumentInstance<Document>
  safeFrom(input: unknown): { success: true; data: DocumentInstance<Document> } | { success: false; error: Error }
  /** @deprecated Use `from()` instead */
  parse(input: unknown): Document
  /** @deprecated Use `safeFrom()` instead */
  safeParse(input: unknown): { success: true; data: Document } | { success: false; error: Error }
}

function documentImpl(): DocumentBuilder
function documentImpl<const T extends DocumentInput>(input: T): DocumentInstance<T & { kind: 'document' }>
function documentImpl<const T extends DocumentInput>(input?: T): DocumentBuilder | DocumentInstance<T & { kind: 'document' }> {
  if (input !== undefined) {
    const withKind = { ...input, kind: 'document' as const }
    const parsed = parseDocumentSchema(withKind) as T & { kind: 'document' }
    return new DocumentInstance(parsed)
  }
  return new DocumentBuilder()
}

export const document: DocumentAPI = Object.assign(documentImpl, {
  from: (input: unknown): DocumentInstance<Document> => {
    const parsed = parseDocumentSchema(input) as Document
    return new DocumentInstance(parsed)
  },
  safeFrom: (input: unknown): { success: true; data: DocumentInstance<Document> } | { success: false; error: Error } => {
    try {
      const parsed = parseDocumentSchema(input) as Document
      return {
        success: true,
        data: new DocumentInstance(parsed),
      }
    } catch (err) {
      return { success: false, error: err as Error }
    }
  },
  parse: (input: unknown): Document => parseDocumentSchema(input) as Document,
  safeParse: (input: unknown): { success: true; data: Document } | { success: false; error: Error } => {
    try {
      return {
        success: true,
        data: parseDocumentSchema(input) as Document,
      }
    } catch (err) {
      return { success: false, error: err as Error }
    }
  },
})
