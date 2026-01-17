/**
 * Serializer Registry Interface
 *
 * Defines the contract for serializing primitive types to strings.
 * This interface is implemented by locale/region-specific serializers.
 */

import type {
  Money,
  Address,
  Phone,
  Person,
  Organization,
  Coordinate,
  Bbox,
  Duration,
  Identification,
} from "../schemas/primitives";
import type { Party } from "../schemas/blocks";

/**
 * Fallback values for serializers when serialization fails
 */
export interface SerializerFallbacks {
  money?: string;
  address?: string;
  phone?: string;
  person?: string;
  organization?: string;
  party?: string;
  coordinate?: string;
  bbox?: string;
  duration?: string;
  identification?: string;
}

/**
 * Configuration options for creating locale and region-specific serializers.
 */
export interface SerializerConfig {
  /** Locale code (e.g., 'en-US', 'fr-FR', 'de-DE'). Currently 'en-US' is fully supported. */
  locale?: string;
  /** Regional format preference. Determines address/phone formatting patterns. */
  regionFormat?: "us" | "eu" | "intl";
  /** Fallback values for each serializer type when serialization fails. Defaults to empty string if not specified. */
  fallbacks?: SerializerFallbacks;
}

/**
 * Stringifier interface for a single type.
 * Converts validated data to string, using configured fallback if validation fails.
 */
export interface Stringifier<T> {
  stringify(value: T): string;
}

/**
 * Registry of stringifier namespaces for OpenForm primitive types.
 * Implement this interface to provide custom serialization logic.
 *
 * Usage:
 *   const config: SerializerConfig = {
 *     regionFormat: 'US',
 *     fallbacks: { money: 'N/A', address: '–' }
 *   }
 *   const registry = createSerializer(config);
 *
 *   registry.money.stringify({ amount: 100, currency: 'USD' })
 *   // Uses 'N/A' as fallback if serialization fails
 *   registry.address.stringify({ line1: '123 Main St', ... })
 *   // Uses '–' as fallback if serialization fails
 */
export interface SerializerRegistry {
  money: Stringifier<Money | number | Partial<Money>>;
  address: Stringifier<Address | Partial<Address>>;
  phone: Stringifier<
    | Phone
    | string
    | Partial<Phone>
    | { number?: string; countryCode?: string; extension?: string }
  >;
  person: Stringifier<
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
  >;
  organization: Stringifier<
    | Organization
    | Partial<Organization>
    | { name?: string; ein?: string; email?: string; phone?: string }
  >;
  party: Stringifier<Party | Partial<Party>>;
  coordinate: Stringifier<Coordinate | Partial<Coordinate>>;
  bbox: Stringifier<Bbox | Partial<Bbox>>;
  duration: Stringifier<Duration | string>;
  identification: Stringifier<Identification | Partial<Identification>>;
}
