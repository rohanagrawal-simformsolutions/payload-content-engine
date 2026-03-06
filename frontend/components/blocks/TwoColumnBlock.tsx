"use client";

import React from "react";

interface ColumnContent {
  contentType: string;
  richText?: string;
  mediaUrl?: string;
  mediaAlt?: string;
  /** Optional nested blocks rendered via BlockRenderer render prop */
  nestedBlocks?: Array<{ blockType: string; [key: string]: unknown }>;
}

interface TwoColumnBlockProps {
  title: string;
  layout: "imageText" | "textImage" | "textText";
  leftColumn: ColumnContent;
  rightColumn: ColumnContent;
  columnRatio?: "50-50" | "60-40" | "40-60" | "70-30" | "30-70";
  reverseOnMobile?: boolean;
  /** Passed by BlockRenderer to render nested blocks without circular imports */
  renderBlocks?: (blocks: Array<{ blockType: string; [key: string]: unknown }>) => React.ReactNode;
}

export default function TwoColumnBlock({
  title,
  layout,
  leftColumn,
  rightColumn,
  columnRatio = "50-50",
  reverseOnMobile = false,
  renderBlocks,
}: TwoColumnBlockProps) {
  const getColumnWidth = (ratio: string): string => {
    const [left, right] = ratio.split("-").map((v) => parseInt(v));
    return `${left}%`;
  };

  const renderContent = (content: ColumnContent) => {
    switch (content.contentType) {
      case "richText":
        return (
          <div
            className="column-rich-text"
            dangerouslySetInnerHTML={{ __html: content.richText || "" }}
          />
        );
      case "media":
        return (
          <figure className="column-media">
            <img
              src={content.mediaUrl}
              alt={content.mediaAlt || "Column image"}
              className="column-image"
            />
            {content.mediaAlt && (
              <figcaption className="column-image-caption">
                {content.mediaAlt}
              </figcaption>
            )}
          </figure>
        );
      case "blocks":
        return content.nestedBlocks && content.nestedBlocks.length > 0 && renderBlocks
          ? <>{renderBlocks(content.nestedBlocks)}</>
          : null;
      default:
        return null;
    }
  };

  return (
    <section className={`two-column-block ${reverseOnMobile ? "reverse-mobile" : ""}`}>
      {title && <h2 className="two-column-title">{title}</h2>}
      <div className={`two-column-container ${layout}`}>
        <div
          className="two-column-left"
          style={{ width: getColumnWidth(columnRatio) }}
        >
          {renderContent(leftColumn)}
        </div>
        <div
          className="two-column-right"
          style={{
            width: `${100 - parseInt(getColumnWidth(columnRatio))}%`,
          }}
        >
          {renderContent(rightColumn)}
        </div>
      </div>
    </section>
  );
}
