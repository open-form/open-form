<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/open-form-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="./assets/open-form.svg" />
    <img src="./assets/open-form.svg" alt="OpenForm" width="280" />
  </picture>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@open-form/sdk">
    <img src="https://img.shields.io/npm/v/@open-form/sdk.svg" alt="npm version" />
  </a>
  <a href="https://github.com/open-form/open-form/blob/main/LICENSE.md">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" />
  </a>
</p>

# OpenForm

**Documents as Code for the AI era.**

OpenForm is an open-source framework for defining, validating, and rendering business documents as **versioned, structured artifacts**. Instead of treating documents as opaque PDFs or Word files, OpenForm makes them explicit: typed, testable, deterministic, and composable—so both software and AI agents can work with them reliably.

**Website:** https://open-form.dev
**Documentation:** https://docs.open-form.dev

## Why This Exists

Modern workflows still run on documents—but documents remain hostile to automation.

PDFs and Word files hide structure. Validation rules live in tribal knowledge. Versions drift silently. Even advanced AI models are forced to guess: which fields exist, which are required, which rules apply.

That breaks down completely in compliance-heavy domains. A document that _looks right_ but fails validation is still wrong. Compliance cannot be probabilistic.

AI agents need ground truth. Documents need structure.

## What You Can Build

**Type-safe forms** with fields, validation, signatures, and file attachments. Define once, render to PDF, DOCX, HTML, or custom formats—all from one definition.

**Versioned documents** with explicit metadata and deterministic rendering. No more hidden changes or undefined compliance states.

**Workflow checklists** that track items with constrained states for onboarding, reviews, or any process requiring validation.

**Bundled collections** that combine forms, documents, and checklists into complete packages matching real-world workflows.

## Quick Start

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
    markdown: { kind: "file", path: "fixtures/lease-agreement.md", mimeType: "text/markdown" },
    html: { kind: "file", path: "fixtures/lease-agreement.html", mimeType: "text/html" },
  })
  .parties({
    landlord: open.party().label("Landlord").signature((sig) => sig.required()),
    tenant: open.party().label("Tenant").multiple(true).min(1).max(4).signature((sig) => sig.required()),
  })
  .fields({
    leaseId: { type: "uuid", label: "Lease ID" },
    propertyAddress: { type: "address", label: "Property Address", required: true },
    monthlyRent: { type: "money", label: "Monthly Rent", required: true },
    leaseStartDate: { type: "date", label: "Lease Start Date", required: true },
  })
  .build();

// Fill with data (validates automatically)
const filledLease = leaseAgreement.fill({
  leaseId: "550e8400-e29b-41d4-a716-446655440000",
  propertyAddress: { line1: "123 Main St", locality: "Portland", region: "OR", postalCode: "97201", country: "USA" },
  monthlyRent: { amount: 1500, currency: "USD" },
  leaseStartDate: new Date("2024-02-01"),
});

// Render to multiple formats
const resolver = createFsResolver({ root: process.cwd() });
const markdown = await filledLease.render({ renderer: textRenderer, resolver, layer: "markdown" });
const html = await filledLease.render({ renderer: textRenderer, resolver, layer: "html" });
```

## Core Features

- **Schema-first** — Explicit structure and constraints for all documents
- **Type-safe** — TypeScript types automatically derived from schemas
- **Deterministic validation** — No guessing or best-effort parsing
- **Composable** — Reuse fields, forms, and artifacts across definitions
- **Multi-format rendering** — PDF, DOCX, HTML, Text from one definition
- **Versioned by design** — Reproducible outputs over time
- **AI-compatible** — Built for agent ingestion, reasoning, and verification

## The OpenForm Model

OpenForm treats documents as **artifacts**—not files. Each artifact has:

- A canonical, versioned definition (as code)
- Explicit structure and constraints
- Built-in validation
- Deterministic rendering across formats

**4 Core Artifact Types:**

- **Form** — Dynamic documents with fields, validation, signatures, and file requirements
- **Document** — Static versioned content (disclosures, policies, regulations)
- **Checklist** — Items with constrained states for workflow tracking
- **Bundle** — Collections of artifacts that move together as units

Because structure is explicit and validation is deterministic, AI agents can reliably ingest artifacts, populate them, validate output, and retry until correct—without prompting hacks or guessing.

## Composition Example

```typescript
import { open } from "@open-form/sdk";

