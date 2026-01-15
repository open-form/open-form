# @open-form/sdk

> Complete OpenForm framework in one package

[![npm version](https://img.shields.io/npm/v/@open-form/sdk.svg)](https://www.npmjs.com/package/@open-form/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Umbrella package that re-exports the entire OpenForm framework for convenient installation and usage.

## Features

- 📦 **All-in-one** - Single package containing the complete framework
- 🏗️ **Form building** - Schema definitions, validation, and builders
- 📄 **Document rendering** - DOCX, PDF, and text output formats
- ✅ **Type-safe** - Full TypeScript support

## Installation

```bash
npm install @open-form/sdk
# or
pnpm add @open-form/sdk
# or
yarn add @open-form/sdk
```

## Quick Start

### Define a Residential Lease Agreement

```typescript
import { open, type InferFormData } from "@open-form/sdk";

// Define a lease agreement form with fields and layers
const leaseAgreement = open
  .form()
  .name("residential-lease")
  .version("1.0.0")
  .title("Residential Lease Agreement")
  // Multiple output formats (layers)
  .layers({
    markdown: {
      kind: "file",
      path: "templates/lease-agreement.md",
      mimeType: "text/markdown",
    },
    pdf: {
      kind: "file",
      path: "templates/lease-agreement.pdf",
      mimeType: "application/pdf",
      bindings: { tenant: "form1[0].Page1[0].TenantName[0]" },
    },
  })
  .defaultLayer("markdown")
  // Required file attachments
  .annexes([
    open
      .annex()
      .id("photoId")
      .title("Photo ID")
      .description("Government-issued photo ID"),
  ])
  // Form fields
  .fields({
    tenant: { type: "person", label: "Tenant", required: true },
    propertyAddress: {
      type: "address",
      label: "Property Address",
      required: true,
    },
    monthlyRent: { type: "money", label: "Monthly Rent", required: true },
    leaseStartDate: { type: "date", label: "Lease Start Date", required: true },
  })
  .build();

// Get TypeScript types automatically
type LeaseData = InferFormData<typeof leaseAgreement>;
```

### Fill and Render

```typescript
import { textRenderer, pdfRenderer } from "@open-form/sdk";
import { createFsResolver } from "@open-form/resolvers/fs";

// Create resolver for template files
const resolver = createFsResolver({ root: "/path/to/templates" });

// Fill the form with data (validates automatically)
const filledLease = leaseAgreement.fill({
  tenant: {
    fullName: "Alice Johnson",
    firstName: "Alice",
    lastName: "Johnson",
  },
  propertyAddress: {
    line1: "123 Main St",
    locality: "Portland",
    region: "OR",
    postalCode: "97201",
    country: "USA",
  },
  monthlyRent: { amount: 1500, currency: "USD" },
  leaseStartDate: new Date("2024-02-01"),
});

// Render to HTML using the markdown layer
const html = await filledLease.render({
  renderer: textRenderer,
  resolver,
  layer: "markdown",
});

// Render to PDF using bindings
const pdf = await filledLease.render({
  renderer: pdfRenderer,
  resolver,
  layer: "pdf",
});
```

### Create a Bundle

```typescript
// Combine forms and documents into a complete package
const leasePackage = open
  .bundle()
  .name("lease-package")
  .version("1.0.0")
  .items([
    { ref: leaseAgreement, key: "main-lease" },
    // Add other forms, documents, checklists...
  ])
  .build();

// Assemble all artifacts
const assembled = await leasePackage.assemble({ resolver });
// → Bundle with all rendered documents, forms, and files
```

## Related Packages

- [`@open-form/core`](../core) - Core functionality and types
- [`@open-form/renderers`](../renderers) - All renderers in one package
- [`@open-form/schemas`](../schemas) - JSON Schema definitions
- [`@open-form/types`](../types) - Type definitions and formatters
- [`@open-form/serialization`](../serialization) - Locale-aware serialization utilities
- [`@open-form/resolvers`](../resolvers) - Filesystem and environment resolvers

## License

MIT © [OpenForm](https://github.com/open-form)
