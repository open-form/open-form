/**
 * Artifact type definitions for OpenForm
 * Includes Document, Bundle, and Checklist artifacts
 */

import type { CondExpr, LogicSection } from './logic.js'
import type { ArtifactBase, Layer } from './form.js'

// ============================================================================
// Document
// ============================================================================

/**
 * Document artifact — static content with no inputs.
 * Documents are used for disclosures, pamphlets, or any static content
 * that can be rendered to different formats via layers.
 */
export interface Document extends ArtifactBase {
	/** Literal `"document"` discriminator. */
	kind: 'document'
	/** Named layers for rendering this document into different formats. */
	layers?: Record<string, Layer>
	/** Key of the default layer to use when none specified. */
	defaultLayer?: string
}

// ============================================================================
// Checklist
// ============================================================================

/** Boolean checklist status specification. */
interface BooleanStatusSpec {
	kind: 'boolean'
	default?: boolean
}

/** Enumerated status option. */
export interface EnumStatusOption {
	value: string
	label: string
	description?: string
}

/** Enum-based checklist status specification. */
interface EnumStatusSpec {
	kind: 'enum'
	options: EnumStatusOption[]
	default?: string
}

/** Status specification definition for checklist items. */
export type StatusSpec = BooleanStatusSpec | EnumStatusSpec

/** Template-time checklist item definition. */
export interface ChecklistItem {
	id: string
	title: string
	description?: string
	status?: StatusSpec
}

/**
 * Checklist artifact containing ordered items to track.
 */
export interface Checklist extends ArtifactBase {
	/** Literal `"checklist"` discriminator. */
	kind: 'checklist'
	/** Ordered list of checklist items. */
	items: ChecklistItem[]
	/** Named layers for rendering this checklist into different formats. */
	layers?: Record<string, Layer>
	/** Key of the default layer to use when none specified. */
	defaultLayer?: string
}

// ============================================================================
// Bundle
// ============================================================================

import type { Form } from './form.js'

/** Bundle content item — inline artifact, path reference, or registry reference. */
export type BundleContentItem =
	| { type: 'inline'; key: string; artifact: Document | Form | Checklist | Bundle }
	| { type: 'path'; key: string; path: string; include?: CondExpr }
	| { type: 'registry'; key: string; slug: string; include?: CondExpr }

/**
 * Bundle artifact — a recursive container for content artifacts.
 * Bundles group together documents, forms, checklists, and other bundles
 * into a single distributable unit.
 */
export interface Bundle extends ArtifactBase {
	/** Literal `"bundle"` discriminator. */
	kind: 'bundle'
	/** Named logic expressions that can be referenced in include conditions. */
	logic?: LogicSection
	/** Ordered list of bundle contents with keys. */
	contents: BundleContentItem[]
}

// ============================================================================
// Bindings (still used by layers)
// ============================================================================

/** Mapping from form field names to layer target identifiers. */
export type Bindings = Record<string, string>

// ============================================================================
// Artifact Union
// ============================================================================

/** Any supported artifact type. */
export type Artifact = Form | Document | Checklist | Bundle

/**
 * Root OpenForm payload type - union of all artifact types.
 * This represents the top-level structure of any OpenForm document.
 */
export type OpenFormPayload = Form | Document | Checklist | Bundle
