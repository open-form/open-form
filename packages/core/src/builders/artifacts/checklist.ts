import { coerceTypes } from '@/validators/coerce'
import { validateChecklist, validateChecklistItem, validateLayer } from '@/validators'
import type { Checklist, ChecklistItem, Metadata, Layer } from '@open-form/types'
import { extractSchema } from '@/schemas/extract'
import { MetadataBuilder } from '../primitives/metadata'
import { type Buildable, resolveBuildable } from '../utils/buildable'
import { BaseArtifactInstance } from './base-instance'
import type { RenderOptions } from '@/types'
import type { RendererLayer } from '@/runtime/renderer'

const checklistSchema = extractSchema('Checklist') as Record<string, unknown>
const checklistItemSchema = extractSchema('ChecklistItem') as Record<string, unknown>
const layerSchema = extractSchema('Layer') as Record<string, unknown>

function parseChecklistSchema(input: unknown): Checklist {
  const coerced = coerceTypes(checklistSchema, input) as Record<string, unknown>
  if (!validateChecklist(coerced)) {
    const errors = (validateChecklist as unknown as { errors: Array<{ message?: string }> }).errors
    throw new Error(`Invalid Checklist: ${errors?.[0]?.message || 'validation failed'}`)
  }
  return coerced as unknown as Checklist
}

