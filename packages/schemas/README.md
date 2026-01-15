# @open-form/schemas

> JSON Schema definitions for the OpenForm framework

[![npm version](https://img.shields.io/npm/v/@open-form/schemas.svg)](https://www.npmjs.com/package/@open-form/schemas)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This package provides the complete JSON Schema definition for OpenForm artifacts, blocks, and primitives. Use it with any JSON Schema validator to validate OpenForm documents.

## Installation

```bash
npm install @open-form/schemas
# or
pnpm add @open-form/schemas
# or
yarn add @open-form/schemas
```

## Usage

```typescript
import jsonSchema from "@open-form/schemas/schema.json";
import manifestSchema from "@open-form/schemas/manifest.json";
```

## Related Packages

- [`@open-form/sdk`](../sdk) - Complete framework bundle

## License

MIT © [OpenForm](https://github.com/open-form)

## Acknowledgments

Built with these excellent libraries:

- [TypeBox](https://github.com/sinclairzx81/typebox) - JSON Schema Type Builder
