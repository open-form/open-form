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

OpenForm is an open-source framework for defining, validating, and rendering business documents as **versioned, structured artifacts**.

Instead of treating documents as opaque PDFs or Word files, OpenForm makes them explicit: typed, testable, deterministic, and composable—so both software and AI agents can work with them reliably, and developers get better abstraction and DX.

**Website:** https://open-form.dev  
**Documentation:** https://docs.open-form.dev

---

## At a Glance

```ts
import { open } from "@open-form/sdk";

// Define a form with fields and layers
const leaseAgreement = open
  .form()
  .name("residential-lease")
  .version("1.0.0")
  .title("Residential Lease Agreement")
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

// Fill with data (validates automatically)
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

// Render to multiple formats
const html = await filledLease.render({
  renderer: textRenderer,
  resolver,
  layer: "markdown",
});
const pdf = await filledLease.render({
  renderer: pdfRenderer,
  resolver,
  layer: "pdf",
});
```

---

## Why This Exists

Modern workflows still run on documents—but documents remain hostile to automation.

PDFs and Word files hide structure. Validation rules live in tribal knowledge. Versions drift silently. Even advanced AI models are forced to guess: which fields exist, which are required, which rules apply.

That breaks down completely in compliance-heavy domains. A document that _looks right_ but fails validation is still wrong. Compliance cannot be probabilistic.

AI agents need ground truth. Documents need structure.

---

## The OpenForm Model

OpenForm treats documents as **artifacts**, not files.

Each artifact has:

- a canonical, versioned definition
- explicit structure and constraints
- built-in validation
- deterministic rendering

OpenForm defines 4 core artifacts:

- **Document** — Static, versioned content (disclosures, pamphlets, regulations)
- **Form** — Dynamic content derived from structured fields and validation rules
- **Checklist** — Items with constrained states (boolean or multiselect)
- **Bundle** — Collections of artifacts that move together as a single unit

These artifacts are plain text files backed by schemas. They can be composed, versioned, published, and reused across systems.

Because structure and validation are explicit, AI agents can ingest artifacts, populate them, validate their own output, and retry until the result is correct—without guessing or prompt hacks.

---

## Composition Example

```ts
import { createFsResolver } from "@open-form/resolvers/fs";

// Combine forms, documents, and checklists into a bundle
const leaseBundle = open
  .bundle()
  .name("lease-application-package")
  .version("1.0.0")
  .items([
    { ref: leaseAgreement, key: "lease" },
    { ref: disclosureDocument, key: "disclosure" },
    { ref: verificationChecklist, key: "verification" },
  ])
  .build();

// Assemble all artifacts with resolver
const resolver = createFsResolver({ root: process.cwd() });
const assembled = await leaseBundle.assemble({ resolver });

// → Contains rendered documents, forms, checklists, and files
```

Bundles allow related documents to be reviewed, validated, and processed as a single unit—just like they are in real workflows.

---

## Installation

```bash
npm install @open-form/sdk
```

---

## Core Capabilities

- **Schema-first** — Explicit structure and constraints
- **Deterministic validation** — No best-effort parsing
- **Full type safety** — Types derived from schemas
- **Composable artifacts** — Model real document workflows
- **Multi-format rendering** — PDF, DOCX, HTML from one definition
- **Versioned by design** — Reproducible outputs over time
- **AI-compatible** — Built for agent ingestion and verification

---

## Who's is for

OpenForm is designed for systems where documents are not incidental—they _are_ the workflow:

- Insurance and risk
- Financial services and lending
- Legal and compliance
- HR and employment
- Immigration and government filings
- Trade, logistics, and customs

If documents must be correct, auditable, and repeatable, OpenForm fits.

---

## Packages

| Package                                              | Description                                        |
| ---------------------------------------------------- | -------------------------------------------------- |
| [@open-form/sdk](./packages/sdk)                     | Complete framework (recommended)                   |
| [@open-form/core](./packages/core)                   | Runtime, validation, artifacts                     |
| [@open-form/types](./packages/types)                 | Shared TypeScript types and utilities              |
| [@open-form/schemas](./packages/schemas)             | JSON Schema definitions                            |
| [@open-form/serialization](./packages/serialization) | Locale-aware serialization (Money, Address, Phone) |
| [@open-form/resolvers](./packages/resolvers)         | Filesystem and environment resolvers               |
| [@open-form/renderers](./packages/renderers)         | All renderers (PDF, DOCX, Text)                    |
| [@open-form/renderer-pdf](./packages/renderer-pdf)   | PDF rendering                                      |
| [@open-form/renderer-docx](./packages/renderer-docx) | DOCX rendering                                     |
| [@open-form/renderer-text](./packages/renderer-text) | Text and HTML rendering                            |

---

## License

[MIT](./LICENSE.md) © OpenForm
