/**
 * Duration serializer - validator and stringifier for ISO 8601 durations
 */

import type { Duration } from '@open-form/types'

/**
 * Validate Duration string. Throws error if invalid.
 * ISO 8601 duration format: P[n]Y[n]M[n]DT[n]H[n]M[n]S
 */
export function validateDuration(value: unknown): void {
	if (typeof value !== 'string') {
		throw new TypeError(`Invalid duration: must be a string, got ${typeof value}`)
	}
	if (value === '') {
		throw new Error('Invalid duration: cannot be empty')
	}
	// Basic ISO 8601 format check
	if (!value.startsWith('P')) {
		throw new Error('Invalid duration: must start with "P" (e.g., "P1Y", "PT30M", "P1DT12H")')
	}
}

/**
 * Duration stringifier - reusable across all locales
 */
export const durationStringifier = {
	stringify(value: Duration | string, fallback = ''): string {
		if (value == null) return fallback

		validateDuration(value)

		return value as string
	},
}
