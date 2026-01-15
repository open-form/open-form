// Re-export types from @open-form/types
export type {
	ArtifactBase,
	Form,
	Document,
	Checklist,
	ChecklistItem,
	StatusSpec,
	EnumStatusOption,
	Bundle,
	BundleContentItem,
	Layer,
	InlineLayer,
	FileLayer,
} from '@open-form/types';

// Re-export type guards from validators
export {
	isForm,
	isDocument,
	isBundle,
	isChecklist,
} from '@/validators';

// Re-export Artifact union type
import type { Form, Document, Checklist, Bundle } from '@open-form/types';
export type Artifact = Form | Document | Checklist | Bundle;

// Artifact kind type and utilities
export type ArtifactKind = 'form' | 'document' | 'checklist' | 'bundle';

/**
 * Get the kind of an artifact.
 * @param artifact - The artifact to check
 * @returns The artifact kind
 * @throws Error if artifact doesn't have a valid kind property
 */
export function getArtifactKind(artifact: { kind: unknown }): ArtifactKind {
	if (!artifact || typeof artifact !== 'object' || !('kind' in artifact)) {
		throw new Error('Invalid artifact: must be an object with a "kind" property');
	}

	const kind = artifact.kind;

	if (
		kind !== 'form' &&
		kind !== 'document' &&
		kind !== 'checklist' &&
		kind !== 'bundle'
	) {
		throw new Error(
			`Invalid artifact kind: ${kind}. Must be one of: form, document, checklist, bundle`,
		);
	}

	return kind;
}

/**
 * Check if a value has a valid artifact kind property.
 */
export function hasValidKind(value: unknown): value is { kind: ArtifactKind } {
	return (
		typeof value === 'object' &&
		value !== null &&
		'kind' in value &&
		typeof value.kind === 'string' &&
		['form', 'document', 'checklist', 'bundle'].includes(value.kind)
	);
}