function parseChecklistItem(input: unknown): ChecklistItem {
  const coerced = coerceTypes(checklistItemSchema, input) as Record<string, unknown>
  if (!validateChecklistItem(coerced)) {
    const errors = (validateChecklistItem as unknown as { errors: Array<{ message?: string }> }).errors
    throw new Error(`Invalid ChecklistItem: ${errors?.[0]?.message || 'validation failed'}`)
  }
  return coerced as unknown as ChecklistItem
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
// ChecklistInstance - Wrapper class for Checklist artifacts
// ============================================================================

/**
 * ChecklistInstance wraps a Checklist definition and provides validation,
 * serialization, and mutation methods.
 */
export class ChecklistInstance<C extends Checklist> extends BaseArtifactInstance<C> {
  constructor(checklist: C) {
    super(checklist)
  }

  // ============================================================================
  // Checklist-Specific Property Getters
  // ============================================================================

  get items() {
    return this.schema.items
  }

  get layers() {
    return this.schema.layers
  }

  get defaultLayer() {
    return this.schema.defaultLayer
  }

  // ============================================================================
  // Mutation Methods
  // ============================================================================

  clone(): ChecklistInstance<C> {
    return new ChecklistInstance(structuredClone(this.schema))
  }

  with(partial: Partial<ChecklistInput>): ChecklistInstance<Checklist> {
    const merged = { ...this.schema, ...partial }
    const parsed = parseChecklistSchema(merged)
    return new ChecklistInstance(parsed)
  }

  // ============================================================================
  // Rendering
  // ============================================================================

  /**
   * Render this checklist to an output format.
   *
   * The checklist must have at least one layer defined. Layer resolution priority:
   * 1. Explicit `layer` parameter
   * 2. `defaultLayer` property
   * 3. First available layer (if only one exists)
   *
   * @param options - Render options including renderer and optional resolver for file layers
   * @returns Promise resolving to rendered output
   *
   * @throws {Error} If checklist has no layers or specified layer is not found
   * @throws {Error} If file layer specified but no resolver provided
   *
   * @example
   * ```typescript
   * const checklist = open.checklist()
   *   .name('my-checklist')
   *   .items([...])
   *   .inlineLayer('html', 'text/html', htmlContent)
   *   .defaultLayer('html')
   *   .build()
   *
   * const output = await checklist.render({ renderer: htmlRenderer })
   * ```
   */
  async render<Output>(options: RenderOptions<Output>): Promise<Output> {
    const { renderer, resolver, layer: layerKey } = options

    if (!this.schema.layers) {
      throw new Error('Checklist has no layers defined')
    }

    // Resolve which layer to use
    const key = layerKey || this.schema.defaultLayer || Object.keys(this.schema.layers)[0]
    if (!key) {
      throw new Error(
        'No layer key provided and no defaultLayer set. ' +
          'Either pass a layer option or set defaultLayer on the checklist.'
      )
    }

    const layerSpec = this.schema.layers[key]
    if (!layerSpec) {
      throw new Error(
        `Layer "${key}" not found. Available layers: ${Object.keys(this.schema.layers).join(', ')}`
      )
    }

    // Extract layer content (inline or file)
    let layerContent: string | Uint8Array | Buffer
    const bindings = layerSpec.bindings

    if (layerSpec.kind === 'inline') {
      layerContent = layerSpec.text
    } else if (layerSpec.kind === 'file') {
      if (resolver) {
        const bytes = await resolver.read(layerSpec.path)
        // Decode text layers, keep binary layers as-is
        if (
          layerSpec.mimeType.startsWith('text/') ||
          layerSpec.mimeType === 'application/json'
        ) {
          layerContent = new TextDecoder().decode(bytes)
        } else {
          layerContent = bytes
        }
      } else {
        throw new Error(
          `Layer "${key}" is file-backed but no resolver was provided. ` +
            'Pass a resolver in the options object to auto-load file layers.'
        )
      }
    } else {
      throw new Error(`Unknown layer spec kind`)
    }

    // Build template and render
    const template: RendererLayer = {
      type: 'text',
      content: layerContent,
      mimeType: layerSpec.mimeType,
      ...(bindings && { bindings }),
    }

    const renderRequest = {
      template,
      form: this.schema,
      data: {},
      ...(bindings && { bindings }),
    }
    return await renderer.render(renderRequest as unknown as Parameters<typeof renderer.render>[0])
  }
}

// ============================================================================
// ChecklistBuilder - Fluent builder for creating checklists
// ============================================================================

class ChecklistBuilder<TItems extends ChecklistItem[] = []> {
  private _def: Record<string, unknown> = {
    kind: 'checklist',
    name: '',
    version: undefined,
    title: undefined,
    description: undefined,
    code: undefined,
    releaseDate: undefined,
    metadata: {},
    items: [],
    layers: undefined,
    defaultLayer: undefined,
  }

  from(checklistValue: Checklist): this {
    this._def = {
      kind: 'checklist',
      name: checklistValue.name,
      version: checklistValue.version,
      title: checklistValue.title,
      description: checklistValue.description,
      code: checklistValue.code,
      releaseDate: checklistValue.releaseDate,
      metadata: checklistValue.metadata ? { ...checklistValue.metadata } : {},
      items: checklistValue.items.map((item) => parseChecklistItem(item)),
      layers: checklistValue.layers
        ? Object.fromEntries(
            Object.entries(checklistValue.layers).map(([key, layer]) => [key, parseLayer(layer)])
          )
        : undefined,
      defaultLayer: checklistValue.defaultLayer,
    }
    return this
  }

  name(value: string): this {
    this._def.name = value
    return this
  }

  version(value?: string): this {
    this._def.version = value
    return this
  }

  title(value?: string): this {
    this._def.title = value
    return this
  }

  description(value: string | undefined): this {
    this._def.description = value
    return this
  }

  code(value: string | undefined): this {
    this._def.code = value
    return this
  }

  releaseDate(value: string | undefined): this {
    this._def.releaseDate = value
    return this
  }

  item(itemDef: Buildable<ChecklistItem>): this {
    const items = (this._def.items as ChecklistItem[]) || []
    items.push(parseChecklistItem(resolveBuildable(itemDef)))
    this._def.items = items
    return this
  }

  itemWithBooleanStatus(
    id: string,
    title: string,
    options?: {
      description?: string
      default?: boolean
    }
  ): this {
    const item: ChecklistItem = {
      id,
      title,
      ...(options?.description && { description: options.description }),
      status: {
        kind: 'boolean',
        ...(options?.default !== undefined && { default: options.default }),
      },
    }
    return this.item(item)
  }

  itemWithEnumStatus(
    id: string,
    title: string,
    options: {
      statusOptions: Array<{
        value: string
        label: string
        description?: string
      }>
      description?: string
      defaultStatus?: string
    }
  ): this {
    const item: ChecklistItem = {
      id,
      title,
      ...(options.description && { description: options.description }),
      status: {
        kind: 'enum',
        options: options.statusOptions,
        ...(options.defaultStatus && { default: options.defaultStatus }),
      },
    }
    return this.item(item)
  }

  items<const I extends ChecklistItem[]>(
    itemsArray: { [K in keyof I]: Buildable<I[K]> }
  ): ChecklistBuilder<I> {
    const parsed: ChecklistItem[] = []
    for (const itemDef of itemsArray as Array<Buildable<ChecklistItem>>) {
      parsed.push(parseChecklistItem(resolveBuildable(itemDef)))
    }
    this._def.items = parsed
    return this as unknown as ChecklistBuilder<I>
  }

  metadata(value: Metadata | MetadataBuilder | undefined): this {
    if (value instanceof MetadataBuilder) {
      this._def.metadata = value.build()
    } else {
      this._def.metadata = value
    }
    return this
  }

  /**
   * Sets the layers record for this checklist.
   */
  layers(value: Record<string, Layer>): this {
    const parsed: Record<string, Layer> = {}
    for (const [key, layer] of Object.entries(value)) {
      parsed[key] = parseLayer(layer)
    }
    this._def.layers = parsed
    return this
  }

  /**
   * Adds a single layer to the layers record.
   */
  layer(key: string, layerDef: Layer): this {
    const layers = (this._def.layers as Record<string, Layer>) || {}
    layers[key] = parseLayer(layerDef)
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
    return this.layer(key, { kind: 'inline', mimeType, text, ...options })
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

  build(): ChecklistInstance<Omit<Checklist, 'items'> & { items: TItems }> {
    const payload = Object.fromEntries(
      Object.entries(this._def).filter(([, value]) => value !== undefined)
    )
    const result = parseChecklistSchema(payload)
    return new ChecklistInstance(result as Omit<Checklist, 'items'> & { items: TItems })
  }
}

// ============================================================================
// Checklist API
// ============================================================================

// Re-export ChecklistInput from centralized types.ts
export type { ChecklistInput } from '@/types'

// Import for internal use
import type { ChecklistInput } from '@/types'

type ChecklistAPI = {
  (): ChecklistBuilder
  <const T extends ChecklistInput>(input: T): ChecklistInstance<T & { kind: 'checklist' }>
  from(input: unknown): ChecklistInstance<Checklist>
  safeFrom(input: unknown): { success: true; data: ChecklistInstance<Checklist> } | { success: false; error: Error }
  /** @deprecated Use `from()` instead */
  parse(input: unknown): Checklist
  /** @deprecated Use `safeFrom()` instead */
  safeParse(input: unknown): { success: true; data: Checklist } | { success: false; error: Error }
}

function checklistImpl(): ChecklistBuilder
function checklistImpl<const T extends ChecklistInput>(input: T): ChecklistInstance<T & { kind: 'checklist' }>
function checklistImpl<const T extends ChecklistInput>(input?: T): ChecklistBuilder | ChecklistInstance<T & { kind: 'checklist' }> {
  if (input !== undefined) {
    const withKind = { ...input, kind: 'checklist' as const }
    const parsed = parseChecklistSchema(withKind) as T & { kind: 'checklist' }
    return new ChecklistInstance(parsed)
  }
  return new ChecklistBuilder()
}

export const checklist: ChecklistAPI = Object.assign(checklistImpl, {
  from: (input: unknown): ChecklistInstance<Checklist> => {
    const parsed = parseChecklistSchema(input) as Checklist
    return new ChecklistInstance(parsed)
  },
  safeFrom: (input: unknown): { success: true; data: ChecklistInstance<Checklist> } | { success: false; error: Error } => {
    try {
      const parsed = parseChecklistSchema(input) as Checklist
      return {
        success: true,
        data: new ChecklistInstance(parsed),
      }
    } catch (err) {
      return { success: false, error: err as Error }
    }
  },
  parse: (input: unknown): Checklist => parseChecklistSchema(input) as Checklist,
  safeParse: (input: unknown): { success: true; data: Checklist } | { success: false; error: Error } => {
    try {
      return {
        success: true,
        data: parseChecklistSchema(input) as Checklist,
      }
    } catch (err) {
      return { success: false, error: err as Error }
    }
  },
})
