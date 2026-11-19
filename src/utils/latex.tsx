import React from 'react';
import katex from 'katex';

interface MathSegment {
  type: 'text' | 'inline' | 'display';
  content: string;
}

function tokenizeLatex(input: string): MathSegment[] {
  const segments: MathSegment[] = [];
  let i = 0;
  let textBuffer = '';

  const flushText = () => {
    if (textBuffer.length > 0) {
      segments.push({ type: 'text', content: textBuffer });
      textBuffer = '';
    }
  };

  while (i < input.length) {
    // Handle escaped dollar sign \$
    if (input[i] === '\\' && input[i + 1] === '$') {
      textBuffer += '$';
      i += 2;
      continue;
    }

    // Display math $$...$$
    if (input[i] === '$' && input[i + 1] === '$') {
      const closeIndex = input.indexOf('$$', i + 2);
      if (closeIndex !== -1) {
        flushText();
        segments.push({
          type: 'display',
          content: input.slice(i + 2, closeIndex).trim(),
        });
        i = closeIndex + 2;
        continue;
      }
    }

    // Inline math $...$
    if (input[i] === '$') {
      let closeIndex = i + 1;
      let found = false;
      while (closeIndex < input.length) {
        if (input[closeIndex] === '\\' && input[closeIndex + 1] === '$') {
          closeIndex += 2;
          continue;
        }
        if (input[closeIndex] === '$') {
          found = true;
          break;
        }
        if (input[closeIndex] === '\n' && input[closeIndex + 1] === '\n') {
          break;
        }
        closeIndex++;
      }

      if (found && closeIndex > i + 1) {
        flushText();
        segments.push({
          type: 'inline',
          content: input.slice(i + 1, closeIndex).trim(),
        });
        i = closeIndex + 1;
        continue;
      }
    }

    textBuffer += input[i];
    i++;
  }

  flushText();
  return segments;
}

function renderBoldAndLineBreaks(text: string, keyPrefix: string): React.ReactNode[] {
  // Support **bold** and line breaks cleanly without dangerouslySetInnerHTML on prose
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) {
      nodes.push(<br key={`${keyPrefix}-br-${lineIdx}`} />);
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    parts.forEach((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        nodes.push(
          <strong key={`${keyPrefix}-${lineIdx}-${partIdx}`} className="font-semibold text-[#14181F]">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.length > 0) {
        nodes.push(<React.Fragment key={`${keyPrefix}-${lineIdx}-${partIdx}`}>{part}</React.Fragment>);
      }
    });
  });

  return nodes;
}

function renderKatexHtml(expr: string, displayMode: boolean): string {
  try {
    return katex.renderToString(expr, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: false,
    });
  } catch {
    return expr;
  }
}

interface MathTextProps {
  text: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  const segments = React.useMemo(() => tokenizeLatex(text || ''), [text]);

  return (
    <div className={`leading-relaxed break-words ${className}`}>
      {segments.map((seg, idx) => {
        if (seg.type === 'text') {
          return (
            <React.Fragment key={`txt-${idx}`}>
              {renderBoldAndLineBreaks(seg.content, `txt-${idx}`)}
            </React.Fragment>
          );
        }
        const html = renderKatexHtml(seg.content, seg.type === 'display');
        if (seg.type === 'display') {
          return (
            <div
              key={`disp-${idx}`}
              className="my-3 overflow-x-auto py-1 text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
        return (
          <span
            key={`inl-${idx}`}
            className="inline-block align-baseline px-0.5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
};

interface MathFormulaProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  latex,
  displayMode = false,
  className = '',
}) => {
  const html = React.useMemo(
    () => renderKatexHtml(latex, displayMode),
    [latex, displayMode]
  );

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
