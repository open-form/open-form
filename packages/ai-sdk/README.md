<p align="center">
  <a href="https://open-form.dev?utm_source=github&utm_medium=ai-sdk" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://assets.open-form.dev/logo-400x400.png" type="image/png">
      <img src="https://assets.open-form.dev/logo-400x400.png" height="64" alt="OpenForm logo">
    </picture>
  </a>
  <br />
</p>

<h1 align="center">@open-form/ai-sdk</h1>

<div align="center">

[![OpenForm documentation](https://img.shields.io/badge/Documentation-OpenForm-red.svg)](https://docs.open-form.dev?utm_source=github&utm_medium=ai-sdk)
[![Follow on Twitter](https://img.shields.io/twitter/follow/OpenFormHQ?style=social)](https://twitter.com/intent/follow?screen_name=OpenFormHQ)

</div>

[OpenForm](https://open-form.dev?utm_source=github&utm_medium=ai-sdk) is **documents as code**. It lets developers and AI agents define, validate, and render business documents using typed, composable schemas. This eliminates template drift, broken mappings, and brittle glue code — while giving AI systems a reliable document layer they can safely read, reason over, and generate against in production workflows.

## Package overview

Vercel AI SDK adapter for OpenForm tools. Wraps `@open-form/ai-tools` with AI SDK `tool()` for use with `generateText`, `streamText`, and other AI SDK functions.

- **5 tools** - validateArtifact, fill, render, getRegistry, getArtifact
- **Drop-in integration** - Works with any AI SDK-compatible model
- **Typed schemas** - Zod v4 input schemas with full type inference
- **Peer dependency** - Requires `ai` ^6.0.0

## Installation

```bash
npm install @open-form/ai-sdk ai zod
```

## Usage

```typescript
import { openFormTools } from "@open-form/ai-sdk";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const tools = openFormTools({
  defaultRegistryUrl: "https://public.open-form.dev",
});

const result = await generateText({
  model: openai("gpt-4o"),
  tools,
  prompt: "Fill the pet addendum for my dog Rex, 30 lbs, vaccinated",
});
```

### With streaming

```typescript
import { streamText } from "ai";

const result = streamText({
  model: openai("gpt-4o"),
  tools: openFormTools(),
  prompt: "What artifacts are available in the public registry?",
});

for await (const part of result.textStream) {
  process.stdout.write(part);
}
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

View the [Changelog](https://github.com/open-form/open-form/blob/main/packages/ai-sdk/CHANGELOG.md) for updates.

## Related packages

- [`@open-form/ai-tools`](../ai-tools) - Core tool protocol (framework-neutral)
- [`@open-form/tanstack-ai`](../tanstack-ai) - TanStack AI adapter
- [`@open-form/sdk`](../sdk) - OpenForm framework SDK

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read our [contribution guidelines](https://github.com/open-form/open-form/blob/main/CONTRIBUTING.md) and [code of conduct](https://github.com/open-form/open-form/blob/main/CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT license.

See [LICENSE](https://github.com/open-form/open-form/blob/main/LICENSE.md) for more information.
