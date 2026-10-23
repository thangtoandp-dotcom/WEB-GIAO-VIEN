import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    try {
      let text = content;

      // 1. Handle block math: \[ ... \] or $$ ... $$
      text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_match, math) => {
        try {
          return `<div class="katex-display-wrapper my-3 overflow-x-auto text-center py-1.5 font-serif">${katex.renderToString(
            math.trim(),
            {
              displayMode: true,
              throwOnError: false,
              output: 'html', // CRITICAL: NEVER output MathML to prevent duplicate text
            }
          )}</div>`;
        } catch {
          return `\\[${math}\\]`;
        }
      });

      text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, math) => {
        try {
          return `<div class="katex-display-wrapper my-3 overflow-x-auto text-center py-1.5 font-serif">${katex.renderToString(
            math.trim(),
            {
              displayMode: true,
              throwOnError: false,
              output: 'html', // CRITICAL: NEVER output MathML to prevent duplicate text
            }
          )}</div>`;
        } catch {
          return `$$${math}$$`;
        }
      });

      // 2. Handle inline math: \( ... \) or $ ... $
      text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_match, math) => {
        try {
          return `<span class="katex-inline-wrapper inline-block px-0.5 align-baseline font-serif">${katex.renderToString(
            math.trim(),
            {
              displayMode: false,
              throwOnError: false,
              output: 'html', // CRITICAL: NEVER output MathML to prevent duplicate text
            }
          )}</span>`;
        } catch {
          return `\\(${math}\\)`;
        }
      });

      text = text.replace(/\$([^\$\n]+?)\$/g, (_match, math) => {
        try {
          return `<span class="katex-inline-wrapper inline-block px-0.5 align-baseline font-serif">${katex.renderToString(
            math.trim(),
            {
              displayMode: false,
              throwOnError: false,
              output: 'html', // CRITICAL: NEVER output MathML to prevent duplicate text
            }
          )}</span>`;
        } catch {
          return `$${math}$`;
        }
      });

      // Replace standard newlines with line break if not inside a tag
      text = text.replace(/\n/g, '<br />');

      return text;
    } catch {
      return content;
    }
  }, [content]);

  return (
    <div
      className={`leading-relaxed math-rendered-container ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

