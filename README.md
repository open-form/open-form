<p align="center">
  <a href="https://open-form.dev?utm_source=github&utm_medium=main" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://assets.open-form.dev/logo-400x400.png" type="image/png">
      <img src="https://assets.open-form.dev/logo-400x400.png" height="64" alt="OpenForm logo">
    </picture>
  </a>
  <br />
</p>

<h1 align="center">@open-form/sdk</h1>

<div align="center">

[![OpenForm documentation](https://img.shields.io/badge/Documentation-OpenForm-red.svg)](https://docs.open-form.dev?utm_source=github&utm_medium=main)
[![Follow on Twitter](https://img.shields.io/twitter/follow/OpenFormHQ?style=social)](https://twitter.com/intent/follow?screen_name=OpenFormHQ)

</div>

[OpenForm](https://open-form.dev?utm_source=github&utm_medium=main) is **documents as code**. It lets developers and AI agents define, validate, and render business documents using typed, composable schemas. This eliminates template drift, broken mappings, and brittle glue code — while giving AI systems a reliable document layer they can safely read, reason over, and generate against in production workflows.

## Package overview

An umbrella package containing the OpenForm core framework, serialization, and renderers.

- 📦 **All-in-one** - Single install
- 🏗️ **Type-safe builders** - Fluent API with full TypeScript support
- 📄 **Multi-format rendering** - PDF, DOCX, HTML, Text from one definition
- ✅ **Automatic validation** - Schema-driven constraints and validation
- 🎯 **Composable artifacts** - Reuse fields, forms, and documents across definitions
- 🤖 **AI-ready** - Built for agent ingestion and verification

## Installation

```bash
npm install @open-form/sdk
```

## Usage

Define forms with parties, fields, and output layers:

```typescript
import { open } from "@open-form/sdk";
import { textRenderer } from "@open-form/sdk";
import { createFsResolver } from "@open-form/resolvers/fs";

const leaseAgreement = open
  .form()
  .name("residential-lease-agreement")
  .version("1.0.0")
  .title("Residential Lease Agreement")
  .defaultLayer("markdown")
  .layers({
    markdown: {
      kind: "file",
      path: "fixtures/lease-agreement.md",
      mimeType: "text/markdown",
    },
    html: {
      kind: "file",
      path: "fixtures/lease-agreement.html",
      mimeType: "text/html",
    },
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

// Fill with data (automatic validation)
const filledLease = leaseAgreement.fill({
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
});

// Render to multiple formats
const resolver = createFsResolver({ root: process.cwd() });
const markdown = await filledLease.render({
  renderer: textRenderer,
  resolver,
  layer: "markdown",
});
const html = await filledLease.render({
  renderer: textRenderer,
  resolver,
  layer: "html",
});
```

Add file attachments and advanced field types:

```typescript
const advancedLease = open
  .form()
  .name("commercial-lease")
  .version("1.0.0")
  .title("Commercial Lease Agreement")
  .defaultLayer("markdown")
  .layers({
    markdown: {
      kind: "file",
      path: "fixtures/commercial-lease.md",
      mimeType: "text/markdown",
    },
  })
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

Define static documents and workflow checklists:

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

Combine forms, documents, and checklists into a bundle:

```typescript
const leaseBundle = open
  .bundle()
  .name("residential-lease-bundle")
  .version("1.0.0")
  .title("Residential Lease Bundle")
  .contents([
    { type: "inline", key: "leaseAgreement", artifact: leaseAgreement.schema },
    {
      type: "inline",
      key: "leadPaintDisclosure",
      artifact: leadPaintDisclosure.schema,
    },
    { type: "inline", key: "checklist", artifact: leaseChecklist.schema },
  ])
  .build();

const assembled = await leaseBundle.assemble({ resolver });
```

Get automatic TypeScript types from your form definitions:

```typescript
import { type InferFormData } from "@open-form/sdk";

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

Forms validate automatically on `.fill()`, or check validity explicitly:

```typescript
const filled = form.fill(data); // throws if validation fails

if (!form.isValid(data)) {
  console.log("Data doesn't match form schema");
}
```

For a complete production example, see `/incubator/apps/demo/src/demos/leasing`. For API reference and advanced patterns, visit [docs.open-form.dev](https://docs.open-form.dev).

## Changelog

View package Changelogs for update.

## Core packages

- [`@open-form/core`](https://github.com/open-form/open-form/blob/main/packages/core) - Core artifacts and builders
- [`@open-form/types`](https://github.com/open-form/open-form/blob/main/packages/types) - TypeScript utilities and types
- [`@open-form/schemas`](https://github.com/open-form/open-form/blob/main/packages/schemas) - JSON Schema definitions
- [`@open-form/serialization`](https://github.com/open-form/open-form/blob/main/packages/serialization) - Locale-aware formatting
- [`@open-form/resolvers`](https://github.com/open-form/open-form/blob/main/packages/resolvers) - File and environment resolvers
- [`@open-form/renderers`](https://github.com/open-form/open-form/blob/main/packages/renderers) - All renderers (PDF, DOCX, Text)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read our [contribution guidelines](https://github.com/open-form/open-form/blob/main/CONTRIBUTING.md) and [code of conduct](https://github.com/open-form/open-form/blob/main/CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT license.

See [LICENSE](https://github.com/open-form/open-form/blob/main/LICENSE.md) for more information.
