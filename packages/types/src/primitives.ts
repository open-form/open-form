/**
 * Core primitive/data types used across the OpenForm framework
 */

/**
 * Monetary amount paired with ISO 4217 currency code.
 */
export interface Money {
	/** Amount expressed in decimal form (supports negative values). */
	amount: number
	/** ISO 4217 alpha-3 currency code (e.g., USD, EUR). */
	currency: string
}

/**
 * Postal address with street, locality, region, postal code, and country.
 */
export interface Address {
	/** Primary address line (street address, PO box, company name). */
	line1: string
	/** Secondary address line (apartment, suite, unit, building). */
	line2?: string
	/** City, town, or locality. */
	locality: string
	/** State, province, or region. */
	region: string
	/** Postal or ZIP code. */
	postalCode: string
	/** ISO country code or full country name. */
	country: string
}

/**
 * Phone number in E.164 format with optional type/extension.
 */
export interface Phone {
	/** Phone number in international E.164 format (e.g., +14155552671). */
	number: string
	/** Category/usage of the number (mobile, work, home, etc.). */
	type?: string
	/** Optional extension digits. */
	extension?: string
}

/**
 * Person name information with required `fullName` and optional components.
 */
export interface Person {
	/** Full name as a single string. */
	fullName: string
	/** Optional prefix or honorific (Mr., Dr., etc.). */
	title?: string
	/** First/given name. */
	firstName?: string
	/** Middle name or initial. */
	middleName?: string
	/** Last/family name. */
	lastName?: string
	/** Suffix (Jr., Sr., III, etc.). */
	suffix?: string
}

/**
 * Organization identity with legal and registration details.
 */
export interface Organization {
	/** Common or trade name. */
	name: string
	/** Registered/legal name. */
	legalName?: string
	/** Country/region of domicile. */
	domicile?: string
	/** Legal entity type (corporation, LLC, etc.). */
	entityType?: string
	/** Business identification number. */
	entityId?: string
	/** Tax identification number. */
	taxId?: string
}

/**
 * Geographic coordinate in WGS84 with latitude/longitude in decimal degrees.
 */
export interface Coordinate {
	/** Latitude in decimal degrees, range -90 to 90. */
	lat: number
	/** Longitude in decimal degrees, range -180 to 180. */
	lon: number
}

/**
 * Geographic bounding box defined by southwest (minimum) and northeast (maximum) coordinates.
 */
export interface Bbox {
	/** Southwest corner coordinate, representing minimum latitude/longitude. */
	southWest: Coordinate
	/** Northeast corner coordinate, representing maximum latitude/longitude. */
	northEast: Coordinate
}

/**
 * ISO 8601 duration string (e.g., `P1Y`, `PT30M`, `P1DT12H`).
 */
export type Duration = string

/**
 * Identification document details (e.g., passport, SSN, driver's license).
 */
export interface Identification {
	/** Identification type (passport, ssn, license, etc.). */
	type: string
	/** Document/identifier number. */
	number: string
	/** Issuing authority, country, or state. */
	issuer?: string
	/** Issue date in ISO 8601 format (YYYY-MM-DD). */
	issueDate?: string
	/** Expiration date in ISO 8601 format (YYYY-MM-DD). */
	expiryDate?: string
}
