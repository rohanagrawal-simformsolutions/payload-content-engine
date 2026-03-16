"use client";

import { useEffect } from "react";

export interface SeoProps {
  /** Overrides <title>. Falls back to the page's default title. */
  metaTitle?: string;
  /** Shown in search-engine result snippets. */
  metaDescription?: string;
  /** Absolute URL of the Open Graph / social-share image. */
  ogImage?: string;
  /** Canonical URL — prevents duplicate-content issues. */
  canonicalUrl?: string;
  /** When true, injects <meta name="robots" content="noindex, nofollow">. */
  noIndex?: boolean;
}

/**
 * SeoHead — shared SEO component used by every page (custom or CMS-driven).
 *
 * Usage:
 *   <SeoHead
 *     metaTitle="Mastering Myopia | Training Programs"
 *     metaDescription="Learn to manage myopia in-office…"
 *     ogImage="https://example.com/og.jpg"
 *     canonicalUrl="https://example.com/programs/mastering-myopia"
 *   />
 *
 * It renders nothing visible — it only updates document.head via useEffect.
 */
export default function SeoHead({
  metaTitle,
  metaDescription,
  ogImage,
  canonicalUrl,
  noIndex = false,
}: SeoProps) {
  useEffect(() => {
    // ── Helper — create-or-update a <meta> element ──────────────────────
    const setMeta = (
      nameOrProp: string,
      content: string,
      isProperty = false,
    ) => {
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(
        `meta[${attr}="${nameOrProp}"]`,
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, nameOrProp);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // ── <title> ──────────────────────────────────────────────────────────
    if (metaTitle) {
      document.title = metaTitle;
      setMeta("og:title", metaTitle, true);
      setMeta("twitter:title", metaTitle);
    }

    // ── Meta description ─────────────────────────────────────────────────
    if (metaDescription) {
      setMeta("description", metaDescription);
      setMeta("og:description", metaDescription, true);
      setMeta("twitter:description", metaDescription);
    }

    // ── Open Graph image ─────────────────────────────────────────────────
    if (ogImage) {
      setMeta("og:image", ogImage, true);
      setMeta("og:image:width", "1200", true);
      setMeta("og:image:height", "630", true);
      setMeta("twitter:image", ogImage);
      setMeta("twitter:card", "summary_large_image");
    }

    // ── Open Graph type ──────────────────────────────────────────────────
    setMeta("og:type", "article", true);

    // ── Canonical URL ────────────────────────────────────────────────────
    if (canonicalUrl) {
      let link = document.querySelector(
        "link[rel='canonical']",
      ) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.href = canonicalUrl;
      setMeta("og:url", canonicalUrl, true);
    }

    // ── Robots / noIndex ─────────────────────────────────────────────────
    setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");
  }, [metaTitle, metaDescription, ogImage, canonicalUrl, noIndex]);

  // This component is side-effect only — nothing is rendered in the tree.
  return null;
}
