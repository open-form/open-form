// Re-export types from @open-form/types
// Note: TypeBox schemas are no longer exported from @open-form/schemas
// Use extractSchema() from '@/schemas/extract' to get JSON schemas from the bundled schema
export type {
	Coordinate,
	Address,
	Phone,
	Money,
	Duration,
	Person,
	Organization,
	Identification,
	Bbox,
	Metadata,
} from '@open-form/types';
