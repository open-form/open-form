/**
 * Base Registry Factory
 * Creates region-specific serializer registries with minimal duplication.
 */

import type {
  Money,
  Address,
  Person,
  Organization,
  Party,
} from "@open-form/types";
import type { SerializerRegistry } from "@open-form/types";
import {
  validateMoney,
  validateAddress,
  validatePerson,
  validateOrganization,
  validateParty,
  phoneStringifier,
  coordinateStringifier,
  bboxStringifier,
  durationStringifier,
  identificationStringifier,
} from "../serializers";

type AddressFormat = "us" | "eu";

interface RegionConfig {
  locale: string;
  defaultCurrency: string;
  addressFormat: AddressFormat;
}

const createMoneyStringifier = (locale: string, defaultCurrency: string) => ({
  stringify(value: Money | number | Partial<Money>): string {
    if (typeof value === "number") {
      if (!Number.isFinite(value)) throw new Error("Invalid number");
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: defaultCurrency,
      }).format(value);
    }

    validateMoney(value);

    const { amount, currency = defaultCurrency } = value as Money;
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  },
});

const createAddressStringifier = (format: AddressFormat) => ({
  stringify(value: Address | Partial<Address>): string {
    validateAddress(value);

    const parts: string[] = [];

    if (value.line1) parts.push(value.line1);
    if (value.line2) parts.push(value.line2);

    const locationParts: string[] = [];
    if (format === "eu") {
      // EU: postal code first, then locality, region
      if (value.postalCode) locationParts.push(value.postalCode);
      if (value.locality) locationParts.push(value.locality);
      if (value.region) locationParts.push(value.region);
    } else {
      // US/Intl: locality, region, postal code
      if (value.locality) locationParts.push(value.locality);
      if (value.region) locationParts.push(value.region);
      if (value.postalCode) locationParts.push(value.postalCode);
    }

    if (locationParts.length > 0) {
      const separator = format === "eu" ? " " : ", ";
      parts.push(locationParts.join(separator));
    }

    if (value.country) parts.push(value.country);

    return parts.join(", ");
  },
});

const personStringifier = {
  stringify(
    value:
      | Person
      | Partial<Person>
      | {
          fullName?: string;
          title?: string;
          firstName?: string;
          middleName?: string;
          lastName?: string;
          suffix?: string;
        }
  ): string {
    validatePerson(value);

    if (value.fullName) return value.fullName;

    const nameParts: string[] = [];
    if (value.title) nameParts.push(value.title);
    if (value.firstName) nameParts.push(value.firstName);
    if (value.middleName) nameParts.push(value.middleName);
    if (value.lastName) nameParts.push(value.lastName);
    if (value.suffix) nameParts.push(value.suffix);

    const result = nameParts.join(" ");
    if (!result) throw new Error("At least one name component is required");
    return result;
  },
};

const organizationStringifier = {
  stringify(
    value:
      | Organization
      | Partial<Organization>
      | { name?: string; ein?: string; email?: string; phone?: string }
  ): string {
    validateOrganization(value);

    const { name, taxId } = value as Organization;
    const parts: string[] = [];

    if (name) parts.push(name);
    if (taxId) parts.push(`(Tax ID: ${taxId})`);

    const result = parts.join(" ");
    if (!result) throw new Error("Organization name is required");
    return result;
  },
};

const createPartyStringifier = (registry: SerializerRegistry) => ({
  stringify(value: Party | Partial<Party>): string {
    validateParty(value);

    if ("firstName" in value || "lastName" in value) {
      return registry.person.stringify(value as Person | Partial<Person>);
    }

    if ("name" in value && !("firstName" in value)) {
      return registry.organization.stringify(
        value as Organization | Partial<Organization>
      );
    }

    throw new Error("Invalid party: must be either a Person or Organization");
  },
});

export function createRegionRegistry(config: RegionConfig): SerializerRegistry {
  const registry: SerializerRegistry = {
    money: createMoneyStringifier(config.locale, config.defaultCurrency),
    address: createAddressStringifier(config.addressFormat),
    phone: phoneStringifier,
    person: personStringifier,
    organization: organizationStringifier,
    party: null as never, // Placeholder, set below
    coordinate: coordinateStringifier,
    bbox: bboxStringifier,
    duration: durationStringifier,
    identification: identificationStringifier,
  };

  // Party needs reference to the registry for delegation
  registry.party = createPartyStringifier(registry);

  return registry;
}

// Pre-configured registries
export const usaSerializers = createRegionRegistry({
  locale: "en-US",
  defaultCurrency: "USD",
  addressFormat: "us",
});

export const euSerializers = createRegionRegistry({
  locale: "de-DE",
  defaultCurrency: "EUR",
  addressFormat: "eu",
});

export const intlSerializers = createRegionRegistry({
  locale: "en-US",
  defaultCurrency: "USD",
  addressFormat: "us",
});
