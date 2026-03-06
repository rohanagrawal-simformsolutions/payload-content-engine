"use client";

import React, { useState } from "react";

interface AccordionItem {
  title: string;
  content?: string;
  nestedBlocks?: Array<{ blockType: string; [key: string]: unknown }>;
  isExpanded?: boolean;
}

interface AccordionBlockProps {
  title: string;
  anchorId?: string;
  items: AccordionItem[];
  allowMultipleOpen?: boolean;
  /** Passed by BlockRenderer to render nested blocks without circular imports */
  renderBlocks?: (blocks: Array<{ blockType: string; [key: string]: unknown }>) => React.ReactNode;
}

export default function AccordionBlock({
  title,
  anchorId,
  items,
  allowMultipleOpen = true,
  renderBlocks,
}: AccordionBlockProps) {
  const [expanded, setExpanded] = useState<number[]>(
    items
      .map((item, idx) => (item.isExpanded ? idx : -1))
      .filter((idx) => idx !== -1)
  );

  const toggle = (index: number) => {
    if (allowMultipleOpen) {
      setExpanded((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setExpanded(prev => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <section className="accordion-block" id={anchorId}>
      {title && <h2 className="accordion-title">{title}</h2>}
      <div className="accordion-container">
        {items.map((item, index) => (
          <div key={index} className="accordion-item">
            <button
              className={`accordion-header ${expanded.includes(index) ? "expanded" : ""}`}
              onClick={() => toggle(index)}
              aria-expanded={expanded.includes(index)}
              aria-controls={`accordion-panel-${index}`}
            >
              <span className="accordion-title-text">{item.title}</span>
              <span className="accordion-icon">▼</span>
            </button>
            {expanded.includes(index) && (
              <div
                id={`accordion-panel-${index}`}
                className="accordion-panel"
              >
                {item.nestedBlocks && item.nestedBlocks.length > 0 && renderBlocks
                  ? renderBlocks(item.nestedBlocks)
                  : <div dangerouslySetInnerHTML={{ __html: item.content || "" }} />}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
