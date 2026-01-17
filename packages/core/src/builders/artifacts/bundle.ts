import { coerceTypes } from '@/validators/coerce'
import { validateBundle, validateBundleContentItem } from '@/validators'
import type { Metadata, Bundle, BundleContentItem, Form, Document, Checklist, CondExpr } from '@open-form/types'
import { extractSchema } from '@/schemas/extract'
import type { LogicSection } from '@/logic'
import { MetadataBuilder } from '../primitives/metadata'
import { type Buildable, resolveBuildable } from '../utils/buildable'
import { BaseArtifactInstance } from './base-instance'
import {
  assembleBundle,
  type BundleAssemblyOptions,
  type AssembledBundle,
} from '@/runtime/resolver'

const bundleSchema = extractSchema('Bundle') as Record<string, unknown>
const bundleContentItemSchema = extractSchema('BundleContentItem') as Record<string, unknown>

function parseBundleSchema(input: unknown): Bundle {
  const coerced = coerceTypes(bundleSchema, input) as Record<string, unknown>
  if (!validateBundle(coerced)) {
    const errors = (validateBundle as unknown as { errors: Array<{ message?: string }> }).errors
    throw new Error(`Invalid Bundle: ${errors?.[0]?.message || 'validation failed'}`)
  }
  return coerced as unknown as Bundle
}

function parseBundleContentItem(input: unknown): BundleContentItem {
  const coerced = coerceTypes(bundleContentItemSchema, input) as Record<string, unknown>
  if (!validateBundleContentItem(coerced)) {
    const errors = (validateBundleContentItem as unknown as { errors: Array<{ message?: string }> }).errors
    throw new Error(`Invalid BundleContentItem: ${errors?.[0]?.message || 'validation failed'}`)
  }
  return coerced as unknown as BundleContentItem
}

// ============================================================================
// BundleInstance - Wrapper class for Bundle artifacts
// ============================================================================

/**
 * BundleInstance wraps a Bundle definition and provides validation,
 * serialization, and mutation methods.
 *
 * Bundle is a recursive container artifact that groups together documents,
 * forms, checklists, and other bundles into a single distributable unit.
 */
export class BundleInstance<B extends Bundle> extends BaseArtifactInstance<B> {
  constructor(bundle: B) {
    super(bundle)
  }

  // ============================================================================
  // Bundle-Specific Property Getters
  // ============================================================================

  get logic() {
    return this.schema.logic
  }

  get contents() {
    return this.schema.contents
  }

  // ============================================================================
  // Assembly
  // ============================================================================

  /**
   * Assemble this bundle by resolving all contents and optionally rendering forms.
   *
   * @param options - Assembly options including resolver, form data, and renderer
   * @returns An AssembledBundle with all items ready for output
   *
   * @example
   * ```typescript
   * // Basic assembly
   * const assembled = await bundle.assemble({
   *   resolver,
   *   includeDocumentBytes: true,
   * })
   *
   * // Assembly with form rendering
   * const assembled = await bundle.assemble({
   *   resolver,
   *   includeDocumentBytes: true,
   *   formData: {
   *     leaseAgreement: leaseData,
   *     petAddendum: petData,
   *   },
   *   renderForm: async (form, data, resolver) => ({
   *     content: await renderFormToMarkdown(form, data, resolver),
   *     filename: `${form.name}.md`,
   *     mimeType: 'text/markdown',
   *   }),
   * })
   * ```
   */
  async assemble<Data = unknown>(options: BundleAssemblyOptions<Data>): Promise<AssembledBundle> {
    return assembleBundle(this.schema, options)
  }

  // ============================================================================
  // Mutation Methods
  // ============================================================================

  clone(): BundleInstance<B> {
    return new BundleInstance(structuredClone(this.schema))
  }

  with(partial: Partial<BundleInput>): BundleInstance<Bundle> {
    const merged = { ...this.schema, ...partial }
    const parsed = parseBundleSchema(merged)
    return new BundleInstance(parsed)
  }
}

// ============================================================================
// BundleBuilder - Fluent builder for creating bundles
// ============================================================================

class BundleBuilder<TContents extends BundleContentItem[] = []> {
  private _def: Record<string, unknown> = {
    kind: 'bundle',
    name: '',
    version: undefined,
    title: undefined,
    description: undefined,
    code: undefined,
    releaseDate: undefined,
    metadata: {},
    logic: undefined,
    contents: [],
  }

