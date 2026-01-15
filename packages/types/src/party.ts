/**
 * Party types for identifying people and organizations in artifacts
 */

import type { Person } from './primitives.js'
import type { Organization } from './primitives.js'

/** Base party fields shared between person/organization parties. */
interface PartyBase {
	/** Optional signature reference (image URI, ID, etc.). */
	signature?: string
}

/**
 * Individual person party.
 */
export interface PartyPerson extends Person, PartyBase {
	type: 'person'
}

/**
 * Organization party.
 */
export interface PartyOrganization extends Organization, PartyBase {
	type: 'organization'
}

/**
 * Party definition used in artifacts (either person or organization).
 */
export type Party = PartyPerson | PartyOrganization
