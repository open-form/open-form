<p align="center">
  <a href="https://open-form.dev?utm_source=github&utm_medium=schemas" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://assets.open-form.dev/logo-400x400.png" type="image/png">
      <img src="https://assets.open-form.dev/logo-400x400.png" height="64" alt="OpenForm logo">
    </picture>
  </a>
  <br />
</p>

<h1 align="center">@open-form/schemas</h1>

<div align="center">

[![OpenForm documentation](https://img.shields.io/badge/Documentation-OpenForm-red.svg)](https://docs.open-form.dev?utm_source=github&utm_medium=schemas)
[![Follow on Twitter](https://img.shields.io/twitter/follow/OpenFormHQ?style=social)](https://twitter.intent/follow?screen_name=OpenFormHQ)

</div>

[OpenForm](https://open-form.dev?utm_source=github&utm_medium=schemas) is **documents as code**. It lets developers and AI agents define, validate, and render business documents using typed, composable schemas. This eliminates template drift, broken mappings, and brittle glue code — while giving AI systems a reliable document layer they can safely read, reason over, and generate against in production workflows.

## Package overview

Zod schemas for OpenForm artifacts, forms, documents, and primitives.

## Installation

```bash
npm install @open-form/schemas
```

## Usage

```typescript
import { FormSchema, DocumentSchema, BundleSchema } from "@open-form/schemas";

// Validate form data
const result = FormSchema.safeParse(myFormData);
if (!result.success) {
  console.log(result.error.issues);
}

// Parse and validate (throws on error)
const form = FormSchema.parse(myFormData);
```

## Changelog

View the [Changelog](https://github.com/open-form/open-form/blob/main/packages/schemas/CHANGELOG.md) for updates.

## Related packages

- [`@open-form/sdk`](../sdk) - OpenForm framework SDK

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read our [contribution guidelines](https://github.com/open-form/open-form/blob/main/CONTRIBUTING.md) and [code of conduct](https://github.com/open-form/open-form/blob/main/CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT license.

See [LICENSE](https://github.com/open-form/open-form/blob/main/LICENSE.md) for more information.

## Acknowledgments

Built with these excellent libraries:

- [Zod](https://github.com/colinhacks/zod) - TypeScript-first schema validation
