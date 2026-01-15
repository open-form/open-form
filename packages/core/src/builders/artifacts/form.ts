import { coerceTypes } from '@/validators/coerce'
import { validateForm, validateField, validateAnnex, validateLayer, validateFormParty, validateWitnessRequirement } from '@/validators'
import type { Form, Field, Metadata, Annex, Layer, FormParty, WitnessRequirement, Party } from '@open-form/types'
import { extractSchema } from '@/schemas/extract'
import type { LogicSection } from '@/logic'
import { MetadataBuilder } from '../primitives/metadata'
import { type Buildable, resolveBuildable } from '../utils/buildable'
import {
  validateFormData,
  type ValidationResult,
  type ValidationError,
  type InferFormPayload,
} from '@/utils'
import type { OpenFormRenderer, FormTemplate } from '@/runtime/renderer'
import type { Resolver } from '@open-form/types'
import { BaseArtifactInstance } from './base-instance'
import { FilledForm } from '@/filled-form'

const formSchema = extractSchema('Form') as Record<string, unknown>
const fieldSchema = extractSchema('Field') as Record<string, unknown>
const annexSchema = extractSchema('Annex') as Record<string, unknown>
const layerSchema = extractSchema('Layer') as Record<string, unknown>
const formPartySchema = extractSchema('FormParty') as Record<string, unknown>
const witnessRequirementSchema = extractSchema('WitnessRequirement') as Record<string, unknown>

function parseFormSchema(input: unknown): Form {
  const coerced = coerceTypes(formSchema, input) as Record<string, unknown>
  if (!validateForm(coerced)) {
    const errors = (validateForm as unknown as { errors: Array<{ message?: string }> }).errors
    throw new Error(`Invalid Form: ${errors?.[0]?.message || 'validation failed'}`)
  }
  return coerced as unknown as Form
}

function parseField(input: unknown): Field {
  const coerced = coerceTypes(fieldSchema, input) as Record<string, unknown>
  if (!validateField(coerced)) {
    const errors = (validateField as unknown as { errors: Array<{ message?: string }> }).errors
    throw new Error(`Invalid Field: ${errors?.[0]?.message || 'validation failed'}`)
  }
  return coerced as unknown as Field
}

function parseAnnex(input: unknown): Annex {
  const coerced = coerceTypes(annexSchema, input) as Record<string, unknown>
  if (!validateAnnex(coerced)) {
    const errors = (validateAnnex as unknown as { errors: Array<{ message?: string }> }).errors
    throw new Error(`Invalid Annex: ${errors?.[0]?.message || 'validation failed'}`)
  }
  return coerced as unknown as Annex
}

function parseLayer(input: unknown): Layer {
  const coerced = coerceTypes(layerSchema, input) as Record<string, unknown>
  if (!validateLayer(coerced)) {
    const errors = (validateLayer as unknown as { errors: Array<{ message?: string }> }).errors
    throw new Error(`Invalid Layer: ${errors?.[0]?.message || 'validation failed'}`)
  }
  return coerced as unknown as Layer
}

function parseFormParty(input: unknown): FormParty {
  const coerced = coerceTypes(formPartySchema, input) as Record<string, unknown>
  if (!validateFormParty(coerced)) {
    const errors = (validateFormParty as unknown as { errors: Array<{ message?: string }> }).errors
    throw new Error(`Invalid FormParty: ${errors?.[0]?.message || 'validation failed'}`)
  }
  return coerced as unknown as FormParty
}

function parseWitnessRequirement(input: unknown): WitnessRequirement {
  const coerced = coerceTypes(witnessRequirementSchema, input) as Record<string, unknown>
  if (!validateWitnessRequirement(coerced)) {
    const errors = (validateWitnessRequirement as unknown as { errors: Array<{ message?: string }> }).errors
    throw new Error(`Invalid WitnessRequirement: ${errors?.[0]?.message || 'validation failed'}`)
  }
  return coerced as unknown as WitnessRequirement
}

// ============================================================================
// FormInstance - Wrapper class with Zod-style API
// ============================================================================

/**
 * Custom error class for data validation failures
 */
export class FormValidationError extends Error {
  readonly errors: ValidationError[]

