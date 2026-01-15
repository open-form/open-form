# @open-form/serialization

> Primitive serialization for OpenForm framework

[![npm version](https://img.shields.io/npm/v/@open-form/serialization.svg)](https://www.npmjs.com/package/@open-form/serialization)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Locale and region-aware serialization of OpenForm primitive types (Money, Address, Phone, Person, Organization) into human-readable string representations.

## Features

- 🌍 **Multi-locale support** - USA, EU, and international formatters built-in
- 🔧 **Pluggable architecture** - Implement custom serializers via `FormatterRegistry` interface
- 💱 **Currency formatting** - Locale-specific money formatting with proper symbols and grouping
- 📍 **Address formatting** - Regional address format support (US, EU, flexible international)
- ☎️ **Phone formatting** - E.164 and locale-specific phone number formats
- ♿ **Accessibility-ready** - Simple patterns for screen reader and accessibility-focused formatting
- ✅ **Type-safe** - Full TypeScript support

## Installation

```bash
npm install @open-form/serialization
# or
pnpm add @open-form/serialization
# or
yarn add @open-form/serialization
```

## Usage

### Default Formatters

```typescript
import { usaFormatters, euFormatters, intlFormatters } from "@open-form/serialization";

// USA formatters (default)
usaFormatters.formatMoney({ amount: 1500, currency: "USD" });
// → "$1,500.00"

usaFormatters.formatAddress({
  line1: "123 Main St",
  locality: "New York",
  region: "NY",
  postalCode: "10001",
  country: "USA",
});
// → "123 Main St, New York, NY, 10001, USA"

// EU formatters
euFormatters.formatMoney({ amount: 1500, currency: "EUR" });
// → "1.500,00 €" (German locale with EUR)

euFormatters.formatAddress({
  line1: "10 Downing St",
  locality: "London",
  postalCode: "SW1A 2AA",
  country: "UK",
});
// → "10 Downing St, SW1A 2AA, London, UK"

// International formatters
intlFormatters.formatMoney({ amount: 1500, currency: "GBP" });
// → "GBP 1,500.00"
```

### Factory Pattern

```typescript
import { createFormatters } from "@open-form/serialization";

// Create USA formatters
const usa = createFormatters({ regionFormat: "US" });

// Create EU formatters
const eu = createFormatters({ regionFormat: "EU" });

// Create international formatters
const intl = createFormatters({ regionFormat: "intl" });
```

### Custom Formatters

```typescript
import type { FormatterRegistry } from "@open-form/serialization";

const customFormatters: FormatterRegistry = {
  formatMoney: (value) => {
    const amount = typeof value === "number" ? value : value.amount ?? 0;
    return `💰 ${amount.toFixed(2)}`;
  },
  formatAddress: (value) => {
    // Custom address formatting logic
    return `📍 ${value.line1}`;
  },
  formatPhone: (value) => {
    // Custom phone formatting logic
    return `☎️ ${value.number || ""}`;
  },
  formatPerson: (value) => {
    return `👤 ${value.firstName} ${value.lastName}`;
  },
  formatOrganization: (value) => {
    return `🏢 ${value.name}`;
  },
  formatParty: (value) => {
    if ("firstName" in value) {
      return customFormatters.formatPerson(value as any);
    }
    return customFormatters.formatOrganization(value as any);
  },
};

// Use with renderers
const result = await form.render({
  renderer: textRenderer,
  ctx: { formatters: customFormatters },
});
```

## API Reference

### FormatterRegistry

Interface defining the serialization contract.

```typescript
interface FormatterRegistry {
  formatMoney(value: Money | number | Partial<Money>): string;
  formatAddress(value: Address | Partial<Address>): string;
  formatPhone(value: Phone | string | Partial<Phone>): string;
  formatPerson(value: Person | Partial<Person>): string;
  formatOrganization(value: Organization | Partial<Organization>): string;
  formatParty(value: Party | Partial<Party>): string;
}
```

### FormatterConfig

Configuration options for creating formatters.

```typescript
interface FormatterConfig {
  locale?: string; // Locale code (e.g., 'en-US', 'fr-FR')
  regionFormat?: "US" | "EU" | "intl"; // Regional format preference
}
```

### `createFormatters(config)`

Factory function to create formatter registry instances.

```typescript
const formatters = createFormatters({ regionFormat: "EU" });
```

### Pre-built Formatters

- `usaFormatters` - USA locale with USD currency, US address format, US phone format
- `euFormatters` - EU locale with EUR currency, EU address format, E.164 phone format
- `intlFormatters` - International generic formatting with E.164 phone format

## Integration with Renderers

Serializers are used by OpenForm renderers to format primitive values in rendered output.

```typescript
import { textRenderer } from "@open-form/renderer-text";
import { euFormatters } from "@open-form/serialization";

// Render form with custom formatters
const result = await form.render({
  renderer: textRenderer,
  resolver,
  layer: "html",
  ctx: { formatters: euFormatters },
});
```

## Related Packages

- [`@open-form/sdk`](https://www.npmjs.com/package/@open-form/sdk) - Complete OpenForm framework bundle

## License

MIT © [OpenForm](https://github.com/open-form)
