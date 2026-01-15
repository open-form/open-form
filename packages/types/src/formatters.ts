/**
 * Formatter Registry Interface
 *
 * Defines the contract for formatting primitive types to strings.
 * This interface is implemented by locale/region-specific formatters.
 */

import type { Money, Address, Phone, Person, Organization } from './primitives.js'
import type { Party } from './party.js'

/**
 * Configuration options for creating locale and region-specific formatters.
 */
export interface FormatterConfig {
	/** Locale code (e.g., 'en-US', 'fr-FR', 'de-DE'). Currently 'en-US' is fully supported. */
	locale?: string
	/** Regional format preference. Determines address/phone formatting patterns. */
	regionFormat?: 'US' | 'EU' | 'intl'
}

/**
 * Registry of formatter functions for OpenForm primitive types.
 * Implement this interface to provide custom formatting logic.
 */
export interface FormatterRegistry {
	formatMoney(value: Money | number | Partial<Money>): string
	formatAddress(value: Address | Partial<Address>): string
	formatPhone(value: Phone | string | Partial<Phone> | { number?: string; countryCode?: string; extension?: string }): string
	formatPerson(value: Person | Partial<Person> | { fullName?: string; title?: string; firstName?: string; middleName?: string; lastName?: string; suffix?: string }): string
	formatOrganization(value: Organization | Partial<Organization> | { name?: string; ein?: string; email?: string; phone?: string }): string
	formatParty(value: Party | Partial<Party>): string
}
