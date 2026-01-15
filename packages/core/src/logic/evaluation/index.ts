/**
 * Runtime expression evaluation module.
 *
 * This module provides functions for evaluating conditional expressions
 * (visible, required, disabled) at runtime with actual form data.
 *
 * @example
 * ```typescript
 * import { evaluateFormLogic, buildFormContext, evaluateBooleanExpression } from '@open-form/core'
 *
 * // Evaluate all form expressions at once
 * const result = evaluateFormLogic(form, { fields: { age: 25 } })
 * if ('value' in result) {
 *   const state = result.value
 *   console.log(state.fields.get('drivingLicense')?.visible) // true
 * }
 *
 * // Or build context and evaluate individual expressions
 * const context = buildFormContext(form, { fields: { age: 25 } })
 * const isVisible = evaluateBooleanExpression('fields.age.value >= 18', context, true)
 * ```
 */

// Types
export type {
  FieldRuntimeState,
  AnnexRuntimeState,
  FormRuntimeState,
  EvaluationContext,
  EvaluationOptions,
  ExpressionResult,
  EvaluationIssue,
  FormEvaluationResult,
  PartyContextEntry,
} from './types'

// Errors
export { ExpressionEvaluationError } from './errors'

// Expression evaluation
export {
  evaluateExpression,
  evaluateBooleanExpression,
  evaluateExpressionOrDefault,
  evaluateMultipleExpressions,
  isCondExpr,
} from './expression-evaluator'

// Context building
export {
  buildFormContext,
  getLogicValues,
  getFieldValueFromContext,
  type FormDataPayload,
} from './context-builder'

// Form evaluation
export {
  evaluateFormLogic,
  evaluateFieldStates,
  evaluateAnnexStates,
  getFieldRuntimeState,
  getAnnexRuntimeState,
  type FormEvaluationOptions,
} from './form-evaluator'
