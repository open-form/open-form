/**
 * Artifact union types
 */

import type { Document } from "./document";
import type { Form } from "./form";
import type { Checklist } from "./checklist";
import type { Bundle } from "./bundle";

/**
 * Any supported artifact type.
 */
export type Artifact = Form | Document | Checklist | Bundle;

/**
 * Root OpenForm payload type - union of all artifact types.
 * This represents the top-level structure of any OpenForm document.
 */
export type OpenFormPayload = Form | Document | Checklist | Bundle;