  from(bundle: Bundle): this {
    const parsedBundle = parseBundleSchema(bundle)
    this._def = {
      kind: 'bundle',
      name: parsedBundle.name,
      version: parsedBundle.version,
      title: parsedBundle.title,
      description: parsedBundle.description,
      code: parsedBundle.code,
      releaseDate: parsedBundle.releaseDate,
      metadata: parsedBundle.metadata ? { ...parsedBundle.metadata } : {},
      logic: parsedBundle.logic ? { ...parsedBundle.logic } : undefined,
      contents: parsedBundle.contents.map((content) => parseBundleContentItem(content)),
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
   * Sets the logic section for this bundle.
   * Logic contains named expressions that can be referenced in include conditions.
   */
  logic(logicDef: LogicSection): this {
    this._def.logic = logicDef
    return this
  }

  /**
   * Adds a single named expression to the logic section.
   */
  expr(name: string, expression: string): this {
    const logic = (this._def.logic as LogicSection) || {}
    logic[name] = expression
    this._def.logic = logic
    return this
  }

  /**
   * Add a registry reference content item.
   */
  registry(key: string, slug: string, include?: CondExpr): this {
    const contents = (this._def.contents as BundleContentItem[]) || []
    const item: BundleContentItem = { type: 'registry', key, slug }
    if (include !== undefined) {
      (item as { type: 'registry'; key: string; slug: string; include?: CondExpr }).include = include
    }
    contents.push(parseBundleContentItem(item) as BundleContentItem)
    this._def.contents = contents
    return this
  }

  /**
   * Add a path reference content item.
   */
  path(key: string, pathValue: string, include?: CondExpr): this {
    const contents = (this._def.contents as BundleContentItem[]) || []
    const item: BundleContentItem = { type: 'path', key, path: pathValue }
    if (include !== undefined) {
      (item as { type: 'path'; key: string; path: string; include?: CondExpr }).include = include
    }
    contents.push(parseBundleContentItem(item) as BundleContentItem)
    this._def.contents = contents
    return this
  }

  /**
   * Add an inline content item with an embedded artifact.
   */
  inline(
    key: string,
    artifact: Buildable<Document | Form | Checklist | Bundle>,
    _include?: CondExpr
  ): this {
    const contents = (this._def.contents as BundleContentItem[]) || []
    const resolvedArtifact = resolveBuildable(artifact)
    const item: BundleContentItem = { type: 'inline', key, artifact: resolvedArtifact }
    contents.push(parseBundleContentItem(item) as BundleContentItem)
    this._def.contents = contents
    return this
  }

  /**
   * @deprecated Use .registry(), .path(), or .inline() instead
   */
  addContent(content: Buildable<BundleContentItem>): this {
    const contents = (this._def.contents as BundleContentItem[]) || []
    const resolved = resolveBuildable(content)
    contents.push(parseBundleContentItem(resolved as unknown) as BundleContentItem)
    this._def.contents = contents
    return this
  }

  contents<const C extends BundleContentItem[]>(contentsArray: C): BundleBuilder<C> {
    const parsed: BundleContentItem[] = []
    for (const contentDef of contentsArray) {
      parsed.push(parseBundleContentItem(contentDef as unknown) as BundleContentItem)
    }
    this._def.contents = parsed
    return this as unknown as BundleBuilder<C>
  }

  removeContent(predicate: (content: BundleContentItem, index: number) => boolean): this {
    const contents = (this._def.contents as BundleContentItem[]) || []
    this._def.contents = contents.filter((content, index) => !predicate(content, index))
    return this
  }

  clearContents(): this {
    this._def.contents = []
    return this
  }

  metadata(value: Metadata | MetadataBuilder): this {
    const metadataValue = value instanceof MetadataBuilder ? value.build() : value
    this._def.metadata = metadataValue
    return this
  }

  build(): BundleInstance<Omit<Bundle, 'contents'> & { contents: TContents }> {
    const payload = Object.fromEntries(
      Object.entries(this._def).filter(([, value]) => value !== undefined)
    )
    const result = parseBundleSchema(payload as unknown) as Bundle
    return new BundleInstance(result as Omit<Bundle, 'contents'> & { contents: TContents })
  }
}

// ============================================================================
// Bundle API
// ============================================================================

// Re-export BundleInput from centralized types.ts
export type { BundleInput } from '@/types'

// Import for internal use
import type { BundleInput } from '@/types'

type BundleAPI = {
  (): BundleBuilder
  <const T extends BundleInput>(input: T): BundleInstance<T & { kind: 'bundle' }>
  from(input: unknown): BundleInstance<Bundle>
  safeFrom(input: unknown): { success: true; data: BundleInstance<Bundle> } | { success: false; error: Error }
  /** @deprecated Use `from()` instead */
  parse(input: unknown): Bundle
  /** @deprecated Use `safeFrom()` instead */
  safeParse(input: unknown): { success: true; data: Bundle } | { success: false; error: Error }
}

function bundleImpl(): BundleBuilder
function bundleImpl<const T extends BundleInput>(input: T): BundleInstance<T & { kind: 'bundle' }>
function bundleImpl<const T extends BundleInput>(input?: T): BundleBuilder | BundleInstance<T & { kind: 'bundle' }> {
  if (input !== undefined) {
    const withKind = { ...input, kind: 'bundle' as const }
    const parsed = parseBundleSchema(withKind) as T & { kind: 'bundle' }
    return new BundleInstance(parsed)
  }
  return new BundleBuilder()
}

export const bundle: BundleAPI = Object.assign(bundleImpl, {
  from: (input: unknown): BundleInstance<Bundle> => {
    const parsed = parseBundleSchema(input) as Bundle
    return new BundleInstance(parsed)
  },
  safeFrom: (input: unknown): { success: true; data: BundleInstance<Bundle> } | { success: false; error: Error } => {
    try {
      const parsed = parseBundleSchema(input) as Bundle
      return {
        success: true,
        data: new BundleInstance(parsed),
      }
    } catch (err) {
      return { success: false, error: err as Error }
    }
  },
  parse: (input: unknown): Bundle => parseBundleSchema(input) as Bundle,
  safeParse: (input: unknown): { success: true; data: Bundle } | { success: false; error: Error } => {
    try {
      return {
        success: true,
        data: parseBundleSchema(input) as Bundle,
      }
    } catch (err) {
      return { success: false, error: err as Error }
    }
  },
})
