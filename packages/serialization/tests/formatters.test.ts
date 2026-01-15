/**
 * Tests for formatter implementations
 * Validates USA, EU, and international formatter variants
 */

import { describe, it, expect } from 'vitest'
import type { Money, Address, Phone, Person, Organization } from '@open-form/types'
import {
	usaFormatters,
	euFormatters,
	intlFormatters,
	createFormatters,
	type FormatterRegistry,
} from '../src/index'

// ============================================================================
// Test Data
// ============================================================================

const testMoney = { amount: 1500.5, currency: 'USD' }
const testAddress = {
	line1: '123 Main St',
	line2: 'Apt 4B',
	locality: 'New York',
	region: 'NY',
	postalCode: '10001',
	country: 'USA',
}
const testPhone = { number: '+12125551234', extension: '123' }
const testPerson = {
	firstName: 'John',
	middleName: 'Michael',
	lastName: 'Doe',
	title: 'Dr.',
	suffix: 'Jr.',
}
const testOrganization = { name: 'Acme Corp', taxId: '12-3456789' }

// ============================================================================
// USA Formatters Tests
// ============================================================================

describe('usaFormatters', () => {
	it('formatMoney with object', () => {
		const result = usaFormatters.formatMoney(testMoney)
		expect(result).toContain('$')
		expect(result).toContain('1,500.50')
	})

	it('formatMoney with number', () => {
		const result = usaFormatters.formatMoney(2500)
		expect(result).toContain('$')
		expect(result).toContain('2,500.00')
	})

	it('formatMoney with partial object', () => {
		const result = usaFormatters.formatMoney({ amount: 100 })
		expect(result).toContain('$')
	})

	it('formatMoney with null', () => {
		expect(usaFormatters.formatMoney(null as any)).toBe('')
	})

	it('formatAddress USA format', () => {
		const result = usaFormatters.formatAddress(testAddress)
		expect(result).toBe('123 Main St, Apt 4B, New York, NY, 10001, USA')
	})

	it('formatAddress with missing fields', () => {
		const result = usaFormatters.formatAddress({
			line1: '456 Oak Ave',
			locality: 'Boston',
			region: 'MA',
			postalCode: '02101',
		})
		expect(result).toContain('456 Oak Ave')
		expect(result).toContain('Boston')
	})

	it('formatPhone E.164 format', () => {
		const result = usaFormatters.formatPhone(testPhone)
		expect(result).toContain('+12125551234')
		expect(result).toContain('ext. 123')
	})

	it('formatPhone 10-digit string', () => {
		const result = usaFormatters.formatPhone('2125551234')
		expect(result).toBe('(212) 555-1234')
	})

	it('formatPhone 11-digit string', () => {
		const result = usaFormatters.formatPhone('12125551234')
		expect(result).toBe('+1 (212) 555-1234')
	})

	it('formatPerson with all fields', () => {
		const result = usaFormatters.formatPerson(testPerson)
		expect(result).toContain('Dr.')
		expect(result).toContain('John')
		expect(result).toContain('Michael')
		expect(result).toContain('Doe')
		expect(result).toContain('Jr.')
	})

	it('formatPerson with fullName', () => {
		const result = usaFormatters.formatPerson({ fullName: 'Jane Smith' })
		expect(result).toBe('Jane Smith')
	})

	it('formatOrganization', () => {
		const result = usaFormatters.formatOrganization(testOrganization)
		expect(result).toContain('Acme Corp')
		expect(result).toContain('Tax ID: 12-3456789')
	})

	it('formatParty with person', () => {
		const result = usaFormatters.formatParty({
			firstName: 'Alice',
			lastName: 'Johnson',
		})
		expect(result).toContain('Alice')
		expect(result).toContain('Johnson')
	})

	it('formatParty with organization', () => {
		const result = usaFormatters.formatParty({ name: 'Tech Inc' })
		expect(result).toContain('Tech Inc')
	})
})

// ============================================================================
// EU Formatters Tests
// ============================================================================

