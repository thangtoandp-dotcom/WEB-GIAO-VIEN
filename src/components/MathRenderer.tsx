import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // Regex to split text by $$...$$ (block) and $...$ (inline)
    // Avoid escaping errors
    try {
      let text = content;

      // Handle block math $$ ... $$
      text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, math) => {
        try {
          return `<div class="my-2.5 overflow-x-auto text-center py-1 font-serif text-lg">${katex.renderToString(math.trim(), {
            displayMode: true,
            throwOnError: false,
          })}</div>`;
        } catch {
          return `$$${math}$$`;
        }
      });

      // Handle inline math $ ... $
      text = text.replace(/\$([^\$\n]+?)\$/g, (_match, math) => {
        try {
          return `<span class="inline-block px-1 align-middle font-serif">${katex.renderToString(math.trim(), {
            displayMode: false,
            throwOnError: false,
          })}</span>`;
        } catch {
          return `$${math}$`;
        }
      });

      // Replace newline with <br /> when appropriate
      text = text.replace(/\n/g, '<br />');

      return text;
    } catch {
      return content;
    }
  }, [content]);

  return (
    <div
      className={`leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
