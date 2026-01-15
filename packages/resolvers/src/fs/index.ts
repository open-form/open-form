/**
 * Filesystem resolver for Node.js environments.
 */

import type { Resolver } from '@open-form/types'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Options for creating a filesystem resolver.
 */
export interface FsResolverOptions {
  /**
   * Absolute path to the root directory.
   * All paths passed to read() will be resolved relative to this root.
   */
  root: string
}

/**
 * Create a filesystem resolver for Node.js environments.
 *
 * @example
 * ```typescript
 * import { createFsResolver } from '@open-form/resolvers/fs'
 *
 * const resolver = createFsResolver({ root: process.cwd() })
 *
 * // Read a file relative to root
 * const bytes = await resolver.read('/templates/form.md')
 * ```
 */
export function createFsResolver(options: FsResolverOptions): Resolver {
  const { root } = options

  return {
    async read(path: string): Promise<Uint8Array> {
      const fullPath = join(root, path)
      const buffer = await readFile(fullPath)
      return new Uint8Array(buffer)
    },
  }
}