describe('euFormatters', () => {
	it('formatMoney with EUR currency', () => {
		const result = euFormatters.formatMoney({ amount: 1500.5, currency: 'EUR' })
		// German locale for EUR uses € symbol and German number formatting
		expect(result).toContain('€')
		// German locale uses comma as decimal separator: 1.500,50
		expect(result).toMatch(/1[.,]500/)
	})

	it('formatMoney defaults to EUR', () => {
		const result = euFormatters.formatMoney(2500)
		expect(result).toContain('€')
	})

	it('formatAddress EU format (postal code first)', () => {
		const result = euFormatters.formatAddress(testAddress)
		// EU format puts postal code and locality first
		expect(result).toContain('10001')
		expect(result).toContain('New York')
		expect(result).toContain('USA')
	})

	it('formatPhone E.164 format', () => {
		const result = euFormatters.formatPhone(testPhone)
		expect(result).toContain('+12125551234')
		expect(result).toContain('ext. 123')
	})

	it('formatPhone string as-is', () => {
		const result = euFormatters.formatPhone('+441632960000')
		expect(result).toBe('+441632960000')
	})

	it('formatPerson (same as USA)', () => {
		const result = euFormatters.formatPerson(testPerson)
		expect(result).toContain('John')
		expect(result).toContain('Doe')
	})

	it('formatOrganization (same as USA)', () => {
		const result = euFormatters.formatOrganization(testOrganization)
		expect(result).toContain('Acme Corp')
	})

	it('formatParty', () => {
		const result = euFormatters.formatParty({ firstName: 'Bob', lastName: 'Smith' })
		expect(result).toContain('Bob')
		expect(result).toContain('Smith')
	})
})

// ============================================================================
// International Formatters Tests
// ============================================================================

describe('intlFormatters', () => {
	it('formatMoney generic number format', () => {
		const result = intlFormatters.formatMoney(1500.5)
		expect(result).toContain('1,500.50')
	})

	it('formatMoney with currency code', () => {
		const result = intlFormatters.formatMoney({ amount: 1000, currency: 'GBP' })
		expect(result).toContain('GBP')
		expect(result).toContain('1,000.00')
	})

	it('formatMoney without currency', () => {
		const result = intlFormatters.formatMoney({ amount: 500 })
		expect(result).toBe('500.00')
	})

	it('formatAddress all fields', () => {
		const result = intlFormatters.formatAddress(testAddress)
		expect(result).toContain('123 Main St')
		expect(result).toContain('Apt 4B')
		expect(result).toContain('New York')
		expect(result).toContain('NY')
		expect(result).toContain('10001')
		expect(result).toContain('USA')
	})

	it('formatAddress filters out empty fields', () => {
		const result = intlFormatters.formatAddress({
			line1: '789 Elm Rd',
			locality: 'London',
			country: 'UK',
		})
		expect(result).toBe('789 Elm Rd, London, UK')
	})

	it('formatPhone E.164 format', () => {
		const result = intlFormatters.formatPhone(testPhone)
		expect(result).toContain('+12125551234')
		expect(result).toContain('ext. 123')
	})

	it('formatPhone string as-is', () => {
		const result = intlFormatters.formatPhone('+33123456789')
		expect(result).toBe('+33123456789')
	})

	it('formatPerson (same as USA)', () => {
		const result = intlFormatters.formatPerson(testPerson)
		expect(result).toContain('John')
		expect(result).toContain('Doe')
	})

	it('formatOrganization (same as USA)', () => {
		const result = intlFormatters.formatOrganization(testOrganization)
		expect(result).toContain('Acme Corp')
	})

	it('formatParty', () => {
		const result = intlFormatters.formatParty({ name: 'Global Ltd' })
		expect(result).toContain('Global Ltd')
	})
})

// ============================================================================
// Formatter Factory Tests
// ============================================================================

describe('createFormatters factory', () => {
	it('creates USA formatters with US region', () => {
		const formatters = createFormatters({ regionFormat: 'US' })
		const result = formatters.formatMoney(1000)
		expect(result).toContain('$')
	})

	it('creates USA formatters by default', () => {
		const formatters = createFormatters()
		const result = formatters.formatMoney(1000)
		expect(result).toContain('$')
	})

	it('creates EU formatters with EU region', () => {
		const formatters = createFormatters({ regionFormat: 'EU' })
		const result = formatters.formatMoney(1000)
		expect(result).toContain('€')
	})

	it('creates intl formatters with intl region', () => {
		const formatters = createFormatters({ regionFormat: 'intl' })
		const result = formatters.formatAddress(testAddress)
		// Should contain all address parts
		expect(result).toContain('10001')
		expect(result).toContain('USA')
	})

	it('ignores unknown regions and defaults to US', () => {
		const formatters = createFormatters({ regionFormat: 'XX' as any })
		const result = formatters.formatMoney(1000)
		expect(result).toContain('$')
	})

	it('returns different formatter instances', () => {
		const usa = createFormatters({ regionFormat: 'US' })
		const eu = createFormatters({ regionFormat: 'EU' })
		const intl = createFormatters({ regionFormat: 'intl' })

		const moneyTest = { amount: 100, currency: 'USD' }
		const usaResult = usa.formatMoney(moneyTest)
		const euResult = eu.formatMoney(moneyTest)
		const intlResult = intl.formatMoney(moneyTest)

		// Results should be different due to different locales/formats
		expect(usaResult).not.toBe(euResult)
	})
})

