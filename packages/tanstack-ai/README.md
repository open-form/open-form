<p align="center">
  <a href="https://open-form.dev?utm_source=github&utm_medium=tanstack-ai" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://assets.open-form.dev/logo-400x400.png" type="image/png">
      <img src="https://assets.open-form.dev/logo-400x400.png" height="64" alt="OpenForm logo">
    </picture>
  </a>
  <br />
</p>

<h1 align="center">@open-form/tanstack-ai</h1>

<div align="center">

[![OpenForm documentation](https://img.shields.io/badge/Documentation-OpenForm-red.svg)](https://docs.open-form.dev?utm_source=github&utm_medium=tanstack-ai)
[![Follow on Twitter](https://img.shields.io/twitter/follow/OpenFormHQ?style=social)](https://twitter.com/intent/follow?screen_name=OpenFormHQ)

</div>

[OpenForm](https://open-form.dev?utm_source=github&utm_medium=tanstack-ai) is **documents as code**. It lets developers and AI agents define, validate, and render business documents using typed, composable schemas. This eliminates template drift, broken mappings, and brittle glue code — while giving AI systems a reliable document layer they can safely read, reason over, and generate against in production workflows.

## Package overview

TanStack AI adapter for OpenForm tools. Wraps `@open-form/ai-tools` with `toolDefinition().server()` for use with TanStack AI's chat, agent, and server handler APIs.

- **5 tools** - validateArtifact, fill, render, getRegistry, getArtifact
- **Server-side execution** - Tools run on the server via `.server()` pattern
- **Typed schemas** - Zod v4 input schemas with full type inference
- **Peer dependency** - Requires `@tanstack/ai`

## Installation

```bash
npm install @open-form/tanstack-ai @tanstack/ai zod
```

## Usage

```typescript
import { openFormTools } from "@open-form/tanstack-ai";

const tools = openFormTools({
  defaultRegistryUrl: "https://public.open-form.dev",
});

// Use with TanStack AI's chat, agent, or server handler
```

### Configuration

```typescript
const tools = openFormTools({
  defaultRegistryUrl: "https://public.open-form.dev",
  proxyTextRenderer: {
    url: "https://your-documents-service.example.com",
    apiKey: "your-api-key",
  },
  fetch: customFetchWithAuth,
});
```

## Tools provided

| Tool | Description |
|------|-------------|
| `validateArtifact` | Validates an OpenForm artifact against its schema |
| `fill` | Fills an OpenForm artifact with data and validates |
| `render` | Renders an OpenForm artifact to PDF, markdown, or DOCX |
| `getRegistry` | Fetches registry.json from a URL, returns available artifacts |
| `getArtifact` | Fetches artifact JSON from a registry by name |

## Changelog

View the [Changelog](https://github.com/open-form/open-form/blob/main/packages/tanstack-ai/CHANGELOG.md) for updates.

## Related packages

- [`@open-form/ai-tools`](../ai-tools) - Core tool protocol (framework-neutral)
- [`@open-form/ai-sdk`](../ai-sdk) - Vercel AI SDK adapter
- [`@open-form/sdk`](../sdk) - OpenForm framework SDK

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read our [contribution guidelines](https://github.com/open-form/open-form/blob/main/CONTRIBUTING.md) and [code of conduct](https://github.com/open-form/open-form/blob/main/CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT license.

See [LICENSE](https://github.com/open-form/open-form/blob/main/LICENSE.md) for more information.
