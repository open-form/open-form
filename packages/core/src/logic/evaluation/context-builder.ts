/**
 * Builds evaluation context from form definitions and data.
 *
 * The evaluation context structures field values and logic keys
 * in a format suitable for expression evaluation.
 */

import type { Form, Field, FieldsetField, Party } from '@open-form/types'
import type { EvaluationContext, NestedFieldValues, PartyContextEntry } from './types'
import { topologicalSortLogicKeys } from '../types/build-type-environment'
import { evaluateExpressionOrDefault } from './expression-evaluator'

/**
 * Data payload structure (matches form data shape).
 */
export interface FormDataPayload {
  fields?: Record<string, unknown>
  annexes?: Record<string, unknown>
  parties?: Record<string, Party | Party[]>
  witnesses?: Party[]
}

/**
 * Recursively builds the fields context structure from flat field data.
 *
 * Handles nested fieldsets by creating nested objects:
 * - Simple field: { age: { value: 25 } }
 * - Fieldset: { address: { street: { value: '123 Main' }, city: { value: 'NYC' } } }
 *
 * @param fields - Field definitions from the form
 * @param data - Flat field data (may have dot-notation keys or nested objects)
 * @returns Structured field values object
 */
function buildFieldsContext(
  fields: Record<string, Field> | undefined,
  data: Record<string, unknown> | undefined
): NestedFieldValues {
  const result: NestedFieldValues = {}

  if (!fields || !data) {
    return result
  }

  for (const [fieldId, field] of Object.entries(fields)) {
    if (field.type === 'fieldset') {
      // Fieldset: recursively build nested context
      const fieldset = field as FieldsetField
      const nestedData = data[fieldId]

      if (typeof nestedData === 'object' && nestedData !== null) {
        // Nested object data
        result[fieldId] = buildFieldsContext(fieldset.fields, nestedData as Record<string, unknown>)
      } else {
        // Try dot-notation keys in flat data
        const flatNestedData: Record<string, unknown> = {}
        const dotPrefix = `${fieldId}.`
        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith(dotPrefix)) {
            flatNestedData[key.slice(dotPrefix.length)] = value
          }
        }
        result[fieldId] = buildFieldsContext(fieldset.fields, flatNestedData)
      }
    } else {
      // Simple field: wrap value
      const value = data[fieldId]
      result[fieldId] = { value }
    }
  }

  return result
}

/**
 * Converts a Party to a PartyContextEntry for evaluation.
 */
function partyToContextEntry(party: Party): PartyContextEntry {
  return {
    type: party.type,
    data: party,
    signed: !!party.signature,
  }
}

/**
 * Builds the parties context from party data.
 * Normalizes single parties to arrays for consistent access in expressions.
 *
 * @param parties - Party data indexed by role ID
 * @returns Parties context with arrays of PartyContextEntry
 */
function buildPartiesContext(
  parties: Record<string, Party | Party[]> | undefined
): Record<string, PartyContextEntry[]> {
  const result: Record<string, PartyContextEntry[]> = {}

  if (!parties) {
    return result
  }

  for (const [roleId, partyData] of Object.entries(parties)) {
    if (Array.isArray(partyData)) {
      result[roleId] = partyData.map(partyToContextEntry)
    } else {
      result[roleId] = [partyToContextEntry(partyData)]
    }
  }

  return result
}

/**
 * Builds the witnesses context from witness data.
 *
 * @param witnesses - Array of witness parties
 * @returns Array of PartyContextEntry
 */
function buildWitnessesContext(witnesses: Party[] | undefined): PartyContextEntry[] {
  if (!witnesses) {
    return []
  }
  return witnesses.map(partyToContextEntry)
}

/**
 * Evaluates logic keys in dependency order.
 *
 * Logic keys are evaluated in topological order so that if key A
 * depends on key B, B is evaluated first and available in the context.
 *
 * @param logic - Logic section from the form (key → expression)
 * @param baseContext - Context with field values (logic keys will be added)
 * @returns Map of logic key → evaluated value
 */
