# @open-form/resolvers

> Environment-specific resolvers for OpenForm

[![npm version](https://img.shields.io/npm/v/@open-form/resolvers.svg)](https://www.npmjs.com/package/@open-form/resolvers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Resolvers for loading content from different storage backends. Use these to read layer files, templates, and other assets in your OpenForm applications.

## Features

- 📂 **Filesystem resolver** - Read files from the local filesystem (Node.js)
- 🌲 **Tree-shakeable** - Import only what you need via subpath exports
- ✅ **Type-safe** - Full TypeScript support
- 🔌 **Pluggable** - Implements the `Resolver` interface from `@open-form/types`

## Installation

```bash
npm install @open-form/resolvers
# or
pnpm add @open-form/resolvers
# or
yarn add @open-form/resolvers
```

## Usage

### Filesystem resolver (Node.js)

```typescript
import { createFsResolver } from "@open-form/resolvers/fs";

const resolver = createFsResolver({ root: process.cwd() });

// Read a file relative to root
const bytes = await resolver.read("/templates/form.md");
```

### Umbrella import

```typescript
import { createFsResolver } from "@open-form/resolvers";

const resolver = createFsResolver({ root: "/path/to/project" });
```

### With OpenForm core

```typescript
import { createFsResolver } from "@open-form/resolvers/fs";
import { resolveFormLayer } from "@open-form/core";

const resolver = createFsResolver({ root: process.cwd() });

// Resolve a file-based layer from a form
const template = await resolveFormLayer(form, resolver, "default");
```

## Available Resolvers

### Filesystem (`./fs`)

For Node.js environments. Reads files from the local filesystem.

```typescript
import { createFsResolver } from "@open-form/resolvers/fs";

const resolver = createFsResolver({
  root: "/absolute/path/to/project",
});
```

### Memory resolver (in core)

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

## Resolver Interface

All resolvers implement the `Resolver` interface from `@open-form/types`:

```typescript
interface Resolver {
  read(path: string): Promise<Uint8Array>;
}
```

## Related Packages

- [`@open-form/sdk`](../sdk) - Complete framework bundle

## License

MIT
