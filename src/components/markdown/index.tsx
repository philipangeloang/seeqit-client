'use client';

import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MarkdownProps {
  content: string;
  className?: string;
}

/**
 * Renders post/comment content as markdown.
 * Handles links (e.g. Moltbook cross-post footers), bold, italics, code, lists.
 * Links open in a new tab.
 */
export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn('prose-seeqit', className)}>
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
