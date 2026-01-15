// packages/core/src/runtime/resolver.ts

import type {
  Bundle,
  BundleContentItem,
  Form,
  Document,
  Checklist,
  BinaryContent,
  CondExpr,
  Resolver,
} from '@open-form/types'

/**
 * A resolved artifact loaded from a path or slug.
 * Note: Bundle is recursive, so a resolved Bundle may contain nested Bundles.
 */
export type ResolvedArtifact = Form | Document | Checklist | Bundle

/**
 * Extension of Resolver that can also resolve artifact definitions.
 *
 * Implementations handle:
 *  - Reading raw bytes (inherited from Resolver)
 *  - Loading and parsing YAML/JSON artifact files
 *  - Resolving slugs to artifacts (e.g., from a registry)
 */
export interface ArtifactResolver extends Resolver {
  /**
   * Load an artifact from a path.
   * The path is relative to some base directory or can be a URL.
   */
  loadArtifact(path: string): Promise<ResolvedArtifact>

  /**
   * Load an artifact by its slug (e.g., "@acme/forms/application").
   * This requires access to a registry or resolver service.
   */
  loadArtifactBySlug?(slug: string): Promise<ResolvedArtifact>
}

/**
 * A single content item from a bundle after resolution.
 */
export interface ResolvedBundleContent {
  /** The key identifying this content item */
  key: string
  /** The resolved artifact */
  artifact: ResolvedArtifact
  /** Original include condition */
  include?: CondExpr
}

/**
 * A fully resolved bundle with all contents loaded.
 */
export interface ResolvedBundle {
  /** The original bundle definition */
  bundle: Bundle
  /** All resolved content items */
  contents: ResolvedBundleContent[]
}

/**
 * Determine if a BundleContentItem is inline (has embedded artifact).
 */
function isInlineContent(
  item: BundleContentItem
): item is { type: 'inline'; key: string; artifact: Document | Form | Checklist | Bundle } {
  return item.type === 'inline'
}

/**
 * Determine if a BundleContentItem is a path reference.
 */
function isPathContent(
  item: BundleContentItem
): item is { type: 'path'; key: string; path: string; include?: CondExpr } {
  return item.type === 'path'
}

/**
 * Determine if a BundleContentItem is a registry reference.
 */
function isRegistryContent(
  item: BundleContentItem
): item is { type: 'registry'; key: string; slug: string; include?: CondExpr } {
  return item.type === 'registry'
}

/**
 * Check if a resolver has loadArtifact capability.
 */
function isArtifactResolver(resolver: Resolver | ArtifactResolver): resolver is ArtifactResolver {
  return 'loadArtifact' in resolver && typeof resolver.loadArtifact === 'function'
}

/**
 * Resolve a single BundleContentItem to its artifact.
 */
export async function resolveBundleContentItem(
  item: BundleContentItem,
  resolver: Resolver | ArtifactResolver
): Promise<ResolvedBundleContent> {
  // 1. Inline artifact - already resolved (no loadArtifact needed)
  if (isInlineContent(item)) {
    return {
      key: item.key,
      artifact: item.artifact,
      include: undefined, // Inline items don't have include conditions
    }
  }

  // 2. Path-based reference - requires loadArtifact
  if (isPathContent(item)) {
    if (!isArtifactResolver(resolver)) {
      throw new Error(
        `Cannot resolve path "${item.path}": resolver does not support loadArtifact. ` +
          `Use inline artifacts or provide an ArtifactResolver.`
      )
    }
    const artifact = await resolver.loadArtifact(item.path)
    return {
      key: item.key,
      artifact,
      include: item.include,
    }
  }

  // 3. Registry-based reference (slug) - requires loadArtifactBySlug
  if (isRegistryContent(item)) {
    if (!isArtifactResolver(resolver) || !resolver.loadArtifactBySlug) {
      throw new Error(
        `Cannot resolve slug "${item.slug}": resolver does not support slug resolution. ` +
          `Use a path reference or provide a resolver with loadArtifactBySlug support.`
      )
    }
    const artifact = await resolver.loadArtifactBySlug(item.slug)
    return {
      key: item.key,
      artifact,
      include: item.include,
    }
  }

  throw new Error(`Invalid BundleContentItem: missing type discriminator`)
}

/**
 * Resolve all contents of a bundle sequentially.
 *
 * @param bundle - The bundle to resolve
 * @param resolver - The resolver for loading artifacts
 * @returns A ResolvedBundle with all contents loaded
 */
