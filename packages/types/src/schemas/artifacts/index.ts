/**
 * Artifact types for OpenForm
 * Includes Document, Form, Checklist, and Bundle artifacts
 */

export type {
  ArtifactBase,
  Layer,
  InlineLayer,
  FileLayer,
  Bindings,
} from "./common";

export type { Document } from "./document";

export type {
  BooleanStatusSpec,
  EnumStatusOption,
  EnumStatusSpec,
  StatusSpec,
  ChecklistItem,
  Checklist,
} from "./checklist";

export type { BundleContentItem, Bundle } from "./bundle";

export type {
  Fieldset,
  Annex,
  SignatureRequirement,
  FormParty,
  WitnessRequirement,
  Form,
} from "./form";

// Union types
export type { Artifact, OpenFormPayload } from "./unions";
