"use client";

import React, { useState, useEffect } from "react";
import { createBlock, BlockType } from "@/lib/blocks";

// ─── Style tokens ─────────────────────────────────────────────────────────────
const inp =
  "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const sel =
  "w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";
const ta =
  "w-full border border-gray-300 rounded px-3 py-2 text-sm resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500";

const F = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Row = ({
  children,
  onRemove,
  index,
}: {
  children: React.ReactNode;
  onRemove: () => void;
  index: number;
}) => (
  <div className="border border-gray-200 rounded-lg p-3 relative bg-gray-50">
    <span className="text-xs text-gray-400 font-mono mb-2 block">#{index + 1}</span>
    {children}
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-600 font-medium"
    >
      Remove
    </button>
  </div>
);

const AddBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
  >
    + Add {label}
  </button>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2 border-t pt-3">
    {children}
  </p>
);

// ─── Default form states (pre-filled with sample data) ────────────────────────
function getDefaults(blockType: BlockType): Record<string, any> {
  switch (blockType) {
    case "accordion":
      return {
        title: "Frequently Asked Questions",
        anchorId: "faq",
        allowMultipleOpen: true,
        items: [
          {
            title: "What is a headless CMS?",
            content:
              "A headless CMS separates the content repository (the body) from the presentation layer (the head). Content is delivered via API and can be displayed on any device or channel.",
            isExpanded: true,
          },
          {
            title: "How does Payload differ from Strapi?",
            content:
              "Payload CMS is TypeScript-first, runs entirely inside your Node/NestJS process as a local API, and gives you full ownership of the database schema. Strapi runs as a separate service.",
            isExpanded: false,
          },
          {
            title: "Can I use this with Next.js?",
            content:
              "Yes — Next.js 14 with the App Router is the recommended frontend. Content is fetched from the NestJS REST API and rendered server-side or client-side as needed.",
            isExpanded: false,
          },
          {
            title: "Is authentication included?",
            content:
              "Yes. JWT-based authentication via NestJS Passport guards the admin endpoints. Public read endpoints require no token.",
            isExpanded: false,
          },
        ],
      };
    case "tabs":
      return {
        title: "Product Features",
        anchorId: "features",
        tabs: [
          {
            tabTitle: "Overview",
            tabId: "overview",
            content:
              "<p><strong>Content engine built for scale.</strong> Manage articles, media, and component blocks from a single API. Multi-CMS support included.</p><ul><li>Payload CMS as local API</li><li>Strapi as external service</li><li>Switchable at runtime</li></ul>",
          },
          {
            tabTitle: "Technical Stack",
            tabId: "stack",
            content:
              "<p><strong>Technologies used:</strong></p><ol><li>NestJS — REST API + auth</li><li>Payload CMS — local content engine</li><li>PostgreSQL — single database, dual schema</li><li>Next.js 14 — frontend</li><li>Tiptap — rich text editor</li></ol>",
          },
          {
            tabTitle: "Getting Started",
            tabId: "start",
            content:
              "<p>Run <code>npm run start:dev</code> to start the API, then <code>npm run dev</code> in the <code>/frontend</code> folder.</p><p>Visit <strong>http://localhost:3001</strong> to see the UI.</p>",
          },
        ],
      };
    case "two-column":
      return {
        title: "Why Choose Our Platform",
        layout: "textImage",
        columnRatio: "50-50",
        reverseOnMobile: false,
        leftColumn: {
          contentType: "richText",
          richText:
            "<h3>Built for Developers</h3><p>A fully typed TypeScript stack with zero-surprise architecture. Own your database, own your schema, own your deployment.</p><ul><li>No vendor lock-in</li><li>Full source access</li><li>Extensible by design</li></ul>",
          mediaUrl: "",
          mediaAlt: "",
        },
        rightColumn: {
          contentType: "media",
          richText: "",
          mediaUrl: "https://picsum.photos/seed/cms/800/450",
          mediaAlt: "Platform screenshot",
        },
      };
    case "downloads":
      return {
        title: "Resource Downloads",
        description: "Download technical guides, templates, and reference sheets.",
        trackAnalytics: true,
        files: [
          {
            title: "API Reference Guide",
            description: "Complete REST API documentation with examples.",
            fileUrl: "https://example.com/api-reference.pdf",
            fileSize: "2.4 MB",
            fileType: "pdf",
            accessLevel: "public",
          },
          {
            title: "Architecture Diagram",
            description: "System architecture overview and data flow diagrams.",
            fileUrl: "https://example.com/architecture.pptx",
            fileSize: "1.1 MB",
            fileType: "pptx",
            accessLevel: "members",
          },
          {
            title: "Database Schema Export",
            description: "Full PostgreSQL schema with all Payload tables.",
            fileUrl: "https://example.com/schema.xlsx",
            fileSize: "340 KB",
            fileType: "xlsx",
            accessLevel: "premium",
          },
        ],
      };
    case "gallery":
      return {
        title: "Photo Gallery",
        description: "A showcase of project screenshots and design assets.",
        layout: "grid-3",
        enableLightbox: true,
        columnsOnDesktop: 3,
        columnsOnMobile: 1,
        images: [
          { imageUrl: "https://picsum.photos/seed/g1/600/400", altText: "Screenshot 1", caption: "Dashboard view" },
          { imageUrl: "https://picsum.photos/seed/g2/600/400", altText: "Screenshot 2", caption: "Article editor" },
          { imageUrl: "https://picsum.photos/seed/g3/600/400", altText: "Screenshot 3", caption: "Media library" },
          { imageUrl: "https://picsum.photos/seed/g4/600/400", altText: "Screenshot 4", caption: "API explorer" },
          { imageUrl: "https://picsum.photos/seed/g5/600/400", altText: "Screenshot 5", caption: "User settings" },
          { imageUrl: "https://picsum.photos/seed/g6/600/400", altText: "Screenshot 6", caption: "Analytics" },
        ],
      };
    case "media-video":
      return {
        title: "Platform Demo Video",
        description: "Watch a 5-minute walkthrough of the content engine in action.",
        sourceType: "youtube",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        vimeoUrl: "",
        videoUrl: "",
        aspectRatio: "16-9",
        autoplay: false,
        controls: true,
        trackAnalytics: true,
      };
    case "card-box":
      return {
        title: "Core Capabilities",
        columnsDesktop: 3,
        columnsMobile: 1,
        cardHeight: "auto",
        cards: [
          {
            cardTitle: "Content Management",
            description: "Create, edit, and publish articles with a rich text editor. Manage drafts and scheduled releases.",
            imageUrl: "https://picsum.photos/seed/card1/400/250",
            imageAlt: "Content management",
            cta: { text: "Learn more", url: "#", style: "primary", openInNewTab: false },
          },
          {
            cardTitle: "Media Handling",
            description: "Upload images with automatic optimisation. Serve assets from CDN with lazy loading.",
            imageUrl: "https://picsum.photos/seed/card2/400/250",
            imageAlt: "Media handling",
            cta: { text: "See docs", url: "#", style: "secondary", openInNewTab: false },
          },
          {
            cardTitle: "Multi-CMS Support",
            description: "Switch between Payload CMS and Strapi at runtime. Compare outputs side by side.",
            imageUrl: "https://picsum.photos/seed/card3/400/250",
            imageAlt: "Multi CMS",
            cta: { text: "Compare", url: "#", style: "tertiary", openInNewTab: false },
          },
        ],
      };
    case "cta-section":
      return {
        title: "Ready to get started?",
        description: "Deploy the content engine in minutes. Full TypeScript, full control.",
        backgroundStyle: "gradient",
        textAlignment: "center",
        primaryCta: { text: "Create Article", url: "/articles/create", openInNewTab: false },
        secondaryCta: { text: "Read Docs", url: "#", openInNewTab: true },
      };
    case "carousel":
      return {
        title: "Featured Articles",
        carouselType: "content",
        autoplay: true,
        autoplayInterval: 4000,
        showNavigation: true,
        showPagination: true,
        slidesPerView: 1,
        gap: 24,
        slides: [
          {
            title: "Getting Started with Payload CMS",
            description: "Set up a full-stack content engine using NestJS, Payload, and Next.js in under an hour.",
            imageUrl: "https://picsum.photos/seed/s1/1200/600",
            imageAlt: "Article 1",
            ctaText: "Read article",
            linkUrl: "#",
          },
          {
            title: "Building a Multi-CMS Architecture",
            description: "Learn how to design a backend that supports multiple headless CMS providers simultaneously.",
            imageUrl: "https://picsum.photos/seed/s2/1200/600",
            imageAlt: "Article 2",
            ctaText: "Read article",
            linkUrl: "#",
          },
          {
            title: "Rich Text Editing with Tiptap",
            description: "Implement a fully-featured WYSIWYG editor with headings, lists, links, and code blocks.",
            imageUrl: "https://picsum.photos/seed/s3/1200/600",
            imageAlt: "Article 3",
            ctaText: "Read article",
            linkUrl: "#",
          },
        ],
      };
    case "pull-quote":
      return {
        quote:
          "The best content platform is the one you fully understand and own. This stack gives us exactly that — no black boxes, no lock-in.",
        author: "Rohan Agrawal",
        authorTitle: "Lead Engineer",
        authorImage: "https://i.pravatar.cc/80?img=12",
        quoteType: "testimonial",
        backgroundColor: "light",
        textAlignment: "center",
        rating: 5,
      };
    case "logo-wall":
      return {
        title: "Trusted Technologies",
        description: "Built on proven open-source tools used by thousands of developers worldwide.",
        columnsDesktop: 5,
        columnsMobile: 2,
        alignmentStyle: "center",
        logos: [
          { logoUrl: "https://picsum.photos/seed/l1/200/80", altText: "NestJS", companyName: "NestJS", linkUrl: "" },
          { logoUrl: "https://picsum.photos/seed/l2/200/80", altText: "Next.js", companyName: "Next.js", linkUrl: "" },
          { logoUrl: "https://picsum.photos/seed/l3/200/80", altText: "Payload CMS", companyName: "Payload CMS", linkUrl: "" },
          { logoUrl: "https://picsum.photos/seed/l4/200/80", altText: "PostgreSQL", companyName: "PostgreSQL", linkUrl: "" },
          { logoUrl: "https://picsum.photos/seed/l5/200/80", altText: "TypeScript", companyName: "TypeScript", linkUrl: "" },
        ],
      };
    case "code-snippet":
      return {
        title: "Live API Demo",
        description: "Embedded interactive API explorer.",
        embedType: "iframe",
        iframeCode: `<iframe src="https://httpbin.org/forms/post" style="width:100%;height:400px;border:none;" title="API Demo"></iframe>`,
        scriptCode: "",
        aspectRatio: "16-9",
        maxWidth: 900,
        allowFullscreen: true,
        fallbackText: "Your browser does not support iframes.",
      };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function setField(setData: React.Dispatch<any>, field: string, value: any) {
  setData((prev: any) => ({ ...prev, [field]: value }));
}

function setNested(setData: React.Dispatch<any>, parent: string, field: string, value: any) {
  setData((prev: any) => ({
    ...prev,
    [parent]: { ...prev[parent], [field]: value },
  }));
}

function setArrItem(
  setData: React.Dispatch<any>,
  arr: string,
  idx: number,
  field: string,
  value: any,
) {
  setData((prev: any) => {
    const a = [...prev[arr]];
    a[idx] = { ...a[idx], [field]: value };
    return { ...prev, [arr]: a };
  });
}

function setArrItemNested(
  setData: React.Dispatch<any>,
  arr: string,
  idx: number,
  parent: string,
  field: string,
  value: any,
) {
  setData((prev: any) => {
    const a = [...prev[arr]];
    a[idx] = { ...a[idx], [parent]: { ...a[idx][parent], [field]: value } };
    return { ...prev, [arr]: a };
  });
}

function addArrItem(setData: React.Dispatch<any>, arr: string, item: any) {
  setData((prev: any) => ({ ...prev, [arr]: [...prev[arr], item] }));
}

function removeArrItem(setData: React.Dispatch<any>, arr: string, idx: number) {
  setData((prev: any) => ({ ...prev, [arr]: prev[arr].filter((_: any, i: number) => i !== idx) }));
}

// ─── Transform before sending to API ─────────────────────────────────────────
// Tabs form uses a flat "content" field per tab; API expects blocks[].content
function transformForApi(blockType: BlockType, data: any): any {
  if (blockType === "tabs") {
    return {
      ...data,
      tabs: data.tabs.map((t: any) => ({
        tabTitle: t.tabTitle,
        tabId: t.tabId,
        blocks: [{ blockType: "richText", content: t.content }],
      })),
    };
  }
  return data;
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  blockType: BlockType;
  token: string;
  onCreated: (block: any) => void;
}

export default function BlockCreateForm({ blockType, token, onCreated }: Props) {
  const [data, setData] = useState<any>(() => getDefaults(blockType));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setData(getDefaults(blockType));
    setError("");
  }, [blockType]);

  const sf = (field: string, v: any) => setField(setData, field, v);
  const sn = (parent: string, field: string, v: any) => setNested(setData, parent, field, v);
  const sa = (arr: string, idx: number, field: string, v: any) => setArrItem(setData, arr, idx, field, v);
  const san = (arr: string, idx: number, parent: string, field: string, v: any) =>
    setArrItemNested(setData, arr, idx, parent, field, v);
  const add = (arr: string, item: any) => addArrItem(setData, arr, item);
  const remove = (arr: string, idx: number) => removeArrItem(setData, arr, idx);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = transformForApi(blockType, data);
      const result = await createBlock(blockType, payload, token);
      onCreated(result);
      setData(getDefaults(blockType));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to save block");
    } finally {
      setSaving(false);
    }
  };

  // ── Form renderers per type ──────────────────────────────────────────────────
  const renderFields = () => {
    switch (blockType) {
      // ── ACCORDION ────────────────────────────────────────────────────────────
      case "accordion":
        return (
          <>
            <F label="Title" required><input className={inp} value={data.title} onChange={e => sf("title", e.target.value)} placeholder="e.g. FAQ" /></F>
            <F label="Anchor ID (optional)"><input className={inp} value={data.anchorId} onChange={e => sf("anchorId", e.target.value)} placeholder="e.g. faq" /></F>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-3 cursor-pointer">
              <input type="checkbox" checked={data.allowMultipleOpen} onChange={e => sf("allowMultipleOpen", e.target.checked)} />
              Allow multiple items open at once
            </label>
            <SectionTitle>Items</SectionTitle>
            <div className="space-y-2">
              {data.items.map((item: any, i: number) => (
                <Row key={i} index={i} onRemove={() => remove("items", i)}>
                  <F label="Item Title"><input className={inp} value={item.title} onChange={e => sa("items", i, "title", e.target.value)} placeholder="Question or heading" /></F>
                  <F label="Content"><textarea className={ta} value={item.content} onChange={e => sa("items", i, "content", e.target.value)} placeholder="Answer or body text" /></F>
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={item.isExpanded} onChange={e => sa("items", i, "isExpanded", e.target.checked)} />
                    Expanded by default
                  </label>
                </Row>
              ))}
            </div>
            <AddBtn label="Item" onClick={() => add("items", { title: "", content: "", isExpanded: false })} />
          </>
        );

      // ── TABS ─────────────────────────────────────────────────────────────────
      case "tabs":
        return (
          <>
            <F label="Title" required><input className={inp} value={data.title} onChange={e => sf("title", e.target.value)} placeholder="e.g. Product Features" /></F>
            <F label="Anchor ID (optional)"><input className={inp} value={data.anchorId} onChange={e => sf("anchorId", e.target.value)} /></F>
            <SectionTitle>Tabs</SectionTitle>
            <div className="space-y-2">
              {data.tabs.map((tab: any, i: number) => (
                <Row key={i} index={i} onRemove={() => remove("tabs", i)}>
                  <F label="Tab Label"><input className={inp} value={tab.tabTitle} onChange={e => sa("tabs", i, "tabTitle", e.target.value)} placeholder="Tab name" /></F>
                  <F label="Tab ID"><input className={inp} value={tab.tabId} onChange={e => sa("tabs", i, "tabId", e.target.value)} placeholder="tab-1" /></F>
                  <F label="Content (HTML supported)"><textarea className={ta} value={tab.content} onChange={e => sa("tabs", i, "content", e.target.value)} placeholder="<p>Tab body content</p>" /></F>
                </Row>
              ))}
            </div>
            <AddBtn label="Tab" onClick={() => add("tabs", { tabTitle: "", tabId: `tab-${data.tabs.length + 1}`, content: "" })} />
          </>
        );

      // ── TWO COLUMN ───────────────────────────────────────────────────────────
      case "two-column":
        return (
          <>
            <F label="Title" required><input className={inp} value={data.title} onChange={e => sf("title", e.target.value)} /></F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Layout">
                <select className={sel} value={data.layout} onChange={e => sf("layout", e.target.value)}>
                  <option value="textImage">Text | Image</option>
                  <option value="imageText">Image | Text</option>
                  <option value="textText">Text | Text</option>
                </select>
              </F>
              <F label="Column Ratio">
                <select className={sel} value={data.columnRatio} onChange={e => sf("columnRatio", e.target.value)}>
                  <option value="50-50">50 / 50</option>
                  <option value="60-40">60 / 40</option>
                  <option value="40-60">40 / 60</option>
                  <option value="70-30">70 / 30</option>
                  <option value="30-70">30 / 70</option>
                </select>
              </F>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-3 cursor-pointer">
              <input type="checkbox" checked={data.reverseOnMobile} onChange={e => sf("reverseOnMobile", e.target.checked)} />
              Reverse column order on mobile
            </label>
            {(["leftColumn", "rightColumn"] as const).map(col => (
              <div key={col}>
                <SectionTitle>{col === "leftColumn" ? "Left Column" : "Right Column"}</SectionTitle>
                <F label="Content Type">
                  <select className={sel} value={data[col].contentType} onChange={e => sn(col, "contentType", e.target.value)}>
                    <option value="richText">Rich Text</option>
                    <option value="media">Image</option>
                  </select>
                </F>
                {data[col].contentType === "richText" ? (
                  <F label="Content (HTML)"><textarea className={ta} value={data[col].richText} onChange={e => sn(col, "richText", e.target.value)} placeholder="<p>Column content</p>" /></F>
                ) : (
                  <>
                    <F label="Image URL"><input className={inp} value={data[col].mediaUrl} onChange={e => sn(col, "mediaUrl", e.target.value)} placeholder="https://..." /></F>
                    <F label="Alt Text"><input className={inp} value={data[col].mediaAlt} onChange={e => sn(col, "mediaAlt", e.target.value)} /></F>
                  </>
                )}
              </div>
            ))}
          </>
        );

      // ── DOWNLOADS ────────────────────────────────────────────────────────────
      case "downloads":
        return (
          <>
            <F label="Title" required><input className={inp} value={data.title} onChange={e => sf("title", e.target.value)} placeholder="Resource Downloads" /></F>
            <F label="Description"><textarea className={ta} value={data.description} onChange={e => sf("description", e.target.value)} /></F>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-3 cursor-pointer">
              <input type="checkbox" checked={data.trackAnalytics} onChange={e => sf("trackAnalytics", e.target.checked)} />
              Track download analytics
            </label>
            <SectionTitle>Files</SectionTitle>
            <div className="space-y-2">
              {data.files.map((f: any, i: number) => (
                <Row key={i} index={i} onRemove={() => remove("files", i)}>
                  <F label="File Name"><input className={inp} value={f.title} onChange={e => sa("files", i, "title", e.target.value)} placeholder="API Reference Guide" /></F>
                  <F label="File URL"><input className={inp} value={f.fileUrl} onChange={e => sa("files", i, "fileUrl", e.target.value)} placeholder="https://..." /></F>
                  <div className="grid grid-cols-3 gap-2">
                    <F label="Size"><input className={inp} value={f.fileSize} onChange={e => sa("files", i, "fileSize", e.target.value)} placeholder="2.4 MB" /></F>
                    <F label="Type">
                      <select className={sel} value={f.fileType} onChange={e => sa("files", i, "fileType", e.target.value)}>
                        {["pdf","docx","xlsx","pptx","zip","image","other"].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </F>
                    <F label="Access">
                      <select className={sel} value={f.accessLevel} onChange={e => sa("files", i, "accessLevel", e.target.value)}>
                        <option value="public">Public</option>
                        <option value="members">Members</option>
                        <option value="premium">Premium</option>
                      </select>
                    </F>
                  </div>
                  <F label="Description (optional)"><input className={inp} value={f.description} onChange={e => sa("files", i, "description", e.target.value)} /></F>
                </Row>
              ))}
            </div>
            <AddBtn label="File" onClick={() => add("files", { title: "", description: "", fileUrl: "", fileSize: "", fileType: "pdf", accessLevel: "public" })} />
          </>
        );

      // ── GALLERY ──────────────────────────────────────────────────────────────
      case "gallery":
        return (
          <>
            <F label="Title" required><input className={inp} value={data.title} onChange={e => sf("title", e.target.value)} /></F>
            <F label="Description"><textarea className={ta} value={data.description} onChange={e => sf("description", e.target.value)} /></F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Layout">
                <select className={sel} value={data.layout} onChange={e => sf("layout", e.target.value)}>
                  <option value="grid-3">Grid 3</option>
                  <option value="grid-4">Grid 4</option>
                  <option value="masonry">Masonry</option>
                  <option value="carousel">Carousel</option>
                </select>
              </F>
              <F label="Columns (desktop)"><input type="number" className={inp} value={data.columnsOnDesktop} min={1} max={6} onChange={e => sf("columnsOnDesktop", +e.target.value)} /></F>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-3 cursor-pointer">
              <input type="checkbox" checked={data.enableLightbox} onChange={e => sf("enableLightbox", e.target.checked)} />
              Enable lightbox
            </label>
            <SectionTitle>Images</SectionTitle>
            <div className="space-y-2">
              {data.images.map((img: any, i: number) => (
                <Row key={i} index={i} onRemove={() => remove("images", i)}>
                  <F label="Image URL"><input className={inp} value={img.imageUrl} onChange={e => sa("images", i, "imageUrl", e.target.value)} placeholder="https://..." /></F>
                  <div className="grid grid-cols-2 gap-2">
                    <F label="Alt Text"><input className={inp} value={img.altText} onChange={e => sa("images", i, "altText", e.target.value)} /></F>
                    <F label="Caption"><input className={inp} value={img.caption} onChange={e => sa("images", i, "caption", e.target.value)} /></F>
                  </div>
                </Row>
              ))}
            </div>
            <AddBtn label="Image" onClick={() => add("images", { imageUrl: "", altText: "", caption: "" })} />
          </>
        );

      // ── MEDIA VIDEO ──────────────────────────────────────────────────────────
      case "media-video":
        return (
          <>
            <F label="Title" required><input className={inp} value={data.title} onChange={e => sf("title", e.target.value)} /></F>
            <F label="Description"><textarea className={ta} value={data.description} onChange={e => sf("description", e.target.value)} /></F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Source Type">
                <select className={sel} value={data.sourceType} onChange={e => sf("sourceType", e.target.value)}>
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="selfHosted">Self-hosted</option>
                </select>
              </F>
              <F label="Aspect Ratio">
                <select className={sel} value={data.aspectRatio} onChange={e => sf("aspectRatio", e.target.value)}>
                  <option value="16-9">16:9</option>
                  <option value="4-3">4:3</option>
                  <option value="1-1">1:1</option>
                  <option value="9-16">9:16</option>
                </select>
              </F>
            </div>
            {data.sourceType === "youtube" && <F label="YouTube URL"><input className={inp} value={data.youtubeUrl} onChange={e => sf("youtubeUrl", e.target.value)} placeholder="https://youtube.com/watch?v=..." /></F>}
            {data.sourceType === "vimeo" && <F label="Vimeo URL"><input className={inp} value={data.vimeoUrl} onChange={e => sf("vimeoUrl", e.target.value)} placeholder="https://vimeo.com/..." /></F>}
            {data.sourceType === "selfHosted" && <F label="Video URL"><input className={inp} value={data.videoUrl} onChange={e => sf("videoUrl", e.target.value)} placeholder="https://..." /></F>}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={data.autoplay} onChange={e => sf("autoplay", e.target.checked)} /> Autoplay
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={data.controls} onChange={e => sf("controls", e.target.checked)} /> Show controls
              </label>
            </div>
          </>
        );

      // ── CARD BOX ─────────────────────────────────────────────────────────────
      case "card-box":
        return (
          <>
            <F label="Title" required><input className={inp} value={data.title} onChange={e => sf("title", e.target.value)} /></F>
            <div className="grid grid-cols-3 gap-3">
              <F label="Columns (desktop)"><input type="number" className={inp} value={data.columnsDesktop} min={1} max={4} onChange={e => sf("columnsDesktop", +e.target.value)} /></F>
              <F label="Columns (mobile)"><input type="number" className={inp} value={data.columnsMobile} min={1} max={2} onChange={e => sf("columnsMobile", +e.target.value)} /></F>
              <F label="Card Height">
                <select className={sel} value={data.cardHeight} onChange={e => sf("cardHeight", e.target.value)}>
                  <option value="auto">Auto</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </F>
            </div>
            <SectionTitle>Cards</SectionTitle>
            <div className="space-y-2">
              {data.cards.map((c: any, i: number) => (
                <Row key={i} index={i} onRemove={() => remove("cards", i)}>
                  <F label="Card Title"><input className={inp} value={c.cardTitle} onChange={e => sa("cards", i, "cardTitle", e.target.value)} /></F>
                  <F label="Description"><textarea className={ta} value={c.description} onChange={e => sa("cards", i, "description", e.target.value)} /></F>
                  <F label="Image URL"><input className={inp} value={c.imageUrl} onChange={e => sa("cards", i, "imageUrl", e.target.value)} placeholder="https://..." /></F>
                  <F label="Image Alt"><input className={inp} value={c.imageAlt} onChange={e => sa("cards", i, "imageAlt", e.target.value)} /></F>
                  <div className="grid grid-cols-2 gap-2">
                    <F label="CTA Text"><input className={inp} value={c.cta.text} onChange={e => san("cards", i, "cta", "text", e.target.value)} placeholder="Learn more" /></F>
                    <F label="CTA URL"><input className={inp} value={c.cta.url} onChange={e => san("cards", i, "cta", "url", e.target.value)} placeholder="/page" /></F>
                  </div>
                </Row>
              ))}
            </div>
            <AddBtn label="Card" onClick={() => add("cards", { cardTitle: "", description: "", imageUrl: "", imageAlt: "", cta: { text: "", url: "", style: "primary", openInNewTab: false } })} />
          </>
        );

      // ── CTA SECTION ──────────────────────────────────────────────────────────
      case "cta-section":
        return (
          <>
            <F label="Title" required><input className={inp} value={data.title} onChange={e => sf("title", e.target.value)} placeholder="Ready to get started?" /></F>
            <F label="Description"><textarea className={ta} value={data.description} onChange={e => sf("description", e.target.value)} /></F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Background Style">
                <select className={sel} value={data.backgroundStyle} onChange={e => sf("backgroundStyle", e.target.value)}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="gradient">Gradient</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </select>
              </F>
              <F label="Text Alignment">
                <select className={sel} value={data.textAlignment} onChange={e => sf("textAlignment", e.target.value)}>
                  <option value="center">Center</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </F>
            </div>
            <SectionTitle>Primary CTA</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <F label="Button Text"><input className={inp} value={data.primaryCta.text} onChange={e => sn("primaryCta", "text", e.target.value)} placeholder="Get Started" /></F>
              <F label="Button URL"><input className={inp} value={data.primaryCta.url} onChange={e => sn("primaryCta", "url", e.target.value)} placeholder="/register" /></F>
            </div>
            <SectionTitle>Secondary CTA (optional)</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <F label="Button Text"><input className={inp} value={data.secondaryCta.text} onChange={e => sn("secondaryCta", "text", e.target.value)} placeholder="Learn more" /></F>
              <F label="Button URL"><input className={inp} value={data.secondaryCta.url} onChange={e => sn("secondaryCta", "url", e.target.value)} placeholder="/docs" /></F>
            </div>
          </>
        );

      // ── CAROUSEL ─────────────────────────────────────────────────────────────
      case "carousel":
        return (
          <>
            <F label="Title" required><input className={inp} value={data.title} onChange={e => sf("title", e.target.value)} /></F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Type">
                <select className={sel} value={data.carouselType} onChange={e => sf("carouselType", e.target.value)}>
                  <option value="content">Content</option>
                  <option value="image">Image</option>
                  <option value="cardBox">Card Box</option>
                  <option value="profile">Profile</option>
                  <option value="resource">Resource</option>
                </select>
              </F>
              <F label="Autoplay Interval (ms)"><input type="number" className={inp} value={data.autoplayInterval} onChange={e => sf("autoplayInterval", +e.target.value)} /></F>
            </div>
            <div className="flex gap-4 mb-3">
              {[["autoplay", "Autoplay"], ["showNavigation", "Navigation"], ["showPagination", "Pagination"]].map(([k, l]) => (
                <label key={k} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={data[k]} onChange={e => sf(k, e.target.checked)} /> {l}
                </label>
              ))}
            </div>
            <SectionTitle>Slides</SectionTitle>
            <div className="space-y-2">
              {data.slides.map((s: any, i: number) => (
                <Row key={i} index={i} onRemove={() => remove("slides", i)}>
                  <F label="Slide Title"><input className={inp} value={s.title} onChange={e => sa("slides", i, "title", e.target.value)} /></F>
                  <F label="Description"><textarea className={ta} value={s.description} onChange={e => sa("slides", i, "description", e.target.value)} /></F>
                  <F label="Image URL"><input className={inp} value={s.imageUrl} onChange={e => sa("slides", i, "imageUrl", e.target.value)} placeholder="https://..." /></F>
                  <div className="grid grid-cols-2 gap-2">
                    <F label="CTA Text"><input className={inp} value={s.ctaText} onChange={e => sa("slides", i, "ctaText", e.target.value)} /></F>
                    <F label="Link URL"><input className={inp} value={s.linkUrl} onChange={e => sa("slides", i, "linkUrl", e.target.value)} /></F>
                  </div>
                </Row>
              ))}
            </div>
            <AddBtn label="Slide" onClick={() => add("slides", { title: "", description: "", imageUrl: "", imageAlt: "", ctaText: "", linkUrl: "" })} />
          </>
        );

      // ── PULL QUOTE ───────────────────────────────────────────────────────────
      case "pull-quote":
        return (
          <>
            <F label="Quote" required><textarea className={ta} value={data.quote} onChange={e => sf("quote", e.target.value)} placeholder="The quote text..." /></F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Author Name"><input className={inp} value={data.author} onChange={e => sf("author", e.target.value)} /></F>
              <F label="Author Title / Role"><input className={inp} value={data.authorTitle} onChange={e => sf("authorTitle", e.target.value)} placeholder="CEO, Acme Inc." /></F>
            </div>
            <F label="Author Photo URL (optional)"><input className={inp} value={data.authorImage} onChange={e => sf("authorImage", e.target.value)} placeholder="https://..." /></F>
            <div className="grid grid-cols-3 gap-3">
              <F label="Quote Type">
                <select className={sel} value={data.quoteType} onChange={e => sf("quoteType", e.target.value)}>
                  <option value="testimonial">Testimonial</option>
                  <option value="successStory">Success Story</option>
                  <option value="endorsement">Endorsement</option>
                  <option value="quote">Quote</option>
                </select>
              </F>
              <F label="Background">
                <select className={sel} value={data.backgroundColor} onChange={e => sf("backgroundColor", e.target.value)}>
                  <option value="light">Light</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="gradient">Gradient</option>
                </select>
              </F>
              <F label="Rating (0–5)"><input type="number" className={inp} min={0} max={5} value={data.rating} onChange={e => sf("rating", +e.target.value)} /></F>
            </div>
          </>
        );

      // ── LOGO WALL ────────────────────────────────────────────────────────────
      case "logo-wall":
        return (
          <>
            <F label="Title" required><input className={inp} value={data.title} onChange={e => sf("title", e.target.value)} placeholder="Our Partners" /></F>
            <F label="Description"><textarea className={ta} value={data.description} onChange={e => sf("description", e.target.value)} /></F>
            <div className="grid grid-cols-3 gap-3">
              <F label="Columns (desktop)"><input type="number" className={inp} value={data.columnsDesktop} min={2} max={8} onChange={e => sf("columnsDesktop", +e.target.value)} /></F>
              <F label="Columns (mobile)"><input type="number" className={inp} value={data.columnsMobile} min={1} max={4} onChange={e => sf("columnsMobile", +e.target.value)} /></F>
              <F label="Alignment">
                <select className={sel} value={data.alignmentStyle} onChange={e => sf("alignmentStyle", e.target.value)}>
                  <option value="center">Center</option>
                  <option value="left">Left</option>
                  <option value="grid">Grid</option>
                </select>
              </F>
            </div>
            <SectionTitle>Logos</SectionTitle>
            <div className="space-y-2">
              {data.logos.map((logo: any, i: number) => (
                <Row key={i} index={i} onRemove={() => remove("logos", i)}>
                  <F label="Logo URL"><input className={inp} value={logo.logoUrl} onChange={e => sa("logos", i, "logoUrl", e.target.value)} placeholder="https://..." /></F>
                  <div className="grid grid-cols-2 gap-2">
                    <F label="Company Name"><input className={inp} value={logo.companyName} onChange={e => sa("logos", i, "companyName", e.target.value)} /></F>
                    <F label="Alt Text"><input className={inp} value={logo.altText} onChange={e => sa("logos", i, "altText", e.target.value)} /></F>
                  </div>
                  <F label="Link URL (optional)"><input className={inp} value={logo.linkUrl} onChange={e => sa("logos", i, "linkUrl", e.target.value)} placeholder="https://..." /></F>
                </Row>
              ))}
            </div>
            <AddBtn label="Logo" onClick={() => add("logos", { logoUrl: "", altText: "", companyName: "", linkUrl: "" })} />
          </>
        );

      // ── CODE SNIPPET ─────────────────────────────────────────────────────────
      case "code-snippet":
        return (
          <>
            <F label="Title"><input className={inp} value={data.title} onChange={e => sf("title", e.target.value)} /></F>
            <F label="Description"><textarea className={ta} value={data.description} onChange={e => sf("description", e.target.value)} /></F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Embed Type">
                <select className={sel} value={data.embedType} onChange={e => sf("embedType", e.target.value)}>
                  <option value="iframe">iFrame</option>
                  <option value="script">Script</option>
                </select>
              </F>
              <F label="Aspect Ratio">
                <select className={sel} value={data.aspectRatio} onChange={e => sf("aspectRatio", e.target.value)}>
                  <option value="16-9">16:9</option>
                  <option value="4-3">4:3</option>
                  <option value="1-1">1:1</option>
                  <option value="auto">Auto</option>
                </select>
              </F>
            </div>
            {data.embedType === "iframe" ? (
              <F label="iFrame HTML Code" required>
                <textarea className={ta + " min-h-[120px] font-mono text-xs"} value={data.iframeCode} onChange={e => sf("iframeCode", e.target.value)} placeholder={'<iframe src="https://..." ...></iframe>'} />
              </F>
            ) : (
              <F label="Script Code" required>
                <textarea className={ta + " min-h-[120px] font-mono text-xs"} value={data.scriptCode} onChange={e => sf("scriptCode", e.target.value)} placeholder={'<script src="https://..."></script>'} />
              </F>
            )}
            <div className="grid grid-cols-2 gap-3">
              <F label="Max Width px (optional)"><input type="number" className={inp} value={data.maxWidth} onChange={e => sf("maxWidth", parseInt(e.target.value) || 0)} placeholder="900" /></F>
              <F label="Fallback Text"><input className={inp} value={data.fallbackText} onChange={e => sf("fallbackText", e.target.value)} /></F>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={data.allowFullscreen} onChange={e => sf("allowFullscreen", e.target.checked)} />
              Allow fullscreen
            </label>
          </>
        );

      default:
        return <p className="text-sm text-gray-500">No form available for this block type.</p>;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      {renderFields()}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="mt-4 pt-3 border-t">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save Block"}
        </button>
      </div>
    </form>
  );
}
