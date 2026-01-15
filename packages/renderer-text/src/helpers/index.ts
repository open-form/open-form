/**
 * Handlebars helpers registry for OpenForm field types
 */

import type Handlebars from "handlebars";
import {
  formatMoney,
  formatAddress,
  formatPhone,
  formatPerson,
  formatOrganization,
  formatParty,
} from "@open-form/types";
import { usaFormatters } from "@open-form/serialization";
import type {
  Money,
  Address,
  Phone,
  Person,
  Organization,
  Party,
  FormatterRegistry,
} from "@open-form/types";

// Re-export formatters for convenience
export {
  formatMoney,
  formatAddress,
  formatPhone,
  formatPerson,
  formatOrganization,
  formatParty,
};

// Re-export types for convenience (using the actual schema types)
export type {
  Money,
  Address,
  Phone,
  Person,
  Organization,
  Party,
};

// Handlebars helpers (wrappers around formatters)
export function moneyHelper(value: Money | number | Partial<Money>): string {
  return formatMoney(value);
}

export function addressHelper(value: Address | Partial<Address>): string {
  return formatAddress(value);
}

export function phoneHelper(
  value: Phone | string | Partial<Phone> | { number?: string; countryCode?: string; extension?: string },
): string {
  return formatPhone(value);
}

export function personHelper(
  value: Person | Partial<Person> | { firstName?: string; lastName?: string; middleName?: string; email?: string; phone?: string },
): string {
  return formatPerson(value);
}

export function organizationHelper(
  value: Organization | Partial<Organization> | { name?: string; ein?: string; email?: string; phone?: string },
): string {
  return formatOrganization(value);
}

export function partyHelper(value: Party | Partial<Party>): string {
  return formatParty(value);
}

/**
 * Register all OpenForm helpers with Handlebars
 * @param handlebars - Handlebars instance to register helpers on
 * @param formatters - Optional custom formatter registry. Uses USA formatters by default.
 */
export function registerOpenFormHelpers(
  handlebars: typeof Handlebars,
  formatters: FormatterRegistry = usaFormatters,
): void {
  handlebars.registerHelper("money", (value: Money | number | Partial<Money>) => formatters.formatMoney(value));
  handlebars.registerHelper("address", (value: Address | Partial<Address>) => formatters.formatAddress(value));
  handlebars.registerHelper("phone", (value: Phone | string | Partial<Phone> | { number?: string; countryCode?: string; extension?: string }) => formatters.formatPhone(value));
  handlebars.registerHelper("person", (value: Person | Partial<Person> | { fullName?: string; title?: string; firstName?: string; middleName?: string; lastName?: string; suffix?: string }) => formatters.formatPerson(value));
  handlebars.registerHelper("organization", (value: Organization | Partial<Organization> | { name?: string; ein?: string; email?: string; phone?: string }) => formatters.formatOrganization(value));
  handlebars.registerHelper("party", (value: Party | Partial<Party>) => formatters.formatParty(value));
}

/**
 * Get all OpenForm helpers as an object
 */
export function getOpenFormHelpers(): Record<string, Handlebars.HelperDelegate> {
  return {
    money: moneyHelper,
    address: addressHelper,
    phone: phoneHelper,
    person: personHelper,
    organization: organizationHelper,
    party: partyHelper,
  };
}

