import type { Form, Party } from '@open-form/types'
import type { FormInstance, RenderOptions } from './builders/artifacts/form'
import type { InferFormPayload } from './utils'
import type { FormRuntimeState, FieldRuntimeState, AnnexRuntimeState } from './logic/evaluation'
import { evaluateFormLogic } from './logic/evaluation'
import { toYAML } from './serialization'

// ============================================================================
// FilledForm - Combines a form instance with validated data
// ============================================================================

/**
 * FilledForm wraps a form instance together with validated data.
 * The data is validated at construction time, so a FilledForm always
 * contains valid data.
 *
 * This class provides a convenient way to work with forms and their data
 * together, especially for rendering where the data is already known.
 *
 * @example
 * ```typescript
 * const form = open.form({
 *   name: 'example',
 *   version: '1.0.0',
 *   title: 'Example Form',
 *   fields: { name: { type: 'text', required: true } },
 *   templates: { html: { kind: 'inline', mimeType: 'text/html', text: 'Hello {{name}}' } },
 *   defaultTemplate: 'html',
 * })
 *
 * // Create a filled form (validates data)
 * const filled = form.fill({ name: 'John' })
 *
 * // Access data
 * console.log(filled.get('name'))  // 'John'
 * console.log(filled.getAll())     // { name: 'John' }
 *
 * // Check runtime state (expression evaluation)
 * console.log(filled.isFieldVisible('drivingLicense')) // based on expression evaluation
 * console.log(filled.isFieldRequired('drivingLicense')) // based on expression evaluation
 * console.log(filled.getLogicValue('isAdult')) // evaluated logic key value
 *
 * // Render without passing data
 * const output = await filled.render(textRenderer)
 *
 * // Mutate (returns new FilledForm)
 * const updated = filled.set('name', 'Jane')
 * const updated2 = filled.update({ name: 'Jane' })
 * ```
 */
export class FilledForm<F extends Form> {
  /**
   * The form instance this FilledForm is based on.
   */
  readonly form: FormInstance<F>

  /**
   * The validated data payload.
   */
  readonly data: InferFormPayload<F>

  /**
   * Party data indexed by role ID.
   * Single parties or arrays of parties depending on FormParty.multiple.
   */
  readonly parties: Record<string, Party | Party[]>

  /**
   * Witness data as an array of parties.
   */
  readonly witnesses: Party[]

  /**
   * Cached runtime state. Computed lazily on first access.
   * Since FilledForm is immutable (mutations return new instances),
   * this cache is automatically invalidated.
   */
  private _runtimeState: FormRuntimeState | null = null

  /**
   * Creates a new FilledForm with validated data.
   *
   * @param form - The form instance
   * @param data - The data payload (will be validated)
   * @param parties - Optional party data indexed by role ID
   * @param witnesses - Optional witness data
   * @throws FormValidationError if data validation fails
   */
  constructor(
    form: FormInstance<F>,
    data: InferFormPayload<F>,
    parties?: Record<string, Party | Party[]>,
    witnesses?: Party[]
  ) {
    this.form = form
    this.data = data
    this.parties = parties ?? {}
    this.witnesses = witnesses ?? []
  }

  // ============================================================================
  // Access Methods
  // ============================================================================

  /**
   * Get the value of a specific field.
   *
   * @param fieldId - The ID of the field to get
   * @returns The field value, or undefined if not set
   */
  get(fieldId: string): unknown {
    const data = this.data as { fields?: Record<string, unknown> }
    return data.fields?.[fieldId]
  }

  /**
   * Get all field values.
   *
   * @returns All field values as a record
   */
  getAll(): Record<string, unknown> {
    const data = this.data as { fields?: Record<string, unknown> }
    return data.fields ?? {}
  }

  /**
   * Always returns true since data is validated at construction.
   *
   * @returns true
   */
  isValid(): true {
    return true
  }

  // ============================================================================
  // Party Access Methods
  // ============================================================================

  /**
   * Get party/parties for a specific role.
   *
   * @param roleId - The role ID (e.g., 'buyer', 'seller')
   * @returns The party or array of parties, or undefined if role not filled
   */
  getParty(roleId: string): Party | Party[] | undefined {
    return this.parties[roleId]
  }

  /**
   * Get all parties for a role as an array (normalizes single to array).
   *
   * @param roleId - The role ID
   * @returns Array of parties for the role (empty if not filled)
   */
  getParties(roleId: string): Party[] {
    const p = this.parties[roleId]
    if (!p) return []
    return Array.isArray(p) ? p : [p]
  }

  /**
   * Get the count of parties for a role.
   *
   * @param roleId - The role ID
   * @returns Number of parties in this role
   */
  getPartyCount(roleId: string): number {
    return this.getParties(roleId).length
  }

  /**
   * Get the count of signed parties for a role.
   *
   * @param roleId - The role ID
   * @returns Number of parties that have signed
   */
  getSignedCount(roleId: string): number {
    return this.getParties(roleId).filter((p) => !!p.signature).length
  }