  constructor(errors: ValidationError[]) {
    super(`Form data validation failed: ${errors.map((e) => e.message).join(', ')}`)
    this.name = 'FormValidationError'
    this.errors = errors
  }
}

/**
 * Options for the render method
 */
export interface RenderOptions<Output = unknown> {
  /** The renderer to use (e.g., textRenderer, pdfRenderer) */
  renderer: OpenFormRenderer<FormTemplate, Output, Record<string, unknown>>
  /** Resolver for auto-loading file-backed layers (only needs read method) */
  resolver?: Resolver
  /** Field values to populate the layer with */
  data?: Record<string, unknown>
  /** Key of the layer to use. If not provided, uses first available or defaultLayer. */
  layer?: string
}

/**
 * Options for the fill method
 */
export interface FillOptions {
  /** Field values and annexes to populate the form with */
  fields?: Record<string, unknown>
  /** Annex data */
  annexes?: Record<string, unknown>
  /** Party data indexed by role ID */
  parties?: Record<string, Party | Party[]>
  /** Witness data */
  witnesses?: Party[]
}

/**
 * FormInstance wraps a Form definition and provides Zod-style methods for
 * validation and rendering. The underlying form data is accessible via `schema`.
 *
 * @example
 * ```typescript
 * const form = open.form({
 *   name: 'example',
 *   version: '1.0.0',
 *   title: 'Example Form',
 *   fields: { age: { type: 'number', required: true } },
 *   layers: {
 *     html: { kind: 'inline', mimeType: 'text/html', text: '<p>Age: {{age}}</p>' },
 *   },
 *   defaultLayer: 'html',
 * })
 *
 * // Parse data (throws on error)
 * const data = form.parseData({ fields: { age: 25 } })
 *
 * // Safe parse (returns result object)
 * const result = form.safeParseData({ fields: { age: 25 } })
 * if (result.success) {
 *   console.log(result.data)
 * }
 *
 * // Render with default layer
 * const output = await form.render(textRenderer, { data: { age: 25 } })
 *
 * // Render with specific layer
 * const output = await form.render(textRenderer, { data: { age: 25 }, layer: 'html' })
 *
 * // Access raw form for serialization
 * const yaml = form.toYAML()
 * ```
 */
export class FormInstance<F extends Form> extends BaseArtifactInstance<F> {
  constructor(form: F) {
    super(form)
  }

  // ============================================================================
  // Form-Specific Property Getters
  // ============================================================================

  get logic() {
    return this.schema.logic
  }

  get fields() {
    return this.schema.fields
  }

  get layers() {
    return this.schema.layers
  }

  get defaultLayer() {
    return this.schema.defaultLayer
  }

  get annexes() {
    return this.schema.annexes
  }

  get allowAnnexes() {
    return this.schema.allowAnnexes
  }

  get parties() {
    return this.schema.parties
  }

  get witnesses() {
    return this.schema.witnesses
  }

  // ============================================================================
  // Data Validation (Form-specific)
  // ============================================================================

  /**
   * Validates data payload against this form.
   * Throws FormValidationError if validation fails.
   *
   * @param data - The data payload to validate (typically `{ fields: {...} }`)
   * @returns The validated data with defaults applied
   * @throws FormValidationError if validation fails
   *
   * @example
   * ```typescript
   * try {
   *   const validated = form.parseData({ name: 'John', age: 30 })
   *   // validated has correct types
   * } catch (err) {
   *   if (err instanceof FormValidationError) {
   *     console.error(err.errors)
   *   }
   * }
   * ```
   */
  parseData(data: Record<string, unknown>): InferFormPayload<F> {
    const result = this.safeParseData(data)
    if (!result.success) {
      throw new FormValidationError(result.errors)
    }
    return result.data
  }

  /**
   * Validates data payload against this form.
   * Returns a result object instead of throwing.
   *
   * @param data - The data payload to validate (typically `{ fields: {...} }`)
   * @returns Validation result with success status, data (with defaults), and errors
   *
   * @example
   * ```typescript
   * const result = form.safeParseData({ name: 'John', age: 30 })
   * if (result.success) {
   *   console.log(result.data)
   * } else {
   *   console.error(result.errors)
   * }
   * ```
   */
  safeParseData(data: Record<string, unknown>): ValidationResult<InferFormPayload<F>> {
    return validateFormData(this.schema, data)
  }

