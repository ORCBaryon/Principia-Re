export interface ParsedBulkProblem {
  title: string;
  stemLatex: string;
  hintLatex: string;
  solutionLatex: string;
}

/**
 * Splits raw multi-question text or LaTeX notes into structured problem drafts.
 * Supports delimiters:
 * - Horizontal rules: `---` or `===`
 * - Numbered headers: `Q1.`, `Q.1`, `1.`, `1)`, `Problem 1:`, `\item`
 * - Markdown headings: `## Title`
 * And extracts inline `Hint:` / `Solution:` / `Ans:` sections when present.
 */
export function parseBulkTextToProblems(raw: string): ParsedBulkProblem[] {
  const normalized = raw.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  let chunks: string[] = [];

  if (/^-{3,}$/m.test(normalized) || /^={3,}$/m.test(normalized)) {
    chunks = normalized
      .split(/^\s*(?:-{3,}|={3,})\s*$/m)
      .map((s) => s.trim())
      .filter(Boolean);
  } else {
    // Split on common problem numbering boundaries at start of line
    const splitRegex =
      /(?=^(?:Q\.?\s*\d+[\).:\-\s]|Problem\s+\d+[:.\-\s]|\d{1,3}[.)]\s+|#{1,3}\s+|\\item\s+))/gim;
    chunks = normalized
      .split(splitRegex)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (chunks.length === 0) {
    chunks = [normalized];
  }

  return chunks.map((chunk, idx) => {
    // Remove leading delimiter token like `Q1.` or `1)` or `\item`
    let body = chunk
      .replace(/^(?:Q\.?\s*\d+[\).:\-\s]*|Problem\s+\d+[:.\-\s]*|\d{1,3}[.)]\s+|#{1,3}\s+|\\item\s+)/i, '')
      .trim();

    let hintLatex = '';
    let solutionLatex = '';

    // Extract Solution section if present
    const solMatch = body.match(/(?:^|\n)\s*(?:Solution|Sol\.?|Answer|Ans\.?)\s*:\s*([\s\S]+)$/i);
    if (solMatch && solMatch.index !== undefined) {
      solutionLatex = solMatch[1].trim();
      body = body.slice(0, solMatch.index).trim();
    }

    // Extract Hint section if present
    const hintMatch = body.match(/(?:^|\n)\s*(?:Hint|Key Idea)\s*:\s*([\s\S]+)$/i);
    if (hintMatch && hintMatch.index !== undefined) {
      hintLatex = hintMatch[1].trim();
      body = body.slice(0, hintMatch.index).trim();
    }

    const lines = body
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    let title = `Problem ${String(idx + 1).padStart(2, '0')}`;
    if (lines.length > 0) {
      const firstClean = lines[0].replace(/\$+/g, '').replace(/\\[a-zA-Z]+/g, '').trim();
      if (firstClean.length >= 6 && firstClean.length <= 72 && lines.length > 1) {
        title = firstClean;
      } else if (firstClean.length > 0) {
        title = firstClean.length > 64 ? `${firstClean.slice(0, 61)}...` : firstClean;
      }
    }

    return {
      title,
      stemLatex: body || chunk,
      hintLatex: hintLatex || 'Identify conserved quantities or virtual constraints.',
      solutionLatex: solutionLatex || 'Derivation pending.',
    };
  });
}
