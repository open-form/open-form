# @open-form/core

> Documents as Code - Define business documents, forms, and contracts as type-safe code

[![npm version](https://img.shields.io/npm/v/@open-form/core.svg)](https://www.npmjs.com/package/@open-form/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

OpenForm Core is a framework for defining structured business documents with:

- Type-safe schemas for forms, templates, checklists, and document bundles
- Rich field types (text, email, phone, address, money, coordinates, and more)
- Dynamic validation rules with an expression language
- Multi-format output (PDF, HTML, Markdown, DOCX)
- Full TypeScript inference from your document definitions

## Installation

```bash
npm install @open-form/core
# or
pnpm add @open-form/core
# or
yarn add @open-form/core
```

## Quick Start

### Define a Residential Lease Agreement

```typescript
import { open, type InferFormData } from "@open-form/core";

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
import { textRenderer } from "@open-form/renderers";
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

- [`@open-form/sdk`](../sdk) - Complete framework bundle

## License

MIT © [OpenForm](https://github.com/open-form)

## Acknowledgments

Built with these excellent libraries:

- [TypeBox](https://github.com/sinclairzx81/typebox) - JSON Schema Type Builder
- [AJV](https://ajv.js.org/) - JSON Schema validator
- [ajv-formats](https://github.com/ajv-validator/ajv-formats) - Format validation for AJV
- [Standard Schema](https://standardschema.dev/) - Standard interface for TypeScript schema validation
- [expr-eval-fork](https://github.com/jorenbroekema/expr-eval) - Mathematical expression evaluator
- [yaml](https://github.com/eemeli/yaml) - YAML parser and stringifier
