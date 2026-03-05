<p align="center">
  <a href="https://open-form.dev?utm_source=github&utm_medium=ai-tools" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://assets.open-form.dev/logo-400x400.png" type="image/png">
      <img src="https://assets.open-form.dev/logo-400x400.png" height="64" alt="OpenForm logo">
    </picture>
  </a>
  <br />
</p>

<h1 align="center">@open-form/ai-tools</h1>

<div align="center">

[![OpenForm documentation](https://img.shields.io/badge/Documentation-OpenForm-red.svg)](https://docs.open-form.dev?utm_source=github&utm_medium=ai-tools)
[![Follow on Twitter](https://img.shields.io/twitter/follow/OpenFormHQ?style=social)](https://twitter.com/intent/follow?screen_name=OpenFormHQ)

</div>

[OpenForm](https://open-form.dev?utm_source=github&utm_medium=ai-tools) is **documents as code**. It lets developers and AI agents define, validate, and render business documents using typed, composable schemas. This eliminates template drift, broken mappings, and brittle glue code — while giving AI systems a reliable document layer they can safely read, reason over, and generate against in production workflows.

## Package overview

Framework-neutral AI tool definitions for OpenForm. Provides Zod input schemas, execute functions, and an HTTP registry client that any AI framework adapter can wrap.

- **5 tools** - validateArtifact, fill, render, getRegistry, getArtifact
- **No framework dependency** - Pure tool protocol, no AI SDK lock-in
- **3 render modes** - Render from artifact JSON, URL, or registry lookup
- **Registry client** - Fetch artifacts from any OpenForm registry over HTTPS
- **Edge-compatible** - Optional proxy text renderer for edge runtimes

This package is the foundation for `@open-form/ai-sdk` (Vercel AI SDK) and `@open-form/tanstack-ai` (TanStack AI). Advanced users can build custom adapters for other frameworks.

## Installation

```bash
npm install @open-form/ai-tools
```

## Usage

### Direct usage (no framework)

```typescript
import {
  executeValidateArtifact,
  executeFill,
  executeRender,
  executeGetRegistry,
  executeGetArtifact,
} from "@open-form/ai-tools";

// Fetch available artifacts from a registry
const registry = await executeGetRegistry({
  registryUrl: "https://public.open-form.dev",
});

// Fetch a specific artifact
const { artifact } = await executeGetArtifact({
  registryUrl: "https://public.open-form.dev",
  artifactName: "pet-addendum",
});

// Validate the artifact schema
const validation = executeValidateArtifact({ artifact });

// Fill with data and check for errors
const fillResult = executeFill({
  artifact,
  data: {
    fields: { petName: "Buddy", species: "dog", weight: 45 },
    parties: { tenant: { id: "t1", name: "Jane Doe" } },
  },
});

// Render to markdown (inline)
const rendered = await executeRender({
  source: "registry",
  registryUrl: "https://public.open-form.dev",
  artifactName: "pet-addendum",
  data: fillResult.data,
  layer: "markdown",
});
```

### Render modes

The render tool supports three input modes via discriminated union:

| Mode | Fields | Resolution |
|------|--------|------------|
| `source: 'artifact'` | `artifact`, `baseUrl?` | Direct - no fetch needed |
| `source: 'url'` | `url` | Fetches artifact JSON, derives baseUrl |
| `source: 'registry'` | `registryUrl`, `artifactName` | Fetches registry.json, then artifact |

### Configuration

```typescript
import type { OpenFormToolsConfig } from "@open-form/ai-tools";

const config: OpenFormToolsConfig = {
  defaultRegistryUrl: "https://public.open-form.dev",
  proxyTextRenderer: {
    url: "https://your-documents-service.example.com",
    apiKey: "your-api-key",
  },
  fetch: customFetchWithAuth,
};
```

### Edge compatibility

- **PDF and DOCX renderers** work everywhere (pure JS)
- **Text renderer** (Handlebars) requires Node.js. On edge runtimes, configure `proxyTextRenderer` to delegate to an HTTP service

## Tools

| Tool | Input | Output | Network? |
|------|-------|--------|----------|
| `validateArtifact` | `{artifact, options?}` | `{valid, detectedKind, issues?}` | No |
| `fill` | `{artifact, data}` | `{valid, artifactKind, data?, errors?}` | No |
| `render` | 3 modes (see above) | `{success, content, encoding, mimeType}` | Modes 2+3 |
| `getRegistry` | `{registryUrl}` | `{name, items[]}` | Yes |
| `getArtifact` | `{registryUrl, artifactName}` | `{artifact, artifactName}` | Yes |

## Changelog

View the [Changelog](https://github.com/open-form/open-form/blob/main/packages/ai-tools/CHANGELOG.md) for updates.

## Related packages

- [`@open-form/ai-sdk`](../ai-sdk) - Vercel AI SDK adapter
- [`@open-form/tanstack-ai`](../tanstack-ai) - TanStack AI adapter
- [`@open-form/sdk`](../sdk) - OpenForm framework SDK

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read our [contribution guidelines](https://github.com/open-form/open-form/blob/main/CONTRIBUTING.md) and [code of conduct](https://github.com/open-form/open-form/blob/main/CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT license.

See [LICENSE](https://github.com/open-form/open-form/blob/main/LICENSE.md) for more information.