  /**
   * Check if all parties in a role have signed.
   *
   * @param roleId - The role ID
   * @returns true if all parties have signed, false otherwise
   */
  allSigned(roleId: string): boolean {
    const parties = this.getParties(roleId)
    if (parties.length === 0) return false
    return parties.every((p) => !!p.signature)
  }

  /**
   * Check if any party in a role has signed.
   *
   * @param roleId - The role ID
   * @returns true if at least one party has signed
   */
  anySigned(roleId: string): boolean {
    return this.getParties(roleId).some((p) => !!p.signature)
  }

  /**
   * Get the type of a party ('person' or 'organization').
   * For multi-party roles, returns the type of the first party.
   *
   * @param roleId - The role ID
   * @returns 'person', 'organization', or undefined if role not filled
   */
  getPartyType(roleId: string): 'person' | 'organization' | undefined {
    const parties = this.getParties(roleId)
    return parties[0]?.type
  }

  /**
   * Check if all required parties have signed.
   * Uses the form's party definitions to determine requirements.
   *
   * @returns true if all required parties have signed
   */
  isFullySigned(): boolean {
    const formParties = this.form.schema.parties
    if (!formParties || formParties.length === 0) return true

    for (const formParty of formParties) {
      if (formParty.signature?.required) {
        if (!this.allSigned(formParty.id)) {
          return false
        }
      }
    }
    return true
  }

  /**
   * Get signature status for each role.
   *
   * @returns Record mapping role ID to required/signed counts
   */
  getSignatureStatus(): Record<string, { required: number; signed: number }> {
    const formParties = this.form.schema.parties
    if (!formParties) return {}

    const status: Record<string, { required: number; signed: number }> = {}
    for (const formParty of formParties) {
      const parties = this.getParties(formParty.id)
      status[formParty.id] = {
        required: formParty.signature?.required ? parties.length : 0,
        signed: this.getSignedCount(formParty.id),
      }
    }
    return status
  }

  // ============================================================================
  // Runtime State (Expression Evaluation)
  // ============================================================================

  /**
   * Get the complete runtime state for all fields and annexes.
   * This evaluates all conditional expressions (visible, required, disabled)
   * based on the current data.
   *
   * The result is cached for performance - subsequent calls return the same object.
   *
   * @returns FormRuntimeState with evaluated states for all fields and annexes
   */
  get runtimeState(): FormRuntimeState {
    if (!this._runtimeState) {
      const result = evaluateFormLogic(this.form.schema, this.data as Record<string, unknown>)
      if ('value' in result) {
        this._runtimeState = result.value
      } else {
        // Evaluation failed - return empty state
        this._runtimeState = {
          fields: new Map(),
          annexes: new Map(),
          logicValues: new Map(),
        }
      }
    }
    return this._runtimeState
  }

  /**
   * Get the runtime state for a specific field.
   *
   * @param fieldId - The field ID (supports dot-notation for nested fields)
   * @returns FieldRuntimeState or undefined if field not found
   */
  getFieldState(fieldId: string): FieldRuntimeState | undefined {
    return this.runtimeState.fields.get(fieldId)
  }

  /**
   * Check if a field is visible based on expression evaluation.
   *
   * @param fieldId - The field ID
   * @returns true if visible, false if hidden or field not found
   */
  isFieldVisible(fieldId: string): boolean {
    return this.getFieldState(fieldId)?.visible ?? true
  }

  /**
   * Check if a field is required based on expression evaluation.
   *
   * @param fieldId - The field ID
   * @returns true if required, false if optional or field not found
   */
  isFieldRequired(fieldId: string): boolean {
    return this.getFieldState(fieldId)?.required ?? false
  }

  /**
   * Check if a field is disabled based on expression evaluation.
   *
   * @param fieldId - The field ID
   * @returns true if disabled, false if enabled or field not found
   */
  isFieldDisabled(fieldId: string): boolean {
    return this.getFieldState(fieldId)?.disabled ?? false
  }

  /**
   * Get all visible fields.
   *
   * @returns Array of FieldRuntimeState for visible fields only
   */
  getVisibleFields(): FieldRuntimeState[] {
    return Array.from(this.runtimeState.fields.values()).filter((f) => f.visible)
  }

  /**
   * Get all fields that are both visible and required.
   *
   * @returns Array of FieldRuntimeState for visible AND required fields
   */
  getRequiredVisibleFields(): FieldRuntimeState[] {
    return Array.from(this.runtimeState.fields.values()).filter((f) => f.visible && f.required)
  }

  /**
   * Get the runtime state for a specific annex.
   *
   * @param annexId - The annex ID
   * @returns AnnexRuntimeState or undefined if annex not found
   */
  getAnnexState(annexId: string): AnnexRuntimeState | undefined {
    return this.runtimeState.annexes.get(annexId)
  }

  /**
   * Check if an annex is visible based on expression evaluation.
   *
   * @param annexId - The annex ID
   * @returns true if visible, false if hidden or annex not found
   */
  isAnnexVisible(annexId: string): boolean {
    return this.getAnnexState(annexId)?.visible ?? true
  }

