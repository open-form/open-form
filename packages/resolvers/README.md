<p align="center">
  <a href="https://open-form.dev?utm_source=github&utm_medium=resolvers" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://assets.open-form.dev/logo-400x400.png" type="image/png">
      <img src="https://assets.open-form.dev/logo-400x400.png" height="64" alt="OpenForm logo">
    </picture>
  </a>
  <br />
</p>

<h1 align="center">@open-form/resolvers</h1>

<div align="center">

[![OpenForm documentation](https://img.shields.io/badge/Documentation-OpenForm-red.svg)](https://docs.open-form.dev?utm_source=github&utm_medium=resolvers)
[![Follow on Twitter](https://img.shields.io/twitter/follow/OpenFormHQ?style=social)](https://twitter.com/intent/follow?screen_name=OpenFormHQ)

</div>

[OpenForm](https://open-form.dev?utm_source=github&utm_medium=resolvers) is **documents as code**. It lets developers and AI agents define, validate, and render business documents using typed, composable schemas. This eliminates template drift, broken mappings, and brittle glue code — while giving AI systems a reliable document layer they can safely read, reason over, and generate against in production workflows.

## Package overview

Environment-specific resolvers for OpenForm. Use these to read layer files, templates, and other assets in your OpenForm applications.

- 📂 **Filesystem resolver** - Read files from the local filesystem (Node.js)
- 🌲 **Tree-shakeable** - Import only what you need via subpath exports
- ✅ **Type-safe** - Full TypeScript support
- 🔌 **Pluggable** - Implements the `Resolver` interface from `@open-form/types`

## Installation

```bash
npm install @open-form/resolvers
```

## Usage

### Filesystem resolver

Create a resolver to read files from your filesystem:

```typescript
import { createFsResolver } from "@open-form/resolvers/fs";

const resolver = createFsResolver({ root: process.cwd() });

// Read a file relative to root
const bytes = await resolver.read("/templates/form.md");
```

### With form rendering

Pass a resolver when rendering forms with file-based layers:

```typescript
import { open } from "@open-form/sdk";
import { pdfRenderer } from "@open-form/renderer-pdf";
import { createFsResolver } from "@open-form/resolvers/fs";

const resolver = createFsResolver({ root: "./templates" });

const result = await form
  .fill({
    fields: {
      /* ... */
    },
  })
  .render({
    renderer: pdfRenderer,
    resolver,
    layer: "pdf",
  });
```

### Using subpath imports

For better tree-shaking, import directly from subpaths:

```typescript
// Recommended - direct subpath import
import { createFsResolver } from "@open-form/resolvers/fs";

// Or use umbrella import
import { createFsResolver } from "@open-form/resolvers";
```

### Memory resolver for testing

For testing and browser environments, use `createMemoryResolver` from `@open-form/core`:

```typescript
import { createMemoryResolver } from "@open-form/core";

const resolver = createMemoryResolver({
  contents: {
    "/templates/form.md": "# {{title}}",
    "/assets/logo.png": myLogoBytes,
  },
});
```

## Changelog

View the [Changelog](https://github.com/open-form/open-form/blob/main/packages/resolvers/CHANGELOG.md) for updates.

## Related packages

- [`@open-form/sdk`](../sdk) - OpenForm framework SDK
- [`@open-form/core`](../core) - Core framework with memory resolver for testing

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read our [contribution guidelines](https://github.com/open-form/open-form/blob/main/CONTRIBUTING.md) and [code of conduct](https://github.com/open-form/open-form/blob/main/CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT license.

See [LICENSE](https://github.com/open-form/open-form/blob/main/LICENSE.md) for more information.