export async function resolveBundleContents(
  bundle: Bundle,
  resolver: Resolver | ArtifactResolver
): Promise<ResolvedBundle> {
  const resolvedContents: ResolvedBundleContent[] = []

  for (const item of bundle.contents) {
    const resolved = await resolveBundleContentItem(item, resolver)
    resolvedContents.push(resolved)
  }

  return {
    bundle,
    contents: resolvedContents,
  }
}

/**
 * Resolve bundle contents in parallel for better performance.
 *
 * @param bundle - The bundle to resolve
 * @param resolver - The resolver for loading artifacts
 * @returns A ResolvedBundle with all contents loaded
 */
export async function resolveBundleContentsParallel(
  bundle: Bundle,
  resolver: Resolver | ArtifactResolver
): Promise<ResolvedBundle> {
  const resolvedContents = await Promise.all(
    bundle.contents.map((item) => resolveBundleContentItem(item, resolver))
  )

  return {
    bundle,
    contents: resolvedContents,
  }
}

/**
 * Create a simple ArtifactResolver from a Resolver and a loader function.
 *
 * This is a convenience helper for creating artifact resolvers without
 * implementing the full interface from scratch.
 *
 * @param resolver - A Resolver for reading raw bytes
 * @param loader - A function that loads and parses artifacts from raw content
 * @returns An ArtifactResolver
 */
export function createArtifactResolver(
  resolver: Resolver,
  loader: (path: string, content: BinaryContent) => Promise<ResolvedArtifact> | ResolvedArtifact
): ArtifactResolver {
  return {
    read: (path: string) => resolver.read(path),
    loadArtifact: async (path: string) => {
      const content = await resolver.read(path)
      return loader(path, content)
    },
  }
}

/**
 * @deprecated Use createArtifactResolver instead.
 */
export const createResolver = createArtifactResolver

// ============================================================================
// Bundle Assembly Types
// ============================================================================

/**
 * A single assembled item in a bundle.
 * Contains either rendered output (for forms) or resolved layer content (for documents).
 */
export interface AssembledBundleItem {
  /** The key identifying this content item */
  key: string
  /** The kind of artifact */
  kind: 'form' | 'document' | 'checklist' | 'bundle'
  /** The original artifact definition */
  artifact: ResolvedArtifact
  /** Rendered output (for forms with layers) */
  rendered?: BinaryContent
  /** Layer content (for documents) */
  layerContent?: BinaryContent
  /** Filename for this item */
  filename?: string
  /** MIME type for this item */
  mimeType?: string
  /** Nested assembled items (for nested bundles) */
  nestedItems?: AssembledBundleItem[]
}

/**
 * A fully assembled bundle ready for output.
 */
export interface AssembledBundle {
  /** The original bundle definition */
  bundle: Bundle
  /** All assembled items */
  items: AssembledBundleItem[]
}

/**
 * Options for bundle assembly.
 */
export interface BundleAssemblyOptions<Data = unknown> {
  /** Resolver for loading files. Only needs loadArtifact if bundle has path/registry content. */
  resolver: Resolver | ArtifactResolver
  /** Data to use when rendering forms, keyed by content key */
  formData?: Record<string, Data>
  /** Function to render a form with its layer and data */
  renderForm?: (
    form: Form,
    data: Data,
    resolver: Resolver
  ) => Promise<{ content: BinaryContent; filename: string; mimeType: string }>
  /** Whether to include document layer bytes */
  includeDocumentBytes?: boolean
  /** Whether to recursively assemble nested bundles */
  assembleNestedBundles?: boolean
}

/**
 * Assemble a bundle by resolving all contents and optionally rendering forms.
 *
 * @param bundle - The bundle to assemble
 * @param options - Assembly options including resolver, form data, and renderer
 * @returns An AssembledBundle with all items ready for output
 */
