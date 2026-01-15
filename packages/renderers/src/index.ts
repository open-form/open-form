/**
 * @open-form/renderers
 *
 * Umbrella package for OpenForm renderers
 * Re-exports all renderers from @open-form/renderer-docx, @open-form/renderer-pdf, and @open-form/renderer-text
 */
import type { PdfFieldInfo as BasePdfFieldInfo } from '@open-form/renderer-pdf'

// Re-export from renderer-docx
export * from '@open-form/renderer-docx'

// Re-export from renderer-pdf
export * from '@open-form/renderer-pdf'
export type PdfFieldInfo = BasePdfFieldInfo

// Re-export from renderer-text
export * from '@open-form/renderer-text'
