<p align="center">
  <a href="https://open-form.dev?utm_source=github&utm_medium=essentials" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://assets.open-form.dev/logo-400x400.png" type="image/png">
      <img src="https://assets.open-form.dev/logo-400x400.png" height="64" alt="OpenForm logo">
    </picture>
  </a>
  <br />
</p>

<h1 align="center">@open-form/essentials</h1>

<div align="center">

[![OpenForm documentation](https://img.shields.io/badge/Documentation-OpenForm-red.svg)](https://docs.open-form.dev?utm_source=github&utm_medium=essentials)
[![Follow on Twitter](https://img.shields.io/twitter/follow/OpenFormHQ?style=social)](https://twitter.com/intent/follow?screen_name=OpenFormHQ)

</div>

[OpenForm](https://open-form.dev?utm_source=github&utm_medium=essentials) is **documents as code**. It lets developers and AI agents define, validate, and render business documents using typed, composable schemas.

## Package overview

A curated collection of ready-to-use OpenForm artifacts for commonly needed business forms. Install the package, import an artifact, fill it with data, and render it — no manual schema authoring required.

- **IRS** — W-9, W-8BEN, SS-4, 4506-T, 1099-NEC, 1099-MISC
- **NACHA** — ACH debit authorization, ACH credit authorization, ACH change, direct deposit, bank account info
- **USCIS** — I-9
- **HIPAA** — notices, authorizations
- **ACORD** — insurance forms
- **Business** — NDA and other general business agreements

Each artifact ships with pre-built layers (markdown, PDF where available) so you can render them immediately.

## Installation

```bash
npm install @open-form/essentials
```

## Usage

```typescript
import { irs } from "@open-form/essentials";

// Access the W-9 artifact
const w9 = irs.w9;

// Fill with data and render
const filled = w9.fill({
  fields: {
    name: "Jane Doe",
    taxClassification: "individual",
    // ...
  },
});
```

## Included artifacts

| Category | Artifacts |
|----------|-----------|
| IRS | W-9, W-8BEN, SS-4, 4506-T, 1099-NEC, 1099-MISC |
| NACHA | ACH debit authorization, ACH credit authorization, ACH change, direct deposit, bank account info |
| USCIS | I-9 |
| HIPAA | *(coming soon)* |
| ACORD | *(coming soon)* |
| Business | NDA |

## Changelog

View the [Changelog](https://github.com/open-form/open-form/blob/main/packages/essentials/CHANGELOG.md) for updates.

## Related packages

- [`@open-form/core`](../core) - Core builders and validation
- [`@open-form/sdk`](../sdk) - Complete framework with renderers
- [`@open-form/types`](../types) - TypeScript utilities and types
- [`@open-form/schemas`](../schemas) - JSON Schema definitions
- [`@open-form/renderers`](../renderers) - All renderers (PDF, DOCX, Text)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read our [contribution guidelines](https://github.com/open-form/open-form/blob/main/CONTRIBUTING.md) and [code of conduct](https://github.com/open-form/open-form/blob/main/CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT license.

See [LICENSE](https://github.com/open-form/open-form/blob/main/LICENSE.md) for more information.
