import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownDescriptionProps {
  content: string;
  className?: string;
}

export default function MarkdownDescription({ content, className = "" }: MarkdownDescriptionProps) {
  return (
    <div className={`prose prose-sm max-w-none text-gray-600 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
              data-testid="link-markdown"
            >
              {children}
            </a>
          ),
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 whitespace-pre-line">{children}</p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