export async function assembleBundle<Data = unknown>(
  bundle: Bundle,
  options: BundleAssemblyOptions<Data>
): Promise<AssembledBundle> {
  const {
    resolver,
    formData = {},
    renderForm,
    includeDocumentBytes = true,
    assembleNestedBundles = true,
  } = options

  // First, resolve all contents
  const resolved = await resolveBundleContentsParallel(bundle, resolver)

  // Then assemble each item
  const items: AssembledBundleItem[] = []

  for (const content of resolved.contents) {
    const { artifact } = content

    if (artifact.kind === 'form') {
      const form = artifact as Form
      const data = formData[content.key] as Data | undefined

      const item: AssembledBundleItem = {
        key: content.key,
        kind: 'form',
        artifact: form,
      }

      // If we have a renderer and data, render the form
      if (renderForm && data !== undefined) {
        const result = await renderForm(form, data, resolver)
        item.rendered = result.content
        item.filename = result.filename
        item.mimeType = result.mimeType
      }

      items.push(item)
    } else if (artifact.kind === 'document') {
      const doc = artifact as Document
      const item: AssembledBundleItem = {
        key: content.key,
        kind: 'document',
        artifact: doc,
      }

      // Load the default layer content if available and requested
      if (includeDocumentBytes && doc.layers && doc.defaultLayer) {
        const layer = doc.layers[doc.defaultLayer]
        if (layer) {
          item.mimeType = layer.mimeType
          if (layer.kind === 'inline') {
            // Inline layer - convert text to bytes
            item.layerContent = new TextEncoder().encode(layer.text)
          } else if (layer.kind === 'file') {
            // File layer - load from path
            try {
              item.layerContent = await resolver.read(layer.path)
              item.filename = layer.path.split('/').pop()
            } catch (_err) {
              console.warn(`Could not load document layer file: ${layer.path}`)
            }
          }
        }
      }

      items.push(item)
    } else if (artifact.kind === 'checklist') {
      const checklist = artifact as Checklist
      items.push({
        key: content.key,
        kind: 'checklist',
        artifact: checklist,
      })
    } else if (artifact.kind === 'bundle') {
      const nestedBundle = artifact as Bundle
      const item: AssembledBundleItem = {
        key: content.key,
        kind: 'bundle',
        artifact: nestedBundle,
      }

      // Recursively assemble nested bundles if requested
      if (assembleNestedBundles) {
        const nestedAssembled = await assembleBundle(nestedBundle, options)
        item.nestedItems = nestedAssembled.items
      }

      items.push(item)
    }
  }

  return {
    bundle,
    items,
  }
}

/**
 * Create a ZIP archive from an assembled bundle.
 *
 * This is a helper type definition - actual implementation requires a ZIP library.
 * Use this with your preferred ZIP implementation (e.g., AdmZip, JSZip, archiver).
 */
export interface ZipEntry {
  /** Path within the ZIP file */
  path: string
  /** Content to add to the ZIP */
  content: BinaryContent | string
}

/**
 * Convert an assembled bundle to ZIP entries.
 *
 * @param assembled - The assembled bundle
 * @param prefix - Optional prefix for nested bundles
 * @returns Array of ZIP entries ready for archiving
 */
export function assembledBundleToZipEntries(
  assembled: AssembledBundle,
  prefix = ''
): ZipEntry[] {
  const entries: ZipEntry[] = []

  for (const item of assembled.items) {
    if (item.kind === 'form' && item.rendered && item.filename) {
      entries.push({
        path: `${prefix}forms/${item.filename}`,
        content: item.rendered,
      })
    } else if (item.kind === 'document' && item.layerContent) {
      const filename = item.filename || `${item.key}.bin`
      entries.push({
        path: `${prefix}documents/${filename}`,
        content: item.layerContent,
      })
    } else if (item.kind === 'checklist') {
      entries.push({
        path: `${prefix}checklists/${item.key}.json`,
        content: JSON.stringify(item.artifact, null, 2),
      })
    } else if (item.kind === 'bundle' && item.nestedItems) {
      // Recursively add nested bundle entries
      const nestedAssembled: AssembledBundle = {
        bundle: item.artifact as Bundle,
        items: item.nestedItems,
      }
      const nestedEntries = assembledBundleToZipEntries(
        nestedAssembled,
        `${prefix}bundles/${item.key}/`
      )
      entries.push(...nestedEntries)
    }
  }

  // Add bundle manifest
  const manifest = {
    bundle: {
      name: assembled.bundle.name,
      version: assembled.bundle.version,
      title: assembled.bundle.title,
      description: assembled.bundle.description,
    },
    contents: assembled.items.map((item) => ({
      key: item.key,
      kind: item.kind,
      filename: item.filename,
      mimeType: item.mimeType,
    })),
  }

  entries.push({
    path: `${prefix}manifest.json`,
    content: JSON.stringify(manifest, null, 2),
  })

  return entries
}
