/**
 * Person serializer - validator for person information
 */

import { isObject } from '../utils'

/**
 * Validate Person object. Throws error if invalid.
 */
export function validatePerson(value: unknown): void {
	if (!isObject(value)) {
		throw new TypeError('Invalid person: must be a Person object')
	}
	const person = value as Record<string, unknown>
	const hasName = !!(person.fullName || person.firstName || person.lastName)
	if (!hasName) {
		throw new Error('Invalid person: must have at least one name field (fullName, firstName, or lastName)')
	}
}
