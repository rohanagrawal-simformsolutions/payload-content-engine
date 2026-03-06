"use client";

import React, { useState } from "react";

interface TabContent {
  blockType: string;
  content?: string;
  mediaUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
}

interface Tab {
  tabTitle: string;
  tabId: string;
  blocks: TabContent[];
  /** Optional nested blocks rendered via BlockRenderer render prop */
  nestedBlocks?: Array<{ blockType: string; [key: string]: unknown }>;
}

interface TabsBlockProps {
  title: string;
  anchorId?: string;
  tabs: Tab[];
  activeTabIndex?: number;
  /** Passed by BlockRenderer to render nested blocks without circular imports */
  renderBlocks?: (blocks: Array<{ blockType: string; [key: string]: unknown }>) => React.ReactNode;
}

export default function TabsBlock({
  title,
  anchorId,
  tabs,
  activeTabIndex = 0,
  renderBlocks,
}: TabsBlockProps) {
  const [activeTab, setActiveTab] = useState(activeTabIndex);

  const renderContent = (block: TabContent) => {
    switch (block.blockType) {
      case "richText":
        return (
          <div
            className="tab-content-rich-text"
            dangerouslySetInnerHTML={{ __html: block.content || "" }}
          />
        );
      case "media":
        return (
          <div className="tab-content-media">
            <video controls className="tab-video">
              <source src={block.mediaUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case "cta":
        return (
          <div className="tab-content-cta">
            <a href={block.ctaUrl} className="btn btn-primary">
              {block.ctaText}
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="tabs-block" id={anchorId}>
      {title && <h2 className="tabs-title">{title}</h2>}
      <div className="tabs-container">
        <div className="tabs-nav" role="tablist">
          {tabs.map((tab, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={activeTab === index}
              aria-controls={`tab-panel-${index}`}
              className={`tab-button ${activeTab === index ? "active" : ""}`}
              onClick={() => setActiveTab(index)}
            >
              {tab.tabTitle}
            </button>
          ))}
        </div>
        <div className="tabs-content">
          {tabs.map((tab, index) => (
            <div
              key={index}
              id={`tab-panel-${index}`}
              role="tabpanel"
              className={`tab-panel ${activeTab === index ? "active" : ""}`}
              hidden={activeTab !== index}
            >
              {tab.nestedBlocks && tab.nestedBlocks.length > 0 && renderBlocks
                ? renderBlocks(tab.nestedBlocks)
                : tab.blocks.map((block, blockIndex) => (
                    <div key={blockIndex}>{renderContent(block)}</div>
                  ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
