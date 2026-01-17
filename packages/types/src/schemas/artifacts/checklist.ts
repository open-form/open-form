/**
 * Checklist artifact type definition
 */

import type { ArtifactBase, Layer } from "./common";

/**
 * Boolean checklist status specification.
 */
export interface BooleanStatusSpec {
  kind: "boolean";
  default?: boolean;
}

/**
 * Enumerated status option.
 */
export interface EnumStatusOption {
  value: string;
  label: string;
  description?: string;
}

/**
 * Enum-based checklist status specification.
 */
export interface EnumStatusSpec {
  kind: "enum";
  options: EnumStatusOption[];
  default?: string;
}

/**
 * Status specification definition for checklist items.
 */
export type StatusSpec = BooleanStatusSpec | EnumStatusSpec;

/**
 * Template-time checklist item definition.
 */
export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  status?: StatusSpec;
}

/**
 * Checklist artifact containing ordered items to track.
 */
export interface Checklist extends ArtifactBase {
  /** Literal `"checklist"` discriminator. */
  kind: "checklist";
  /** Ordered list of checklist items. */
  items: ChecklistItem[];
  /** Named layers for rendering this checklist into different formats. */
  layers?: Record<string, Layer>;
  /** Key of the default layer to use when none specified. */
  defaultLayer?: string;
}