  /**
   * Check if an annex is required based on expression evaluation.
   *
   * @param annexId - The annex ID
   * @returns true if required, false if optional or annex not found
   */
  isAnnexRequired(annexId: string): boolean {
    return this.getAnnexState(annexId)?.required ?? false
  }

  /**
   * Get the value of an evaluated logic key.
   *
   * @param key - The logic key name
   * @returns The evaluated value, or undefined if key not found
   */
  getLogicValue(key: string): unknown {
    return this.runtimeState.logicValues.get(key)
  }

  // ============================================================================
  // Mutation Methods (Immutable - return new FilledForm)
  // ============================================================================

  /**
   * Create a new FilledForm with a single field updated.
   * The original FilledForm is not modified.
   *
   * @param fieldId - The ID of the field to update
   * @param value - The new value for the field
   * @returns A new FilledForm with the updated field
   * @throws FormValidationError if the updated data fails validation
   */
  set(fieldId: string, value: unknown): FilledForm<F> {
    const currentData = this.data as { fields?: Record<string, unknown>; annexes?: Record<string, unknown> }
    const newData = {
      fields: { ...currentData.fields, [fieldId]: value },
      ...(currentData.annexes ? { annexes: currentData.annexes } : {}),
    }
    // Re-validate with updated data
    const validated = this.form.parseData(newData as Record<string, unknown>)
    return new FilledForm(this.form, validated, this.parties, this.witnesses)
  }

  /**
   * Create a new FilledForm with multiple fields updated.
   * The original FilledForm is not modified.
   *
   * @param partial - Partial field data to merge with existing fields
   * @returns A new FilledForm with the updated fields
   * @throws FormValidationError if the updated data fails validation
   */
  update(partial: Record<string, unknown>): FilledForm<F> {
    const currentData = this.data as { fields?: Record<string, unknown>; annexes?: Record<string, unknown> }
    const newData = {
      fields: { ...currentData.fields, ...partial },
      ...(currentData.annexes ? { annexes: currentData.annexes } : {}),
    }
    // Re-validate with updated data
    const validated = this.form.parseData(newData as Record<string, unknown>)
    return new FilledForm(this.form, validated, this.parties, this.witnesses)
  }

  /**
   * Create a new FilledForm with updated party data.
   *
   * @param roleId - The role ID to update
   * @param party - The party or parties to set
   * @returns A new FilledForm with the updated party
   */
  setParty(roleId: string, party: Party | Party[]): FilledForm<F> {
    return new FilledForm(
      this.form,
      this.data,
      { ...this.parties, [roleId]: party },
      this.witnesses
    )
  }

  /**
   * Create a new FilledForm with updated witnesses.
   *
   * @param witnesses - The new witness list
   * @returns A new FilledForm with the updated witnesses
   */
  setWitnesses(witnesses: Party[]): FilledForm<F> {
    return new FilledForm(this.form, this.data, this.parties, witnesses)
  }

  /**
   * Create an exact copy of this FilledForm.
   *
   * @returns A new FilledForm with the same form and data
   */
  clone(): FilledForm<F> {
    return new FilledForm(
      this.form,
      structuredClone(this.data),
      structuredClone(this.parties),
      structuredClone(this.witnesses)
    )
  }

  // ============================================================================
  // Rendering
  // ============================================================================

  /**
   * Render this filled form with the given options.
   * The data is automatically provided from the FilledForm.
   *
   * @param options - Render options including renderer and resolver (data is provided by FilledForm)
   * @returns The rendered output
   *
   * @example
   * ```typescript
   * // With resolver (auto-loads file-backed layers)
   * const output = await filled.render({
   *   renderer: textRenderer,
   *   resolver,
   *   layer: 'markdown'
   * })
   *
   * // Inline layer (no resolver needed)
   * const output = await filled.render({
   *   renderer: textRenderer,
   *   layer: 'html'
   * })
   * ```
   */
  async render<Output>(options: Omit<RenderOptions<Output>, 'data'>): Promise<Output> {
    // Pass the whole data payload - form.render() will extract fields as needed
    return this.form.render({
      ...options,
      data: this.data as Record<string, unknown>,
    } as RenderOptions<Output>)
  }

  // ============================================================================
  // Serialization
  // ============================================================================

  /**
   * Serialize this FilledForm to a JSON-compatible object.
   *
   * @returns An object with form, data, parties, and witnesses properties
   */
  toJSON(): {
    form: F
    data: InferFormPayload<F>
    parties: Record<string, Party | Party[]>
    witnesses: Party[]
  } {
    return {
      form: this.form.schema,
      data: this.data,
      parties: this.parties,
      witnesses: this.witnesses,
    }
  }

  /**
   * Serialize this FilledForm to YAML.
   *
   * @returns YAML string representation
   */
  toYAML(): string {
    return toYAML(this.toJSON())
  }
}
