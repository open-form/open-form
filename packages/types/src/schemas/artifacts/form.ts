/**
 * Form artifact type definition and form-specific structures
 */

import type { LogicSection } from "../logic";
import type { Field } from "../blocks";
import type { ArtifactBase, Layer } from "./common.js";

/**
 * Logical grouping of fields rendered together.
 * This is a standalone block type (not a field type).
 */
export interface Fieldset {
  /** Fieldset identifier (slug). */
  id: string;
  /** Optional title/heading. */
  title?: string;
  /** Optional description/help text. */
  description?: string;
  /** Map of field identifiers to field definitions. */
  fields: Record<string, Field>;
  /** Whether completion of the entire fieldset is required. */
  required?: boolean;
  /** Display order hint (lower numbers first). */
  order?: number;
}

/**
 * Annex slot for supplementary documents
 */
export interface Annex {
  /** Unique annex identifier (slug format). */
  id: string;
  /** Title or heading for the annex slot. */
  title: string;
  /** Description of what document should be attached. */
  description?: string;
  /** Whether this annex slot must be filled at runtime. Can be a boolean or expression. */
  required?: boolean | string;
  /** Whether this annex is visible. Can be a boolean or expression. Defaults to true. */
  visible?: boolean | string;
}

/**
 * Signature requirements for a party role.
 */
export interface SignatureRequirement {
  /** Whether signature is required for this role. */
  required: boolean;
  /** Type of signature accepted. */
  type?: "electronic" | "wet" | "any";
  /** Signing order (1 = first signer). */
  order?: number;
}

/**
 * Design-time party role definition.
 * Defines what roles exist and what constraints apply when filling a form.
 */
export interface FormParty {
  /** Human-readable role name. */
  label: string;
  /** Description of this role. */
  description?: string;
  /** Constraint on party type (person, organization, or any). */
  partyType?: "person" | "organization" | "any";
  /** Whether multiple parties can fill this role. */
  multiple?: boolean;
  /** Minimum parties required (when multiple=true). */
  min?: number;
  /** Maximum parties allowed (when multiple=true). */
  max?: number;
  /** Whether this role is required. Can be boolean or expression. */
  required?: boolean | string;
  /** Signature requirements for this role. */
  signature?: SignatureRequirement;
}

/**
 * Witness requirements for form execution.
 */
export interface WitnessRequirement {
  /** Whether witnesses are required. */
  required: boolean;
  /** Minimum number of witnesses required. */
  min?: number;
  /** Maximum number of witnesses allowed. */
  max?: number;
  /** Whether witnesses must be notarized. */
  notarized?: boolean;
}

/**
 * Form artifact definition including fields, optional layers, annexes, and party roles.
 */
export interface Form extends ArtifactBase {
  /** Literal `"form"` discriminator. */
  kind: "form";
  /** Named logic expressions that can be referenced in field/annex conditions. */
  logic?: LogicSection;
  /** Field definitions keyed by identifier. */
  fields?: Record<string, Field>;
  /** Named layers for rendering this form into different formats. */
  layers?: Record<string, Layer>;
  /** Key of the default layer to use when none specified. */
  defaultLayer?: string;
  /** Whether additional ad-hoc annexes can be attached beyond defined slots. */
  allowAnnexes?: boolean;
  /** Predefined annex slots (some required, some optional). */
  annexes?: Annex[];
  /** Party role definitions keyed by role identifier, with constraints and signature requirements. */
  parties?: Record<string, FormParty>;
  /** Witness requirements for form execution. */
  witnesses?: WitnessRequirement;
}
