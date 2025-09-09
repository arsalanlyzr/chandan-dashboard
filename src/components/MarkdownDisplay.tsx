import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./components.css";
type Props = {
  content: string;
  className?: string;
};

const MarkdownDisplay: React.FC<Props> = ({ content, className }) => {
  return (
    <div className={`max-w-none text-left font-sans ${className || ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-sm font-semibold mb-2 text-gray-900 text-left font-sans">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-semibold mb-1 text-gray-900 text-left font-sans">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mb-1 text-gray-900 text-left font-sans">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm mb-2 text-gray-900 text-left font-sans leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="text-sm mb-2 ml-4 list-disc text-left font-sans">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="text-sm mb-2 ml-4 list-decimal text-left font-sans">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm mb-1 text-left font-sans">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 font-sans">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic font-sans">{children}</em>
          ),
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneDark as any}
                language={match[1]}
                PreTag="div"
                className="text-xs rounded"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          div: ({ className, children, ...props }: any) => {
            // Style HubSpot form container
            if (className === "hs-form-html") {
              return (
                <div
                  className="hs-form-html flex flex-col w-full max-w-full"
                  {...props}
                >
                  {children}
                </div>
              );
            }
            return (
              <div className={className} {...props}>
                {children}
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownDisplay;
