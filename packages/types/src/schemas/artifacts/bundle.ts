/**
 * Bundle artifact type definition
 */

import type { CondExpr, LogicSection } from "../logic";
import type { ArtifactBase } from "./common.js";
import type { Document } from "./document.js";
import type { Form } from "./form.js";
import type { Checklist } from "./checklist.js";

/**
 * Bundle content item — inline artifact, path reference, or registry reference.
 */
export type BundleContentItem =
  | {
      type: "inline";
      key: string;
      artifact: Document | Form | Checklist | Bundle;
    }
  | { type: "path"; key: string; path: string; include?: CondExpr }
  | { type: "registry"; key: string; slug: string; include?: CondExpr };

/**
 * Bundle artifact — a recursive container for content artifacts.
 * Bundles group together documents, forms, checklists, and other bundles
 * into a single distributable unit.
 */
export interface Bundle extends ArtifactBase {
  /** Literal `"bundle"` discriminator. */
  kind: "bundle";
  /** Named logic expressions that can be referenced in include conditions. */
  logic?: LogicSection;
  /** Ordered list of bundle contents with keys. */
  contents: BundleContentItem[];
}
