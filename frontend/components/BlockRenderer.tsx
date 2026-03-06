"use client";

import React from "react";
import {
  AccordionBlock,
  TabsBlock,
  TwoColumnBlock,
  DownloadsBlock,
  GalleryBlock,
  MediaVideoBlock,
  CardBoxBlock,
  CTASectionBlock,
  CarouselBlock,
  PullQuoteBlock,
  LogoWallBlock,
  CodeSnippetBlock,
} from "./blocks/index";

// Block type enum
export type BlockType =
  | "accordion"
  | "tabs"
  | "two-column"
  | "downloads"
  | "gallery"
  | "media-video"
  | "card-box"
  | "cta-section"
  | "carousel"
  | "pull-quote"
  | "logo-wall"
  | "code-snippet";

export interface Block {
  id?: string;
  blockType: BlockType;
  [key: string]: unknown;
}

interface BlockRendererProps {
  blocks: Block[];
}

export default function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  const renderBlock = (block: Block, index: number) => {
    const key = block.id || `block-${index}`;

    switch (block.blockType) {
      case "accordion":
        return (
          <AccordionBlock
            key={key}
            title={block.title as string}
            anchorId={block.anchorId as string | undefined}
            items={block.items as any[]}
            allowMultipleOpen={block.allowMultipleOpen as boolean | undefined}
            renderBlocks={(nested) => <BlockRenderer blocks={nested as Block[]} />}
          />
        );

      case "tabs":
        return (
          <TabsBlock
            key={key}
            title={block.title as string}
            anchorId={block.anchorId as string | undefined}
            tabs={block.tabs as any[]}
            activeTabIndex={block.activeTabIndex as number | undefined}
            renderBlocks={(nested) => <BlockRenderer blocks={nested as Block[]} />}
          />
        );

      case "two-column":
        return (
          <TwoColumnBlock
            key={key}
            title={block.title as string}
            layout={block.layout as any}
            leftColumn={block.leftColumn as any}
            rightColumn={block.rightColumn as any}
            columnRatio={block.columnRatio as any}
            reverseOnMobile={block.reverseOnMobile as boolean | undefined}
            renderBlocks={(nested) => <BlockRenderer blocks={nested as Block[]} />}
          />
        );

      case "downloads":
        return (
          <DownloadsBlock
            key={key}
            title={block.title as string}
            description={block.description as string | undefined}
            files={block.files as any[]}
            trackAnalytics={block.trackAnalytics as boolean | undefined}
          />
        );

      case "gallery":
        return (
          <GalleryBlock
            key={key}
            title={block.title as string}
            description={block.description as string | undefined}
            images={block.images as any[]}
            layout={block.layout as any}
            enableLightbox={block.enableLightbox as boolean | undefined}
            columnsOnDesktop={block.columnsOnDesktop as number | undefined}
            columnsOnMobile={block.columnsOnMobile as number | undefined}
          />
        );

      case "media-video":
        return (
          <MediaVideoBlock
            key={key}
            title={block.title as string}
            description={block.description as string | undefined}
            sourceType={block.sourceType as any}
            youtubeUrl={block.youtubeUrl as string | undefined}
            vimeoUrl={block.vimeoUrl as string | undefined}
            videoUrl={block.videoUrl as string | undefined}
            thumbnailUrl={block.thumbnailUrl as string | undefined}
            embedCode={block.embedCode as string | undefined}
            aspectRatio={block.aspectRatio as any}
            autoplay={block.autoplay as boolean | undefined}
            controls={block.controls as boolean | undefined}
            trackAnalytics={block.trackAnalytics as boolean | undefined}
          />
        );

      case "card-box":
        return (
          <CardBoxBlock
            key={key}
            title={block.title as string}
            cards={block.cards as any[]}
            columnsDesktop={block.columnsDesktop as number | undefined}
            columnsMobile={block.columnsMobile as number | undefined}
            cardHeight={block.cardHeight as any}
          />
        );

      case "cta-section":
        return (
          <CTASectionBlock
            key={key}
            title={block.title as string}
            description={block.description as string | undefined}
            primaryCta={block.primaryCta as any}
            secondaryCta={block.secondaryCta as any}
            backgroundStyle={block.backgroundStyle as any}
            textAlignment={block.textAlignment as any}
          />
        );

      case "carousel":
        return (
          <CarouselBlock
            key={key}
            title={block.title as string}
            carouselType={block.carouselType as any}
            slides={block.slides as any[]}
            autoplay={block.autoplay as boolean | undefined}
            autoplayInterval={block.autoplayInterval as number | undefined}
            showNavigation={block.showNavigation as boolean | undefined}
            showPagination={block.showPagination as boolean | undefined}
            slidesPerView={block.slidesPerView as number | undefined}
            gap={block.gap as number | undefined}
          />
        );

      case "pull-quote":
        return (
          <PullQuoteBlock
            key={key}
            quote={block.quote as string}
            author={block.author as string}
            authorTitle={block.authorTitle as string | undefined}
            authorImage={block.authorImage as string | undefined}
            authorImageAlt={block.authorImageAlt as string | undefined}
            quoteType={block.quoteType as any}
            backgroundColor={block.backgroundColor as any}
            textAlignment={block.textAlignment as any}
            rating={block.rating as number | undefined}
          />
        );

      case "logo-wall":
        return (
          <LogoWallBlock
            key={key}
            title={block.title as string}
            description={block.description as string | undefined}
            logos={block.logos as any[]}
            maxLogoHeight={block.maxLogoHeight as any}
            columnsDesktop={block.columnsDesktop as number | undefined}
            columnsMobile={block.columnsMobile as number | undefined}
            alignmentStyle={block.alignmentStyle as any}
          />
        );

      case "code-snippet":
        return (
          <CodeSnippetBlock
            key={key}
            title={block.title as string}
            description={block.description as string | undefined}
            embedType={block.embedType as any}
            iframeCode={block.iframeCode as string | undefined}
            scriptCode={block.scriptCode as string | undefined}
            aspectRatio={block.aspectRatio as any}
            maxWidth={block.maxWidth as number | undefined}
            allowFullscreen={block.allowFullscreen as boolean | undefined}
            sandboxRestrictions={block.sandboxRestrictions as boolean | undefined}
            fallbackText={block.fallbackText as string | undefined}
          />
        );

      default:
        return (
          <div key={key} style={{ padding: "1rem", background: "#fee", color: "#c00" }}>
            Unknown block type: {block.blockType}
          </div>
        );
    }
  };

  return (
    <div className="block-renderer">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
