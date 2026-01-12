/**
 * Utility functions for document handling and URL parsing
 */

/**
 * Extract document ID from URL if available
 * Handles typical patterns where ID is the filename without extension
 */
export function extractIdFromUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();
    if (filename) {
      // Remove extension and return
      return filename.replace(/\.[^.]+$/, '');
    }
  } catch {
    // Invalid URL
  }
  return undefined;
}

/**
 * Extract a meaningful document name from URL or title
 */
export function extractDocumentName(url: string | undefined, title: string): string {
  // If title looks like a proper name (not just an ID like "0304-J"), use it
  if (title && !/^\d{4}-[A-Z]$/.test(title) && title.length > 10) {
    return title;
  }

  // Try to extract filename from URL
  if (url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop();
      if (filename) {
        // Remove file extension and decode
        const name = decodeURIComponent(filename.replace(/\.[^.]+$/, ''));
        // Convert underscores/hyphens to spaces for readability
        const readable = name.replace(/[_-]/g, ' ');
        if (readable.length > 5) {
          return readable;
        }
      }
    } catch {
      // Invalid URL, continue with fallback
    }
  }

  return title || 'Document';
}
