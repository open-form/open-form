<p align="center">
  <a href="https://open-form.dev?utm_source=github&utm_medium=core" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://assets.open-form.dev/logo-400x400.png" type="image/png">
      <img src="https://assets.open-form.dev/logo-400x400.png" height="64" alt="OpenForm logo">
    </picture>
  </a>
  <br />
</p>

<h1 align="center">@open-form/core</h1>

<div align="center">

[![OpenForm documentation](https://img.shields.io/badge/Documentation-OpenForm-red.svg)](https://docs.open-form.dev?utm_source=github&utm_medium=core)
[![Follow on Twitter](https://img.shields.io/twitter/follow/OpenFormHQ?style=social)](https://twitter.com/intent/follow?screen_name=OpenFormHQ)

</div>

[OpenForm](https://open-form.dev?utm_source=github&utm_medium=core) is **documents as code**. It lets developers and AI agents define, validate, and render business documents using typed, composable schemas. This eliminates template drift, broken mappings, and brittle glue code — while giving AI systems a reliable document layer they can safely read, reason over, and generate against in production workflows.

## Package overview

Fundamental package for modeling business documents as typed, versioned artifacts. Provides builders for Forms, Documents, Checklists, and Bundles with schema-driven validation and composition.

- 🏗️ **Type-safe builders** - Fluent API for defining document structures
- 📋 **Four artifact types** - Form, Document, Checklist, and Bundle builders
- ✅ **Schema-driven validation** - Built-in structure and constraint validation
- 🎯 **Composable design** - Reuse fields and artifacts across definitions
- 📦 **Standalone library** - Use independently or with @open-form/sdk

## Installation

```bash
npm install @open-form/core
```

## Usage

Define forms with parties, fields, and validation rules:

```typescript
import { open } from "@open-form/core";

const leaseAgreement = open
  .form()
  .name("residential-lease-agreement")
  .version("1.0.0")
  .title("Residential Lease Agreement")
  .defaultLayer("markdown")
  .layers({
    markdown: open
      .layer()
      .file()
      .mimeType("text/markdown")
      .path("fixtures/lease-agreement.md"),
  })
  .parties({
    landlord: open
      .party()
      .label("Landlord")
      .signature((sig) => sig.required()),
    tenant: open
      .party()
      .label("Tenant")
      .multiple(true)
      .min(1)
      .max(4)
      .signature((sig) => sig.required()),
  })
  .fields({
    leaseId: { type: "uuid", label: "Lease ID" },
    propertyAddress: {
      type: "address",
      label: "Property Address",
      required: true,
    },
    monthlyRent: { type: "money", label: "Monthly Rent", required: true },
    leaseStartDate: { type: "date", label: "Lease Start Date", required: true },
  })
  .build();
```

Add file attachments and advanced field types:

```typescript
const advancedLease = open
  .form()
  .name("commercial-lease")
  .version("1.0.0")
  .title("Commercial Lease Agreement")
  .allowAnnexes(true)
  .annexes([
    open.annex().id("photoId").title("Photo ID").required(true),
    open.annex().id("proofOfIncome").title("Proof of Income").required(true),
  ])
  .parties({
    landlord: open
      .party()
      .label("Landlord")
      .signature((sig) => sig.required()),
    tenant: open
      .party()
      .label("Tenant")
      .multiple(true)
      .signature((sig) => sig.required()),
  })
  .fields({
    leaseId: { type: "uuid", label: "Lease ID", required: true },
    leaseTermMonths: {
      type: "number",
      label: "Lease Term (months)",
      required: true,
    },
    monthlyRent: { type: "money", label: "Monthly Rent", required: true },
    petPolicy: {
      type: "enum",
      enum: ["no-pets", "small-pets", "all-pets"],
      label: "Pet Policy",
      required: true,
    },
  })
  .build();
```

Define static documents with metadata:

```typescript
const leadPaintDisclosure = open
  .document()
  .name("lead-paint-disclosure")
  .version("1.0.0")
  .title("Lead Paint Disclosure")
  .code("EPA-747-K-12-001")
  .releaseDate("2025-12-01")
  .metadata({ agency: "EPA/HUD", cfr: "40 CFR 745" })
  .layers({
    pdf: open
      .layer()
      .file()
      .path("fixtures/lead-paint-disclosure.pdf")
      .mimeType("application/pdf"),
  })
  .defaultLayer("pdf")
  .build();
```

Define workflow checklists with status tracking:

```typescript
const leaseChecklist = open
  .checklist()
  .name("lease-application-checklist")
  .version("1.0.0")
  .title("Lease Application Checklist")
  .items([
    {
      id: "application_received",
      title: "Application Received",
      status: { kind: "boolean" },
    },
    {
      id: "credit_check",
      title: "Credit Check Complete",
      status: { kind: "boolean" },
    },
    {
      id: "background_check",
      title: "Background Check Complete",
      status: { kind: "boolean" },
    },
    { id: "lease_signed", title: "Lease Signed", status: { kind: "boolean" } },
  ])
  .build();
```

Compose artifacts into bundles:

```typescript
const propertyAddress = {
  type: "address",
  label: "Property Address",
  required: true,
};
const monthlyRent = { type: "money", label: "Monthly Rent", required: true };

const residentialLease = open
  .form()
  .name("residential-lease")
  .version("1.0.0")
  .fields({ leaseId: { type: "uuid" }, propertyAddress, monthlyRent })
  .build();

const commercialLease = open
  .form()
  .name("commercial-lease")
  .version("1.0.0")
  .fields({ leaseId: { type: "uuid" }, propertyAddress, monthlyRent })
  .build();

const leaseBundle = open
  .bundle()
  .name("residential-lease-bundle")
  .version("1.0.0")
  .contents([
    { type: "inline", key: "residential", artifact: residentialLease.schema },
    { type: "inline", key: "commercial", artifact: commercialLease.schema },
    { type: "inline", key: "disclosure", artifact: leadPaintDisclosure.schema },
    { type: "inline", key: "checklist", artifact: leaseChecklist.schema },
  ])
  .build();
```

Extract TypeScript types from artifacts:

```typescript
import { type InferFormData } from "@open-form/core";

type LeaseData = InferFormData<typeof leaseAgreement>;

const data: LeaseData = {
  leaseId: "550e8400-e29b-41d4-a716-446655440000",
  propertyAddress: {
    line1: "123 Main St",
    locality: "Portland",
    region: "OR",
    postalCode: "97201",
    country: "USA",
  },
  monthlyRent: { amount: 1500, currency: "USD" },
  leaseStartDate: new Date("2024-02-01"),
};
```

Validate data against form schemas:

```typescript
if (!leaseAgreement.isValid(data)) {
  console.log("Data does not match form schema");
}

try {
  const filled = leaseAgreement.fill(data);
} catch (error) {
  console.error("Validation failed:", error);
}
```

For rendering artifacts to PDF, DOCX, HTML, or other formats, use `@open-form/sdk` with the renderers package. For complete production examples, see `/incubator/apps/demo/src/demos/leasing`. For API reference and advanced patterns, visit [docs.open-form.dev](https://docs.open-form.dev).

## Changelog

View the [Changelog](https://github.com/open-form/open-form/blob/main/packages/core/CHANGELOG.md) for updates.

## Related packages

- [`@open-form/sdk`](../sdk) - Complete framework with renderers
- [`@open-form/types`](../types) - TypeScript utilities and types
- [`@open-form/schemas`](../schemas) - JSON Schema definitions
- [`@open-form/renderers`](../renderers) - All renderers (PDF, DOCX, Text)
- [`@open-form/resolvers`](../resolvers) - File and environment resolvers

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read our [contribution guidelines](https://github.com/open-form/open-form/blob/main/CONTRIBUTING.md) and [code of conduct](https://github.com/open-form/open-form/blob/main/CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT license.

See [LICENSE](https://github.com/open-form/open-form/blob/main/LICENSE.md) for more information.