  // ============================================================================
  // Deprecated Methods (for backwards compatibility)
  // ============================================================================

  /**
   * @deprecated Use `parseData()` instead. Will be removed in next major version.
   */
  parse(data: Record<string, unknown>): InferFormPayload<F> {
    return this.parseData(data)
  }

  /**
   * @deprecated Use `safeParseData()` instead. Will be removed in next major version.
   */
  safeParse(data: Record<string, unknown>): ValidationResult<InferFormPayload<F>> {
    return this.safeParseData(data)
  }

  // ============================================================================
  // Rendering
  // ============================================================================

  /**
   * Render this form with the given options.
   *
   * @param options - Render options including renderer, resolver, data, and layer key
   * @returns The rendered output (type depends on renderer)
   *
   * @example
   * ```typescript
   * // With resolver (auto-loads file-backed layers)
   * const output = await form.render({
   *   renderer: textRenderer,
   *   resolver,
   *   data: { name: 'John' },
   *   layer: 'markdown'
   * })
   *
   * // Inline layer (no resolver needed)
   * const output = await form.render({
   *   renderer: textRenderer,
   *   data: { name: 'John' },
   *   layer: 'html'
   * })
   * ```
   */
  async render<Output>(options: RenderOptions<Output>): Promise<Output> {
    const { renderer, resolver, data = {}, layer: layerKey } = options

    if (!this.schema.layers) {
      throw new Error('Form has no layers defined')
    }

    // Determine which layer to use
    const key = layerKey || this.schema.defaultLayer || Object.keys(this.schema.layers)[0]
    if (!key) {
      throw new Error(
        'No layer key provided and no defaultLayer set. ' +
          'Either pass a layer option or set defaultLayer on the form.'
      )
    }

    const layerSpec = this.schema.layers[key]
    if (!layerSpec) {
      throw new Error(
        `Layer "${key}" not found. Available layers: ${Object.keys(this.schema.layers).join(', ')}`
      )
    }

    // Determine content based on layer spec type
    let layerContent: string | Uint8Array | Buffer
    let bindings: Record<string, string> | undefined

    if (layerSpec.kind === 'inline') {
      layerContent = layerSpec.text
    } else if (layerSpec.kind === 'file') {
      if (resolver) {
        // Auto-load file-backed layer via resolver
        const bytes = await resolver.read(layerSpec.path)
        // Convert Uint8Array to string for text layers
        if (layerSpec.mimeType.startsWith('text/') || layerSpec.mimeType === 'application/json') {
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
      bindings = layerSpec.bindings
    } else {
      throw new Error(`Unknown layer spec kind`)
    }

    // Build template for renderer
    const template: FormTemplate = {
      type: renderer.supports[0] || 'text',
      content: layerContent,
      mediaType: layerSpec.mimeType,
      ...(bindings && { bindings }),
    }

    // Extract fields from data payload if present (supports both { fields: {...} } and flat field objects)
    const renderData = (data && typeof data === 'object' && 'fields' in data && typeof data.fields === 'object')
      ? (data.fields as Record<string, unknown>)
      : data

    return await renderer.render(template, this.schema, renderData, bindings)
  }

  // ============================================================================
  // Mutation Methods
  // ============================================================================

  /**
   * Create an exact copy of this FormInstance.
   *
   * @returns A new FormInstance with a deep clone of the form data
   *
   * @example
   * ```typescript
   * const copy = form.clone()
   * // Modify copy without affecting original
   * ```
   */
  clone(): FormInstance<F> {
    return new FormInstance(structuredClone(this.schema))
  }

  /**
   * Create a modified copy of this FormInstance.
   * The original instance is not modified.
   *
   * @param partial - Partial form properties to merge/override
   * @returns A new FormInstance with the merged properties
   *
   * @example
   * ```typescript
   * const v2 = form.with({ version: '2.0.0' })
   * const renamed = form.with({ name: 'new-name', title: 'New Title' })
   * ```
   */
  with(partial: Partial<FormInput>): FormInstance<Form> {
    const merged = { ...this.schema, ...partial }
    const parsed = parseFormSchema(merged)
    return new FormInstance(parsed)
  }

  // ============================================================================
  // FilledForm Creation
  // ============================================================================

  /**
   * Create a FilledForm by combining this form with validated data.
   * The data is validated before the FilledForm is created.
   *
   * @param data - The data payload to fill the form with (can be FillOptions or legacy Record format)
   * @returns A FilledForm instance with the validated data
   * @throws FormValidationError if data validation fails
   *
   * @example
   * ```typescript
   * const form = open.form({
   *   name: 'example',
   *   version: '1.0.0',
   *   title: 'Example',
   *   fields: { name: { type: 'text', required: true } },
   *   parties: [{ id: 'buyer', label: 'Buyer', signature: { required: true } }],
   *   layers: { html: { kind: 'inline', mimeType: 'text/html', text: 'Hello {{name}}' } },
   *   defaultLayer: 'html',
   * })
   *
   * // Fill with data and parties
   * const filled = form.fill({
   *   fields: { name: 'John' },
   *   parties: {
   *     buyer: { type: 'person', fullName: 'John Smith' }
   *   }
   * })
   *
   * // FilledForm can render without passing data
   * const output = await filled.render(textRenderer)
   *
   * // Update data immutably
   * const updated = filled.set('name', 'Jane')
   *
   * // Check signature status
   * console.log(filled.isFullySigned())
   * ```
   */
  fill(data: FillOptions | Record<string, unknown>): FilledForm<F> {
    // Normalize to FillOptions format
    const options = this.normalizeFillData(data)

    // Validate field data
    const fieldData = {
      fields: options.fields ?? {},
      ...(options.annexes ? { annexes: options.annexes } : {}),
    }
    const validated = this.parseData(fieldData)

    return new FilledForm(this, validated, options.parties, options.witnesses)
  }

  /**
   * Safely create a FilledForm, returning a result object instead of throwing.
   *
   * @param data - The data payload to fill the form with (can be FillOptions or legacy Record format)
   * @returns A result object with success status and either FilledForm or error
   *
   * @example
   * ```typescript
   * const result = form.safeFill({
   *   fields: { name: 'John' },
   *   parties: { buyer: { type: 'person', fullName: 'John' } }
   * })
   * if (result.success) {
   *   await result.data.render(textRenderer)
   * } else {
   *   console.error(result.error)
   * }
   * ```
   */
  safeFill(data: FillOptions | Record<string, unknown>): { success: true; data: FilledForm<F> } | { success: false; error: Error } {
    // Normalize to FillOptions format
    const options = this.normalizeFillData(data)

    // Validate field data
    const fieldData = {
      fields: options.fields ?? {},
      ...(options.annexes ? { annexes: options.annexes } : {}),
    }
    const result = this.safeParseData(fieldData)

    if (result.success) {
      return {
        success: true,
        data: new FilledForm(this, result.data, options.parties, options.witnesses),
      }
    }
    return {
      success: false,
      error: new FormValidationError(result.errors),
    }
  }

  /**
   * Normalize fill data to FillOptions format.
   * Handles both new FillOptions format and legacy { fields: {...} } format.
   */
  private normalizeFillData(data: FillOptions | Record<string, unknown>): Required<Pick<FillOptions, 'fields'>> & Omit<FillOptions, 'fields'> {
    // If data has 'parties' or 'witnesses' at top level, it's FillOptions format
    if ('parties' in data || 'witnesses' in data) {
      const opts = data as FillOptions
      return {
        fields: opts.fields ?? {},
        annexes: opts.annexes,
        parties: opts.parties,
        witnesses: opts.witnesses,
      }
    }

    // If data has 'fields' at top level, it's the legacy format
    if ('fields' in data && typeof data.fields === 'object') {
      return {
        fields: data.fields as Record<string, unknown>,
        annexes: (data.annexes as Record<string, unknown>) ?? undefined,
      }
    }

    // Otherwise, treat the entire object as field data (backwards compatibility)
    return { fields: data as Record<string, unknown> }
  }
}

// ============================================================================
// FormBuilder - Fluent builder for creating forms
// ============================================================================

class FormBuilder<TFields extends Record<string, Field> = Record<string, never>> {
  private _def: Record<string, unknown> = {
    kind: 'form',
    name: '',
    version: '',
    title: '',
    description: undefined,
    code: undefined,
    releaseDate: undefined,
    metadata: {},
    logic: undefined,
    fields: undefined,
    layers: undefined,
    defaultLayer: undefined,
    annexes: undefined,
    allowAnnexes: undefined,
    parties: undefined,
    witnesses: undefined,
  }

  from(formValue: Form): this {
    const parsed = parseFormSchema(formValue)
    this._def = {
      kind: 'form',
      name: parsed.name,
      version: parsed.version,
      title: parsed.title,
      description: parsed.description,
      code: parsed.code,
      releaseDate: parsed.releaseDate,
      metadata: parsed.metadata ? { ...parsed.metadata } : {},
      logic: parsed.logic ? { ...parsed.logic } : undefined,
      fields: parsed.fields
        ? Object.fromEntries(
            Object.entries(parsed.fields).map(([id, field]) => [id, parseField(field)])
          )
        : undefined,
      layers: parsed.layers
        ? Object.fromEntries(
            Object.entries(parsed.layers).map(([key, layer]) => [key, parseLayer(layer)])
          )
        : undefined,
      defaultLayer: parsed.defaultLayer,
      annexes: parsed.annexes ? parsed.annexes.map((annexItem) => parseAnnex(annexItem)) : undefined,
      allowAnnexes: parsed.allowAnnexes,
      parties: parsed.parties ? parsed.parties.map((p) => parseFormParty(p)) : undefined,
      witnesses: parsed.witnesses ? parseWitnessRequirement(parsed.witnesses) : undefined,
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
   * Sets the logic section for this form.
   * Logic contains named expressions that can be referenced in field/annex conditions.
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

  field(id: string, fieldDef: Buildable<Field>): this {
    const fields = (this._def.fields as Record<string, Field>) || {}
    const resolved = resolveBuildable(fieldDef)
    fields[id] = parseField(resolved)
    this._def.fields = fields
    return this
  }

  fields<const F extends Record<string, Buildable<Field>>>(fieldsObj: F): FormBuilder<{
    [K in keyof F]: F[K] extends Buildable<infer T extends Field> ? T : F[K] extends Field ? F[K] : Field
  }> {
    const parsed: Record<string, Field> = {}
    for (const [id, fieldDef] of Object.entries(fieldsObj)) {
      parsed[id] = parseField(resolveBuildable(fieldDef as Buildable<Field>))
    }
    this._def.fields = parsed
    return this as unknown as FormBuilder<{
      [K in keyof F]: F[K] extends Buildable<infer T extends Field> ? T : F[K] extends Field ? F[K] : Field
    }>
  }

  /**
   * Sets the layers record for this form.
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

  annex(annexDef: Buildable<Annex>): this {
    const annexes = (this._def.annexes as Annex[]) || []
    annexes.push(parseAnnex(resolveBuildable(annexDef)))
    this._def.annexes = annexes
    return this
  }

  annexes(annexesArray: Array<Buildable<Annex>>): this {
    const parsed: Annex[] = []
    for (const annexDef of annexesArray) {
      parsed.push(parseAnnex(resolveBuildable(annexDef)))
    }
    this._def.annexes = parsed
    return this
  }

  metadata(value: Metadata | MetadataBuilder): this {
    const metadataValue = value instanceof MetadataBuilder ? value.build() : value
    this._def.metadata = metadataValue
    return this
  }

  allowAnnexes(value: boolean): this {
    this._def.allowAnnexes = value
    return this
  }

  /**
   * Add a single party role definition.
   * Party roles define who can be involved in the form and their signature requirements.
   */
  party(partyDef: Buildable<FormParty>): this {
    const parties = (this._def.parties as FormParty[]) || []
    parties.push(parseFormParty(resolveBuildable(partyDef)))
    this._def.parties = parties
    return this
  }

  /**
   * Set all party role definitions at once.
   * Party roles define who can be involved in the form and their signature requirements.
   */
  parties(partiesArray: Array<Buildable<FormParty>>): this {
    const parsed: FormParty[] = []
    for (const partyDef of partiesArray) {
      parsed.push(parseFormParty(resolveBuildable(partyDef)))
    }
    this._def.parties = parsed
    return this
  }

  /**
   * Set witness requirements for form execution.
   */
  witnesses(witnessReq: Buildable<WitnessRequirement>): this {
    this._def.witnesses = parseWitnessRequirement(resolveBuildable(witnessReq))
    return this
  }

  build(): FormInstance<Omit<Form, 'fields'> & { fields: TFields }> {
    // Clean up undefined optional fields before parsing
    const cleaned: Record<string, unknown> = { ...this._def }
    if (cleaned.fields === undefined) {
      delete cleaned.fields
    }
    if (cleaned.annexes === undefined) {
      delete cleaned.annexes
    }
    if (cleaned.layers === undefined) {
      delete cleaned.layers
    }
    if (cleaned.defaultLayer === undefined) {
      delete cleaned.defaultLayer
    }
    if (cleaned.description === undefined) {
      delete cleaned.description
    }
    if (cleaned.code === undefined) {
      delete cleaned.code
    }
    if (cleaned.releaseDate === undefined) {
      delete cleaned.releaseDate
    }
    if (cleaned.allowAnnexes === undefined) {
      delete cleaned.allowAnnexes
    }
    if (cleaned.logic === undefined) {
      delete cleaned.logic
    }
    if (cleaned.parties === undefined) {
      delete cleaned.parties
    }
    if (cleaned.witnesses === undefined) {
      delete cleaned.witnesses
    }
    const result = parseFormSchema(cleaned)
    return new FormInstance(result as Omit<Form, 'fields'> & { fields: TFields })
  }
}

// ============================================================================
// Form API
// ============================================================================

/**
 * Input type for open.form() - kind is optional since it's automatically added
 */
export type FormInput = Omit<Form, 'kind'> & { kind?: 'form' }

type FormAPI = {
  /** Start a fluent builder for creating a form */
  (): FormBuilder
  /** Create a FormInstance from a form definition object */
  <const T extends FormInput>(input: T): FormInstance<T & { kind: 'form' }>
  /** Parse unknown input into a FormInstance (throws on error) */
  from(input: unknown): FormInstance<Form>
  /** Safely parse unknown input into a FormInstance */
  safeFrom(input: unknown): { success: true; data: FormInstance<Form> } | { success: false; error: Error }
  /**
   * @deprecated Use `from()` instead. Will be removed in next major version.
   */
  parse(input: unknown): Form
  /**
   * @deprecated Use `safeFrom()` instead. Will be removed in next major version.
   */
  safeParse(input: unknown): { success: true; data: Form } | { success: false; error: Error }
}

function formImpl(): FormBuilder
function formImpl<const T extends FormInput>(input: T): FormInstance<T & { kind: 'form' }>
function formImpl<const T extends FormInput>(
  input?: T
): FormBuilder | FormInstance<T & { kind: 'form' }> {
  if (input !== undefined) {
    // Ensure kind is always 'form' (placed last to prevent override from input)
    const withKind = { ...input, kind: 'form' as const }
    const parsed = parseFormSchema(withKind) as T & { kind: 'form' }
    return new FormInstance(parsed)
  }
  return new FormBuilder()
}

export const form: FormAPI = Object.assign(formImpl, {
  // New API
  from: (input: unknown): FormInstance<Form> => {
    const parsed = parseFormSchema(input) as Form
    return new FormInstance(parsed)
  },
  safeFrom: (input: unknown): { success: true; data: FormInstance<Form> } | { success: false; error: Error } => {
    try {
      const parsed = parseFormSchema(input) as Form
      return {
        success: true,
        data: new FormInstance(parsed),
      }
    } catch (err) {
      return { success: false, error: err as Error }
    }
  },
  // Deprecated API (for backwards compatibility)
  parse: (input: unknown): Form => parseFormSchema(input) as Form,
  safeParse: (input: unknown): { success: true; data: Form } | { success: false; error: Error } => {
    try {
      return {
        success: true,
        data: parseFormSchema(input) as Form,
      }
    } catch (err) {
      return { success: false, error: err as Error }
    }
  },
})
