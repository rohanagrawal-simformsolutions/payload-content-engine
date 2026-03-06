"use client";

import React from "react";

interface CodeSnippetBlockProps {
  title: string;
  description?: string;
  embedType: "iframe" | "script";
  iframeCode?: string;
  scriptCode?: string;
  aspectRatio?: "16-9" | "4-3" | "1-1" | "auto";
  maxWidth?: number;
  allowFullscreen?: boolean;
  sandboxRestrictions?: boolean;
  fallbackText?: string;
}

export default function CodeSnippetBlock({
  title,
  description,
  embedType,
  iframeCode,
  scriptCode,
  aspectRatio = "auto",
  maxWidth = 1200,
  allowFullscreen = true,
  sandboxRestrictions = true,
  fallbackText,
}: CodeSnippetBlockProps) {
  return (
    <section className="code-snippet-block">
      {title && <h2 className="snippet-title">{title}</h2>}
      {description && <p className="snippet-description">{description}</p>}

      <div
        className={`embed-container aspect-${aspectRatio}`}
        style={{ maxWidth: `${maxWidth}px`, margin: "0 auto" }}
      >
        {embedType === "iframe" && iframeCode ? (
          <iframe
            className="embed-content"
            srcDoc={iframeCode}
            allowFullScreen={allowFullscreen}
            sandbox={
              sandboxRestrictions
                ? "allow-same-origin allow-scripts allow-popups allow-forms"
                : ""
            }
            title={title}
          />
        ) : embedType === "script" && scriptCode ? (
          <div
            className="embed-content"
            dangerouslySetInnerHTML={{ __html: scriptCode }}
          />
        ) : null}

        {!iframeCode && !scriptCode && fallbackText && (
          <div className="embed-fallback">{fallbackText}</div>
        )}
      </div>
    </section>
  );
}
