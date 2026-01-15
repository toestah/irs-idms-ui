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

/**
 * Metadata extracted from document content
 */
export interface ExtractedMetadata {
  displayTitle: string | null;
  docketNumber: string | null;
  exhibitId: string | null;
  documentType: string | null;
  caseName: string | null;
  court: string | null;
}

/**
 * Extract meaningful metadata from extractive segments content.
 * Parses document text to derive human-readable metadata like
 * docket numbers, exhibit IDs, document types, and case names.
 */
export function extractMetadataFromContent(
  extractiveSegments: Array<{ content?: string }> | undefined,
  rawTitle: string
): ExtractedMetadata {
  const metadata: ExtractedMetadata = {
    displayTitle: null,
    docketNumber: null,
    exhibitId: null,
    documentType: null,
    caseName: null,
    court: null,
  };

  // Combine first few segments for analysis
  let combinedText = '';
  if (extractiveSegments) {
    for (const seg of extractiveSegments.slice(0, 3)) {
      if (seg?.content) {
        combinedText += ' ' + seg.content;
      }
    }
  }

  // Check if rawTitle is an exhibit ID pattern
  if (rawTitle && /^\d{3,4}-[A-Z]$/.test(rawTitle)) {
    metadata.exhibitId = rawTitle;
  }

  if (!combinedText) {
    if (metadata.exhibitId) {
      metadata.displayTitle = `Exhibit ${metadata.exhibitId}`;
    }
    return metadata;
  }

  // Extract docket number
  const docketMatch = combinedText.match(
    /Docket\s+No\.?\s*([\d]+-[\d]+(?:-\d+)?(?:\s*et\s*al\.)?)/i
  );
  if (docketMatch) {
    metadata.docketNumber = docketMatch[1].trim();
  }

  // Extract exhibit ID from content
  const exhibitMatch = combinedText.match(/EXHIBIT\s+([A-Z0-9]+-?[A-Z0-9]*)/i);
  if (exhibitMatch) {
    metadata.exhibitId = exhibitMatch[1].trim();
  }

  // Extract document type
  const docTypePatterns: Array<[RegExp, string]> = [
    [/Motion\s+(?:to\s+|for\s+)?([A-Za-z]+(?:\s+[A-Za-z]+){0,4})/i, 'Motion'],
    [/(Order)\s+(?:on|Granting|Denying|Regarding)/i, 'Order'],
    [/(Memorandum|Brief)\s+(?:in\s+)?(?:Support|Opposition|Reply)/i, 'Brief'],
    [/(Notice)\s+of\s+([A-Za-z]+(?:\s+[A-Za-z]+){0,2})/i, 'Notice'],
    [/(Complaint|Petition)\b/i, 'Complaint'],
    [/(Declaration|Affidavit)\s+of/i, 'Declaration'],
    [/(Stipulation)\b/i, 'Stipulation'],
    [/(Subpoena)\b/i, 'Subpoena'],
  ];

  for (const [pattern] of docTypePatterns) {
    const match = combinedText.match(pattern);
    if (match) {
      metadata.documentType = match[0].slice(0, 50).trim();
      break;
    }
  }

  // Extract case name
  const caseMatch = combinedText.match(
    /([A-Z][A-Za-z\s,.&]+(?:LLC|Inc|Corp|L\.P\.)?\.?)\s+v\.\s+([A-Z][A-Za-z\s,.&]+)/
  );
  if (caseMatch) {
    metadata.caseName = caseMatch[0].slice(0, 60).trim();
  } else {
    const inReMatch = combinedText.match(/In\s+[Rr]e[:\s]+([A-Z][A-Za-z\s,.&]+)/);
    if (inReMatch) {
      metadata.caseName = `In re: ${inReMatch[1].slice(0, 50).trim()}`;
    }
  }

  // Extract court name
  const courtMatch = combinedText.match(
    /(UNITED STATES (?:DISTRICT|BANKRUPTCY|TAX) COURT[^\n,]{0,40})/i
  );
  if (courtMatch) {
    metadata.court = courtMatch[1].trim();
  }

  // Build display title
  const titleParts: string[] = [];
  if (metadata.documentType) {
    titleParts.push(metadata.documentType);
  }

  if (metadata.caseName) {
    const shortCase = metadata.caseName.length > 40
      ? metadata.caseName.slice(0, 37) + '...'
      : metadata.caseName;
    titleParts.push(`- ${shortCase}`);
  } else if (metadata.docketNumber) {
    titleParts.push(`(Docket ${metadata.docketNumber})`);
  } else if (metadata.exhibitId) {
    titleParts.push(`(Exhibit ${metadata.exhibitId})`);
  }

  if (titleParts.length > 0) {
    metadata.displayTitle = titleParts.join(' ');
  } else if (metadata.exhibitId) {
    metadata.displayTitle = `Exhibit ${metadata.exhibitId}`;
  } else if (metadata.docketNumber) {
    metadata.displayTitle = `Document - Docket ${metadata.docketNumber}`;
  }

  return metadata;
}