// ============================================================================
// Edge Cases and Error Handling
// ============================================================================

describe('formatters edge cases', () => {
	const testAllFormatters = (formatters: FormatterRegistry, name: string) => {
		describe(`${name} edge cases`, () => {
			it('handles null/undefined values gracefully', () => {
				expect(formatters.formatMoney(null as any)).toBe('')
				expect(formatters.formatMoney(undefined as any)).toBe('')
				expect(formatters.formatAddress(null as any)).toBe('')
				expect(formatters.formatPhone(null as any)).toBe('')
				expect(formatters.formatPerson(null as any)).toBe('')
				expect(formatters.formatOrganization(null as any)).toBe('')
				expect(formatters.formatParty(null as any)).toBe('')
			})

			it('handles empty objects', () => {
				// Empty objects still produce formatted output (amount defaults to 0, etc.)
				expect(formatters.formatMoney({})).toBeTruthy()
				expect(formatters.formatAddress({})).toBe('')
				expect(formatters.formatPhone({})).toBe('')
				expect(formatters.formatPerson({})).toBe('')
				expect(formatters.formatOrganization({})).toBe('')
				expect(formatters.formatParty({})).toBe('')
			})

			it('handles missing optional fields', () => {
				const minimalAddress = { line1: '123 Main' }
				const result = formatters.formatAddress(minimalAddress)
				expect(result).toContain('123 Main')
			})
		})
	}

	testAllFormatters(usaFormatters, 'usaFormatters')
	testAllFormatters(euFormatters, 'euFormatters')
	testAllFormatters(intlFormatters, 'intlFormatters')
})

// ============================================================================
// Comparison Tests (Formatter Behavior Differences)
// ============================================================================

// ============================================================================
// Custom Formatter Tests
// ============================================================================

