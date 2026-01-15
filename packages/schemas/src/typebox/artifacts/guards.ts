// Note: Type imports from @open-form/types will be added after types package is updated in Phase 2
// For now, we use 'unknown' and runtime checks

/**
 * Type guard to check if an artifact is a Form.
 */
export function isForm(artifact: unknown): artifact is { kind: 'form' } {
	return (
		typeof artifact === 'object' &&
		artifact !== null &&
		'kind' in artifact &&
		artifact.kind === 'form'
	);
}

/**
 * Type guard to check if an artifact is a Document.
 */
export function isDocument(artifact: unknown): artifact is { kind: 'document' } {
	return (
		typeof artifact === 'object' &&
		artifact !== null &&
		'kind' in artifact &&
		artifact.kind === 'document'
	);
}

/**
 * Type guard to check if an artifact is a Checklist.
 */
export function isChecklist(artifact: unknown): artifact is { kind: 'checklist' } {
	return (
		typeof artifact === 'object' &&
		artifact !== null &&
		'kind' in artifact &&
		artifact.kind === 'checklist'
	);
}

/**
 * Type guard to check if an artifact is a Bundle.
 */
export function isBundle(artifact: unknown): artifact is { kind: 'bundle' } {
	return (
		typeof artifact === 'object' &&
		artifact !== null &&
		'kind' in artifact &&
		artifact.kind === 'bundle'
	);
}

/**
 * Type for all artifact kinds.
 */
export type ArtifactKind = 'form' | 'document' | 'checklist' | 'bundle';

/**
 * Get the kind of an artifact.
 * @param artifact - The artifact to check
 * @returns The artifact kind
 * @throws Error if artifact doesn't have a valid kind property
 */
export function getArtifactKind(artifact: unknown): ArtifactKind {
	if (!artifact || typeof artifact !== 'object' || !('kind' in artifact)) {
		throw new Error(
			'Invalid artifact: must be an object with a "kind" property',
		);
	}

	const kind = (artifact as { kind: unknown }).kind;

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
