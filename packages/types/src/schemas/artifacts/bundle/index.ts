/**
 * Bundle artifact type definition
 */

import type { LogicSection } from "../shared/logic";
import type { ArtifactBase } from "../shared";
import type { BundleContentItem } from "./item";

/**
 * Bundle artifact - a recursive container for content artifacts.
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

export type {
  BundleContentItem,
  InlineBundleItem,
  PathBundleItem,
  RegistryBundleItem,
} from "./item";
