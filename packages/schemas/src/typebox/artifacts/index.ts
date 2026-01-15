export { ArtifactSchema } from './artifact';
export { FormSchema } from './form';
export { DocumentSchema } from './document';
export { ChecklistSchema, ChecklistItemSchema } from './checklist';
export { BundleSchema, BundleContentItemSchema } from './bundle';

export {
	isForm,
	isDocument,
	isChecklist,
	isBundle,
	getArtifactKind,
	hasValidKind,
	type ArtifactKind,
} from './guards';