// Define reusable fields
const propertyAddress = { type: "address", label: "Property Address", required: true };
const monthlyRent = { type: "money", label: "Monthly Rent", required: true };

// Define a form
const leaseAgreement = open
  .form()
  .name("residential-lease-agreement")
  .version("1.0.0")
  .defaultLayer("markdown")
  .layers({ markdown: { kind: "file", path: "fixtures/lease.md", mimeType: "text/markdown" } })
  .fields({ leaseId: { type: "uuid" }, propertyAddress, monthlyRent })
  .build();

// Define a static document
const leadPaintDisclosure = open
  .document()
  .name("lead-paint-disclosure")
  .version("1.0.0")
  .title("Lead Paint Disclosure")
  .code("EPA-747-K-12-001")
  .layers({
    pdf: open.layer().file().path("fixtures/lead-paint.pdf").mimeType("application/pdf"),
  })
  .defaultLayer("pdf")
  .build();

// Bundle them together
const leaseBundle = open
  .bundle()
  .name("residential-lease-bundle")
  .version("1.0.0")
  .contents([
    { type: "inline", key: "leaseAgreement", artifact: leaseAgreement.schema },
    { type: "inline", key: "leadPaintDisclosure", artifact: leadPaintDisclosure.schema },
  ])
  .build();
```

Bundles let you group related documents and process them as a single unit—just like real workflows require.

## Installation

```bash
npm install @open-form/sdk
```

## Who It's For

OpenForm is designed for systems where documents are core to the workflow:

- **Insurance & Risk** — Policies, underwriting forms, claims documentation
- **Financial Services & Lending** — Applications, disclosures, agreements
- **Legal & Compliance** — Contracts, regulatory filings, compliance documents
- **HR & Employment** — Offers, agreements, onboarding checklists
- **Immigration & Government** — Filings, visas, regulatory submissions
- **Trade & Logistics** — Bills of lading, customs declarations, shipment docs

If documents must be correct, auditable, and repeatable, OpenForm fits.

## Packages

| Package | Description |
|---------|-------------|
| [@open-form/sdk](./packages/sdk) | Complete framework (start here) |
| [@open-form/core](./packages/core) | Core artifacts, builders, validation |
| [@open-form/types](./packages/types) | TypeScript types and utilities |
| [@open-form/schemas](./packages/schemas) | JSON Schema definitions |
| [@open-form/serialization](./packages/serialization) | Locale-aware formatting (Money, Address, Phone) |
| [@open-form/resolvers](./packages/resolvers) | File and environment resolvers |
| [@open-form/renderers](./packages/renderers) | All renderers in one package |
| [@open-form/renderer-pdf](./packages/renderer-pdf) | PDF rendering and form filling |
| [@open-form/renderer-docx](./packages/renderer-docx) | DOCX rendering |
| [@open-form/renderer-text](./packages/renderer-text) | Text and HTML rendering |

## Getting Started

- **Start with SDK** — Install `@open-form/sdk` and follow the quick start above
- **Read the docs** — Head to [docs.open-form.dev](https://docs.open-form.dev) for tutorials and API reference
- **Explore examples** — Check out the full leasing demo in `/incubator/apps/demo/src/demos/leasing`
- **Contribute** — Read [CONTRIBUTING.md](./CONTRIBUTING.md)

## Changelog

View the changelogs for each package in the individual package directories.

## Related packages

| Package | Description |
|---------|-------------|
| [@open-form/sdk](./packages/sdk) | Complete framework (start here) |
| [@open-form/core](./packages/core) | Core artifacts, builders, validation |
| [@open-form/types](./packages/types) | TypeScript types and utilities |
| [@open-form/schemas](./packages/schemas) | JSON Schema definitions |
| [@open-form/serialization](./packages/serialization) | Locale-aware formatting (Money, Address, Phone) |
| [@open-form/resolvers](./packages/resolvers) | File and environment resolvers |
| [@open-form/renderers](./packages/renderers) | All renderers in one package |
| [@open-form/renderer-pdf](./packages/renderer-pdf) | PDF rendering and form filling |
| [@open-form/renderer-docx](./packages/renderer-docx) | DOCX rendering |
| [@open-form/renderer-text](./packages/renderer-text) | Text and HTML rendering |

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read our [contribution guidelines](./CONTRIBUTING.md) and [code of conduct](./CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT license.

See [LICENSE](./LICENSE.md) for more information.
