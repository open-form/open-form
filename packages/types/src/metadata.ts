/**
 * Custom metadata type for storing domain-specific data
 */

/**
 * Custom key-value pairs for storing domain-specific or organizational metadata.
 * Keys must be alphanumeric with hyphens, values can be strings, numbers, booleans, or null.
 */
export interface Metadata {
	[key: string]: string | number | boolean | null
}
