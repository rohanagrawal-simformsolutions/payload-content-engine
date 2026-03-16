import { Metadata } from "next";
import ArticleDetailClient from "./ArticleDetailClient";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Props {
  params: { slug: string };
}

/**
 * generateMetadata runs on the SERVER before the page is sent to the browser.
 * Next.js injects the returned tags directly into the HTML <head> —
 * so search engines and social-share scrapers see them without needing JS.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(`${BACKEND_URL}/articles/${params.slug}`, {
      // Always fetch fresh — article content can change at any time
      cache: "no-store",
    });

    if (!res.ok) return {};

    const article = await res.json();
    const seo = article.seo ?? {};

    const title = seo.metaTitle || article.title;
    const description = seo.metaDescription || article.summaryTitle || undefined;
    const imageUrl = seo.ogImage || article.featuredImage || undefined;

    return {
      title,
      description,
      robots: seo.noIndex ? "noindex, nofollow" : "index, follow",

      openGraph: {
        title,
        description,
        type: "article",
        url: seo.canonicalUrl || undefined,
        images: imageUrl
          ? [{ url: imageUrl, width: 1200, height: 630, alt: title }]
          : undefined,
      },

      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },

      alternates: seo.canonicalUrl
        ? { canonical: seo.canonicalUrl }
        : undefined,
    };
  } catch {
    // If the article can't be fetched, return empty — Next.js falls back to layout defaults
    return {};
  }
}

// Server component — passes slug down to the interactive client component
export default function ArticleDetailPage({ params }: Props) {
  return <ArticleDetailClient slug={params.slug} />;
}
