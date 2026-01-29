/**
 * Logic section type for named computed values
 */

import type { LogicExpression } from "./logic-expression";

/**
 * Logic section for named computed values with type information.
 * Keys are expression names, values are typed logic expressions.
 */
export interface LogicSection {
  /** Named computed values that can be referenced in expressions. */
  [key: string]: LogicExpression;
}
