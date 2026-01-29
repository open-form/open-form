/**
 * Party Builder
 *
 * Provides utilities for parsing and validating Party data (Person or Organization).
 * Party type is inferred from shape - no explicit type discriminator needed.
 */

import { validatePerson, validateOrganization } from '@/validation';
import type { Party, Person, Organization } from '@open-form/types';

/**
 * Type guard to check if a party is a Person.
 * Persons are identified by having a `fullName` property.
 *
 * @param party - The party to check
 * @returns true if the party is a Person
 */
export function isPerson(party: Party): party is Person {
  return 'fullName' in party;
}

/**
 * Type guard to check if a party is an Organization.
 * Organizations have `name` but not `fullName`.
 *
 * @param party - The party to check
 * @returns true if the party is an Organization
 */
export function isOrganization(party: Party): party is Organization {
  return 'name' in party && !('fullName' in party);
}

/**
 * Infer the party type from its shape.
 *
 * @param party - The party to analyze
 * @returns 'person' if the party has fullName, 'organization' otherwise
 */
export function inferPartyType(party: Party): 'person' | 'organization' {
  return isPerson(party) ? 'person' : 'organization';
}

/**
 * Parse an unknown input into a Party (Person or Organization).
 * Type is inferred from shape:
 * - If `fullName` is present, validates as Person
 * - If `name` is present (and not `fullName`), validates as Organization
 *
 * @param input - The input to parse
 * @returns Validated Party data
 * @throws Error if validation fails or shape cannot be determined
 */
function parse(input: unknown): Party {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Invalid party: must be an object');
  }

  const obj = input as Record<string, unknown>;

  if ('fullName' in obj) {
    // Validate as Person
    if (!validatePerson(obj)) {
      const errors = (validatePerson as unknown as { errors: Array<{ message?: string }> }).errors;
      throw new Error(`Invalid person data: ${errors?.[0]?.message || 'validation failed'}`);
    }
    return obj as unknown as Party;
  }

  if ('name' in obj) {
    // Validate as Organization
    if (!validateOrganization(obj)) {
      const errors = (validateOrganization as unknown as { errors: Array<{ message?: string }> }).errors;
      throw new Error(`Invalid organization data: ${errors?.[0]?.message || 'validation failed'}`);
    }
    return obj as unknown as Party;
  }

  throw new Error('Invalid party: must have fullName (person) or name (organization)');
}

/**
 * Safely parse an unknown input into a Party.
 *
 * @param input - The input to parse
 * @returns Result object with success flag and either data or error
 */
function safeParse(input: unknown): { success: true; data: Party } | { success: false; error: Error } {
  try {
    return { success: true, data: parse(input) };
  } catch (err) {
    return { success: false, error: err as Error };
  }
}

/**
 * Party data utilities for parsing and type inference.
 *
 * Use this for parsing unknown data into Party (Person | Organization).
 * For creating new parties, use `person()` or `organization()` builders.
 *
 * @example
 * ```typescript
 * // Parse a person
 * const personParty = partyData.parse({ fullName: 'John Doe' });
 * partyData.inferType(personParty); // 'person'
 *
 * // Parse an organization
 * const orgParty = partyData.parse({ name: 'Acme Corp' });
 * partyData.inferType(orgParty); // 'organization'
 *
 * // Safe parse
 * const result = partyData.safeParse({ fullName: 'Jane' });
 * if (result.success) {
 *   console.log(result.data);
 * }
 * ```
 */
export const partyData = {
  parse,
  safeParse,
  inferType: inferPartyType,
};