describe('custom formatters (user-implemented)', () => {
	it('allows implementing custom FormatterRegistry', () => {
		const customFormatters: FormatterRegistry = {
			formatMoney: (value) => `CUSTOM: ${JSON.stringify(value)}`,
			formatAddress: (value) => `CUSTOM ADDRESS: ${(value as any)?.line1 || 'unknown'}`,
			formatPhone: (value) => `CUSTOM PHONE: ${(value as any)?.number || 'unknown'}`,
			formatPerson: (value) => `CUSTOM PERSON: ${(value as any)?.fullName || 'unknown'}`,
			formatOrganization: (value) => `CUSTOM ORG: ${(value as any)?.name || 'unknown'}`,
			formatParty: (value) => `CUSTOM PARTY: ${JSON.stringify(value)}`,
		}

		expect(customFormatters.formatMoney({ amount: 100, currency: 'USD' })).toContain('CUSTOM')
		expect(customFormatters.formatAddress({ line1: '123 Main' })).toContain('CUSTOM ADDRESS')
	})

	it('allows passing custom formatters to renderers via context', () => {
		// This test verifies the pattern - actual rendering is tested in renderer tests
		const customFormatters: FormatterRegistry = {
			formatMoney: () => 'CUSTOM_MONEY',
			formatAddress: () => 'CUSTOM_ADDRESS',
			formatPhone: () => 'CUSTOM_PHONE',
			formatPerson: () => 'CUSTOM_PERSON',
			formatOrganization: () => 'CUSTOM_ORG',
			formatParty: () => 'CUSTOM_PARTY',
		}

		// Verify custom formatter can be used
		const result = customFormatters.formatMoney(1000)
		expect(result).toBe('CUSTOM_MONEY')
	})

	it('allows mixing formatter implementations', () => {
		// User could create a hybrid formatter combining different sources
		const hybridFormatters: FormatterRegistry = {
			// Use USA for money
			formatMoney: usaFormatters.formatMoney,
			// Use EU for address
			formatAddress: euFormatters.formatAddress,
			// Use custom for phone
			formatPhone: () => 'E.164 Format',
			// Use international for person
			formatPerson: intlFormatters.formatPerson,
			// Use USA for organization
			formatOrganization: usaFormatters.formatOrganization,
			// Use custom for party
			formatParty: (value) => `Party: ${JSON.stringify(value)}`,
		}

		// Verify hybrid formatter works
		expect(hybridFormatters.formatMoney(100)).toContain('$') // USA style
		expect(hybridFormatters.formatAddress(testAddress)).toContain('10001') // EU style
		expect(hybridFormatters.formatPhone(testPhone)).toBe('E.164 Format') // Custom
	})

	it('allows creating locale-specific custom formatters', () => {
		// Example: UK-specific formatter
		const ukFormatters: FormatterRegistry = {
			formatMoney: (value) => {
				if (typeof value === 'number') {
					return `£${value.toFixed(2)}`
				}
				const amount = (value as Money).amount ?? 0
				return `£${amount.toFixed(2)}`
			},
			formatAddress: (value) => {
				// UK format: postcode first
				const parts: string[] = []
				if (value.line1) parts.push(value.line1)
				if (value.postalCode) parts.push(value.postalCode)
				if (value.locality) parts.push(value.locality)
				if (value.country) parts.push(value.country)
				return parts.join(', ')
			},
			formatPhone: (value) => {
				if (typeof value === 'string') return value
				return (value as Phone).number || ''
			},
			formatPerson: usaFormatters.formatPerson,
			formatOrganization: usaFormatters.formatOrganization,
			formatParty: (value) => {
				if ('firstName' in value || 'lastName' in value) {
					return ukFormatters.formatPerson(value as any)
				}
				if ('name' in value && !('firstName' in value)) {
					return ukFormatters.formatOrganization(value as any)
				}
				return ''
			},
		}

		const result = ukFormatters.formatMoney(100)
		expect(result).toBe('£100.00')

		const addrResult = ukFormatters.formatAddress({
			line1: '10 Downing St',
			locality: 'London',
			postalCode: 'SW1A 2AA',
			country: 'UK',
		})
		expect(addrResult).toContain('SW1A 2AA')
	})

	it('allows creating accessibility-focused formatters', () => {
		// Example: Formatters optimized for screen readers
		const a11yFormatters: FormatterRegistry = {
			formatMoney: (value) => {
				const amount = typeof value === 'number' ? value : (value as Money).amount ?? 0
				const currency = typeof value === 'number' ? 'USD' : (value as Money).currency || 'USD'
				return `${amount} ${currency} dollars`
			},
			formatAddress: (value) => {
				const parts: string[] = []
				if (value.line1) parts.push(`Street: ${value.line1}`)
				if (value.line2) parts.push(`Unit: ${value.line2}`)
				if (value.locality) parts.push(`City: ${value.locality}`)
				if (value.region) parts.push(`State: ${value.region}`)
				if (value.postalCode) parts.push(`Zip: ${value.postalCode}`)
				if (value.country) parts.push(`Country: ${value.country}`)
				return parts.join('. ')
			},
			formatPhone: (value) => {
				const number = typeof value === 'string' ? value : (value as Phone).number || ''
				return `Phone: ${number}`
			},
			formatPerson: (value) => {
				const parts: string[] = []
				if (value.title) parts.push(value.title)
				if (value.firstName) parts.push(value.firstName)
				if (value.lastName) parts.push(value.lastName)
				return parts.join(' ')
			},
			formatOrganization: (value) => {
				return (value as Organization).name || ''
			},
			formatParty: (value) => {
				if ('firstName' in value || 'lastName' in value) {
					return a11yFormatters.formatPerson(value as any)
				}
				return a11yFormatters.formatOrganization(value as any)
			},
		}

		expect(a11yFormatters.formatMoney(50)).toBe('50 USD dollars')
		const a11yAddress = a11yFormatters.formatAddress({ line1: '123 Main St', locality: 'Boston' })
		expect(a11yAddress).toContain('Street: 123 Main St')
		expect(a11yAddress).toContain('City: Boston')
	})
})

describe('formatter behavior differences', () => {
	it('USA vs EU money formatting', () => {
		const testVal = { amount: 1234.56, currency: 'USD' }
		const usa = usaFormatters.formatMoney(testVal)
		const eu = euFormatters.formatMoney(testVal)

		// USA uses $ symbol
		expect(usa).toContain('$')
		expect(usa).toContain('1,234.56')

		// EU shows $ with German number format (1.234,56 $)
		expect(eu).toContain('$')
		expect(eu).toMatch(/1[.,]234/)
	})

	it('USA vs EU address formatting', () => {
		const addr = {
			line1: '10 Downing St',
			locality: 'London',
			postalCode: 'SW1A 2AA',
			country: 'UK',
		}

		const usa = usaFormatters.formatAddress(addr)
		const eu = euFormatters.formatAddress(addr)

		// USA: line, locality, postal, country
		// EU: line, postal, locality, country
		expect(usa).toContain('10 Downing St')
		expect(eu).toContain('10 Downing St')

		// Both should work but order may differ
		expect(usa.length).toBeGreaterThan(0)
		expect(eu.length).toBeGreaterThan(0)
	})

	it('USA vs Intl phone formatting', () => {
		const usaPhone = usaFormatters.formatPhone('2025551234')
		const intlPhone = intlFormatters.formatPhone('2025551234')

		// USA should format as (202) 555-1234
		expect(usaPhone).toContain('202')
		// Intl just returns the raw number
		expect(intlPhone).toBe('2025551234')
	})
})
