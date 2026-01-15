/**
 * Field formatters for OpenForm
 * Shared formatting utilities for money, address, phone, person, organization, and party fields
 */

import type { Money, Address, Phone, Person, Organization } from './primitives.js'
import type { Party } from './party.js'

// ============================================================================
// Formatters
// ============================================================================

export function formatMoney(value: Money | number | Partial<Money>): string {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  if (!value || typeof value !== 'object') {
    return ''
  }

  const amount = (value as Money).amount ?? 0
  const currency = (value as Money).currency || 'USD'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatAddress(value: Address | Partial<Address>): string {
  if (!value || typeof value !== 'object') {
    return ''
  }

  const parts: string[] = []

  if (value.line1) parts.push(value.line1)
  if (value.line2) parts.push(value.line2)

  const localityRegionZip: string[] = []
  if (value.locality) localityRegionZip.push(value.locality)
  if (value.region) localityRegionZip.push(value.region)
  if (value.postalCode) localityRegionZip.push(value.postalCode)

  if (localityRegionZip.length > 0) {
    parts.push(localityRegionZip.join(', '))
  }

  if (value.country) parts.push(value.country)

  return parts.join(', ')
}

export function formatPhone(
  value:
    | Phone
    | string
    | Partial<Phone>
    | { number?: string; countryCode?: string; extension?: string }
): string {
  if (typeof value === 'string') {
    // Simple formatting for string phone numbers
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    if (cleaned.length === 11) {
      return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    return value
  }

  if (!value || typeof value !== 'object') {
    return ''
  }

  const parts: string[] = []

  // Handle both schema format (number with + prefix) and legacy format (countryCode + number)
  const legacyPhone = value as { countryCode?: string }
  if (legacyPhone.countryCode) {
    parts.push(`+${legacyPhone.countryCode}`)
  }

  const phoneNumber = (value as Phone).number
  if (phoneNumber) {
    // If it's already E.164 format (starts with +), use it directly
    if (phoneNumber.startsWith('+')) {
      parts.push(phoneNumber)
    } else {
      // Otherwise, format it
      const cleaned = phoneNumber.replace(/\D/g, '')
      if (cleaned.length === 10) {
        parts.push(`(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`)
      } else {
        parts.push(phoneNumber)
      }
    }
  }

  if ((value as Phone).extension) {
    parts.push(`ext. ${(value as Phone).extension}`)
  }

  return parts.join(' ')
}

export function formatPerson(
  value:
    | Person
    | Partial<Person>
    | {
        fullName?: string
        title?: string
        firstName?: string
        middleName?: string
        lastName?: string
        suffix?: string
      }
): string {
  if (!value || typeof value !== 'object') {
    return ''
  }

  // If fullName is provided, use it directly (it's required in Person schema)
  if (value.fullName) {
    return value.fullName
  }

  // Otherwise, construct name from optional components
  const nameParts: string[] = []

  if (value.title) nameParts.push(value.title)
  if (value.firstName) nameParts.push(value.firstName)
  if (value.middleName) nameParts.push(value.middleName)
  if (value.lastName) nameParts.push(value.lastName)
  if (value.suffix) nameParts.push(value.suffix)

  return nameParts.join(' ')
}

export function formatOrganization(
  value:
    | Organization
    | Partial<Organization>
    | { name?: string; ein?: string; email?: string; phone?: string }
): string {
  if (!value || typeof value !== 'object') {
    return ''
  }

  const parts: string[] = []

  if ((value as Organization).name) parts.push((value as Organization).name)

  const details: string[] = []
  if ((value as Organization).taxId) details.push(`Tax ID: ${(value as Organization).taxId}`)

  if (details.length > 0) {
    parts.push(`(${details.join(', ')})`)
  }

  return parts.join(' ')
}

export function formatParty(value: Party | Partial<Party>): string {
  if (!value || typeof value !== 'object') {
    return ''
  }

  // Party is a union of Person | Organization, so handle both
  if ('firstName' in value || 'lastName' in value) {
    return formatPerson(value as Person | Partial<Person>)
  }

  if ('name' in value && !('firstName' in value)) {
    return formatOrganization(value as Organization | Partial<Organization>)
  }

  return ''
}