function evaluateLogicKeys(
  logic: Record<string, string> | undefined,
  baseContext: EvaluationContext
): Map<string, unknown> {
  const logicValues = new Map<string, unknown>()

  if (!logic || Object.keys(logic).length === 0) {
    return logicValues
  }

  // Sort logic keys in dependency order
  const { sorted: sortedKeys } = topologicalSortLogicKeys(logic)

  // Build up context incrementally as we evaluate
  const context: EvaluationContext = { ...baseContext }

  for (const key of sortedKeys) {
    const expr = logic[key]
    if (expr) {
      // Evaluate the expression with current context (includes previously evaluated keys)
      const value = evaluateExpressionOrDefault(expr, context, undefined)
      logicValues.set(key, value)
      // Add to context for subsequent evaluations
      ;(context as Record<string, unknown>)[key] = value
    }
  }

  return logicValues
}

/**
 * Builds an evaluation context from a Form and data payload.
 *
 * The context has the structure:
 * ```typescript
 * {
 *   fields: {
 *     age: { value: 25 },
 *     name: { value: 'John' },
 *     address: { // fieldset
 *       street: { value: '123 Main' },
 *       city: { value: 'NYC' }
 *     }
 *   },
 *   parties: {
 *     buyer: [{ type: 'person', data: {...}, signed: false }],
 *     seller: [{ type: 'organization', data: {...}, signed: true }],
 *   },
 *   witnesses: [{ type: 'person', data: {...}, signed: true }],
 *   isAdult: true,        // evaluated logic key
 *   hasLicense: false,    // evaluated logic key
 * }
 * ```
 *
 * @param form - The Form artifact
 * @param data - The data payload with field values, parties, and witnesses
 * @returns EvaluationContext ready for expression evaluation
 *
 * @example
 * ```typescript
 * const form = {
 *   kind: 'form',
 *   name: 'test',
 *   version: '1.0',
 *   title: 'Test',
 *   fields: {
 *     age: { type: 'number' },
 *     name: { type: 'text' }
 *   },
 *   parties: [{ id: 'buyer', label: 'Buyer' }],
 *   logic: {
 *     isAdult: 'fields.age.value >= 18',
 *     hasBuyer: 'partyCount("buyer") > 0'
 *   }
 * }
 *
 * const data = {
 *   fields: { age: 25, name: 'John' },
 *   parties: { buyer: { type: 'person', fullName: 'John' } }
 * }
 * const context = buildFormContext(form, data)
 *
 * // context.fields.age.value === 25
 * // context.parties.buyer[0].type === 'person'
 * // context.isAdult === true
 * ```
 */
export function buildFormContext(form: Form, data: FormDataPayload): EvaluationContext {
  // Build fields context structure
  const fields = buildFieldsContext(form.fields, data.fields)

  // Build parties and witnesses context
  const parties = buildPartiesContext(data.parties)
  const witnesses = buildWitnessesContext(data.witnesses)

  // Create base context with fields, parties, and witnesses
  const baseContext: EvaluationContext = { fields, parties, witnesses }

  // Evaluate logic keys and add to context
  const logicValues = evaluateLogicKeys(form.logic, baseContext)

  // Merge logic keys into context
  const context: EvaluationContext = { fields, parties, witnesses }
  for (const [key, value] of logicValues) {
    ;(context as Record<string, unknown>)[key] = value
  }

  return context
}

/**
 * Gets the logic values map from a form and data.
 *
 * This is useful when you need access to the evaluated logic values
 * as a Map for iteration or checking specific keys.
 *
 * @param form - The Form artifact
 * @param data - The data payload
 * @returns Map of logic key → evaluated value
 */
export function getLogicValues(form: Form, data: FormDataPayload): Map<string, unknown> {
  const fields = buildFieldsContext(form.fields, data.fields)
  const parties = buildPartiesContext(data.parties)
  const witnesses = buildWitnessesContext(data.witnesses)
  const baseContext: EvaluationContext = { fields, parties, witnesses }
  return evaluateLogicKeys(form.logic, baseContext)
}

/**
 * Gets the value at a field path from structured fields context.
 *
 * @param fields - The fields context structure
 * @param path - Dot-notation path (e.g., 'address.street')
 * @returns The value at the path, or undefined if not found
 */
export function getFieldValueFromContext(fields: NestedFieldValues, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = fields

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }
    if (typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }

  // If we landed on a { value: ... } object, extract the value
  if (current !== null && typeof current === 'object' && 'value' in (current as object)) {
    return (current as { value: unknown }).value
  }

  return current
}
