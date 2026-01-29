/**
 * Builds evaluation context from form definitions and data.
 *
 * The evaluation context structures field values and logic keys
 * in a format suitable for expression evaluation.
 */

import type {
  Form,
  FormField,
  FieldsetField,
  Party,
  Signature,
  LogicExpression,
  LogicSection,
  ScalarLogicType,
} from '@open-form/types'
import { inferPartyType } from '@/primitives/party'
import type { EvaluationContext, NestedFieldValues, PartyContextEntry } from './types'
import { topologicalSortLogicKeys } from '../../design-time/type-checking/build-type-environment'
import { evaluateExpressionOrDefault } from './expression-evaluator'

/** Scalar logic expression types (value is a string expression) */
const SCALAR_LOGIC_TYPES: Set<string> = new Set([
  'boolean',
  'string',
  'number',
  'integer',
  'percentage',
  'rating',
  'date',
  'time',
  'datetime',
  'duration',
])

/**
 * Check if a logic expression type is a scalar type.
 */
function isScalarLogicType(type: string): type is ScalarLogicType {
  return SCALAR_LOGIC_TYPES.has(type)
}

/**
 * Data payload structure (matches form data shape).
 */
export interface FormDataPayload {
  fields?: Record<string, unknown>
  annexes?: Record<string, unknown>
  parties?: Record<string, Party | Party[]>
  witnesses?: Party[]
  signatures?: Record<string, Signature | Signature[]>
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
  fields: Record<string, FormField> | undefined,
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
 * Party type is inferred from shape using inferPartyType.
 *
 * @param party - The party data
 * @param hasSigned - Whether the party has signed
 */
function partyToContextEntry(party: Party, hasSigned: boolean): PartyContextEntry {
  return {
    type: inferPartyType(party),
    data: party,
    signed: hasSigned,
  }
}

/**
 * Gets the signature count for a role.
 */
function getSignatureCount(
  signatures: Record<string, Signature | Signature[]> | undefined,
  roleId: string
): number {
  if (!signatures) return 0
  const s = signatures[roleId]
  if (!s) return 0
  return Array.isArray(s) ? s.length : 1
}

/**
 * Builds the parties context from party data.
 * Normalizes single parties to arrays for consistent access in expressions.
 *
 * @param parties - Party data indexed by role ID
 * @param signatures - Signatures indexed by role ID
 * @returns Parties context with arrays of PartyContextEntry
 */
function buildPartiesContext(
  parties: Record<string, Party | Party[]> | undefined,
  signatures: Record<string, Signature | Signature[]> | undefined
): Record<string, PartyContextEntry[]> {
  const result: Record<string, PartyContextEntry[]> = {}

  if (!parties) {
    return result
  }

  for (const [roleId, partyData] of Object.entries(parties)) {
    const sigCount = getSignatureCount(signatures, roleId)
    if (Array.isArray(partyData)) {
      // For multiple parties, mark as signed based on signature count
      result[roleId] = partyData.map((party, index) =>
        partyToContextEntry(party, index < sigCount)
      )
    } else {
      result[roleId] = [partyToContextEntry(partyData, sigCount > 0)]
    }
  }

  return result
}

/**
 * Builds the witnesses context from witness data.
 *
 * @param witnesses - Array of witness parties
 * @param witnessSignatures - Array of witness signatures
 * @returns Array of PartyContextEntry
 */
function buildWitnessesContext(
  witnesses: Party[] | undefined,
  witnessSignatures: Signature[] | undefined
): PartyContextEntry[] {
  if (!witnesses) {
    return []
  }
  const sigCount = witnessSignatures?.length ?? 0
  return witnesses.map((witness, index) =>
    partyToContextEntry(witness, index < sigCount)
  )
}

/**
 * Evaluates a single logic expression.
 *
 * For scalar types, evaluates the single expression string.
 * For object types, evaluates each property expression and constructs the result object.
 *
 * @param expr - The logic expression to evaluate
 * @param context - The evaluation context
 * @returns The evaluated value
 */
function evaluateLogicExpression(
  expr: LogicExpression,
  context: EvaluationContext
): unknown {
  if (isScalarLogicType(expr.type)) {
    // Scalar type: value is a single expression string
    return evaluateExpressionOrDefault(expr.value as string, context, undefined)
  }

  // Object type: value is an object with expression strings for each property
  const valueObj = expr.value as unknown as Record<string, string | undefined>
  const result: Record<string, unknown> = {}

  for (const [propKey, propExpr] of Object.entries(valueObj)) {
    if (propExpr !== undefined) {
      result[propKey] = evaluateExpressionOrDefault(propExpr, context, undefined)
    }
  }

  return result
}

/**
 * Extracts expression strings from a LogicSection for dependency sorting.
 *
 * For scalar types, returns the value directly.
 * For object types, concatenates all property expressions.
 *
 * @param logic - The logic section
 * @returns Record of key → expression string(s) for sorting
 */
function extractExpressionsForSorting(logic: LogicSection): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [key, expr] of Object.entries(logic)) {
    if (isScalarLogicType(expr.type)) {
      // Scalar: value is the expression string
      result[key] = expr.value as string
    } else {
      // Object: concatenate all property expressions for dependency detection
      // Use ' and ' as delimiter to create a valid parseable expression
      const valueObj = expr.value as unknown as Record<string, string | undefined>
      const allExprs = Object.values(valueObj).filter((v): v is string => v !== undefined)
      result[key] = allExprs.join(' and ')
    }
  }

  return result
}

/**
 * Evaluates logic keys in dependency order.
 *
 * Logic keys are evaluated in topological order so that if key A
 * depends on key B, B is evaluated first and available in the context.
 *
 * @param logic - Logic section from the form (key → LogicExpression)
 * @param baseContext - Context with field values (logic keys will be added)
 * @returns Map of logic key → evaluated value
 */
function evaluateLogicKeys(
  logic: LogicSection | undefined,
  baseContext: EvaluationContext
): Map<string, unknown> {
  const logicValues = new Map<string, unknown>()

  if (!logic || Object.keys(logic).length === 0) {
    return logicValues
  }

  // Extract expression strings for dependency sorting
  const expressionsForSorting = extractExpressionsForSorting(logic)

  // Sort logic keys in dependency order
  const { sorted: sortedKeys } = topologicalSortLogicKeys(expressionsForSorting)

  // Build up context incrementally as we evaluate
  const context: EvaluationContext = { ...baseContext }

  for (const key of sortedKeys) {
    const expr = logic[key]
    if (expr) {
      // Evaluate the expression with current context (includes previously evaluated keys)
      const value = evaluateLogicExpression(expr, context)
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
 *     isAdult: {
 *       type: 'boolean',
 *       value: 'fields.age.value >= 18'
 *     },
 *     hasBuyer: {
 *       type: 'boolean',
 *       value: 'partyCount("buyer") > 0'
 *     }
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

  // Build parties and witnesses context (with signatures)
  const parties = buildPartiesContext(data.parties, data.signatures)
  const witnesses = buildWitnessesContext(data.witnesses, undefined)

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
