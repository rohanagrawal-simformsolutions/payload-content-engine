"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RichTextEditor from "@/components/RichTextEditor";
import { getBlocks, BlockType } from "@/lib/blocks";

const BLOCK_TYPES: { key: BlockType; label: string; icon: string }[] = [
  { key: "accordion",    label: "Accordion",     icon: "📋" },
  { key: "tabs",         label: "Tabs",          icon: "🗂" },
  { key: "two-column",   label: "Two Column",    icon: "⬛" },
  { key: "downloads",    label: "Downloads",     icon: "📥" },
  { key: "gallery",      label: "Gallery",       icon: "🖼" },
  { key: "media-video",  label: "Media / Video", icon: "🎬" },
  { key: "card-box",     label: "Card Box",      icon: "🃏" },
  { key: "cta-section",  label: "CTA Section",   icon: "📢" },
  { key: "carousel",     label: "Carousel",      icon: "🎠" },
  { key: "pull-quote",   label: "Pull Quote",    icon: "💬" },
  { key: "logo-wall",    label: "Logo Wall",     icon: "🏢" },
  { key: "code-snippet", label: "Code / Embed",  icon: "💻" },
];

interface User {
  id: string;
  email: string;
  name: string;
}

export default function CreateArticlePage() {
  return (
    <ProtectedRoute>
      <CreateArticleForm />
    </ProtectedRoute>
  );
}

function CreateArticleForm() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summaryTitle: "",
    content: "",
    featuredImage: "",
    tags: "",
    author: "",
    status: "published" as "draft" | "published",
    searchExclude: false,
    promoted: false,
    seo: {
      metaTitle: "",
      metaDescription: "",
      ogImage: "",
      canonicalUrl: "",
      noIndex: false,
    },
  });
  const [users, setUsers] = useState<User[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Block picker state ───────────────────────────────────────────────────
  const [attachedBlocks, setAttachedBlocks] = useState<any[]>([]);
  const [pickerType, setPickerType] = useState<BlockType>("accordion");
  const [pickerItems, setPickerItems] = useState<any[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  const loadPickerBlocks = async (type: BlockType) => {
    setPickerType(type);
    setPickerLoading(true);
    try {
      const res = await getBlocks(type, 1, 50);
      setPickerItems(res.docs ?? []);
    } catch {
      setPickerItems([]);
    } finally {
      setPickerLoading(false);
    }
  };

  const attachBlock = (doc: any) => {
    if (attachedBlocks.some((b) => b.id === doc.id && b.blockType === pickerType)) return;
    setAttachedBlocks((prev) => [...prev, { ...doc, blockType: pickerType }]);
  };

  const removeAttached = (id: string) =>
    setAttachedBlocks((prev) => prev.filter((b) => b.id !== id));

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        setUsers(response.data);
        // Auto-select current user if not already selected
        if (!formData.author && user?.id) {
          setFormData((prev) => ({ ...prev, author: user.id }));
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    fetchUsers();
  }, [user?.id]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, featuredImage: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert plain text to Lexical format
  const convertToLexical = (html: string) => {
    if (!html) {
      return {
        root: {
          type: "root",
          children: [],
        },
      };
    }

    // For now, we'll store the HTML as-is
    // In production, you'd want to properly parse HTML to Lexical format
    return {
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: html,
              },
            ],
          },
        ],
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const articleData = {
        title: formData.title,
        slug: formData.slug,
        summaryTitle: formData.summaryTitle,
        content: convertToLexical(formData.content),
        featuredImage: formData.featuredImage,
        tags: tagsArray,
        status: formData.status,
        searchExclude: formData.searchExclude,
        promoted: formData.promoted,
        blocks: attachedBlocks,
        seo: {
          metaTitle: formData.seo.metaTitle || undefined,
          metaDescription: formData.seo.metaDescription || undefined,
          ogImage: formData.seo.ogImage || undefined,
          canonicalUrl: formData.seo.canonicalUrl || undefined,
          noIndex: formData.seo.noIndex,
        },
      };

      await api.post("/admin/articles", articleData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      router.push("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to create article. Please try again."
      );
      console.error("Error details:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← Back to home
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Create New Article
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
            <p className="mt-1 text-sm text-gray-500">
              URL-friendly version of the title
            </p>
          </div>

          <div>
            <label
              htmlFor="featuredImage"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Featured Image
            </label>
            <input
              type="file"
              id="featuredImage"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-xs h-auto rounded-md shadow"
                />
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="summaryTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Summary / Short Description
            </label>
            <textarea
              id="summaryTitle"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the article"
              value={formData.summaryTitle}
              onChange={(e) =>
                setFormData({ ...formData, summaryTitle: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content * (Rich Text Editor)
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(content) =>
                setFormData({ ...formData, content })
              }
              placeholder="Write your article content here..."
            />
          </div>

          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Author
            </label>
            <select
              id="author"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
            >
              <option value="">Select an author</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="technology, web development, tutorial"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          {/* ── Block Picker ────────────────────────────────────────────── */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Attach Content Blocks</h3>
            <p className="text-xs text-gray-500 mb-3">
              Pick a block type, select saved blocks, and they'll render below the article content.
            </p>

            {/* Type selector */}
            <div className="flex flex-wrap gap-2 mb-3">
              {BLOCK_TYPES.map(({ key, label, icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => loadPickerBlocks(key)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    pickerType === key && pickerItems.length >= 0
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Available blocks of selected type */}
            {pickerLoading && <p className="text-xs text-gray-400">Loading…</p>}
            {!pickerLoading && pickerItems.length > 0 && (
              <div className="space-y-1 mb-3 max-h-40 overflow-y-auto border border-gray-200 rounded bg-white p-2">
                {pickerItems.map((doc) => {
                  const attached = attachedBlocks.some((b) => b.id === doc.id && b.blockType === pickerType);
                  return (
                    <div key={doc.id} className="flex items-center justify-between text-xs py-1 px-2 hover:bg-gray-50 rounded">
                      <span className="text-gray-700 truncate">{doc.title || doc.id}</span>
                      <button
                        type="button"
                        onClick={() => attachBlock(doc)}
                        disabled={attached}
                        className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                          attached ? "text-green-600 bg-green-50" : "text-blue-600 hover:bg-blue-50"
                        }`}
                      >
                        {attached ? "✓ Added" : "+ Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {!pickerLoading && pickerItems.length === 0 && pickerType && (
              <p className="text-xs text-gray-400 mb-3">No saved {pickerType} blocks yet. Create one in the Blocks page.</p>
            )}

            {/* Attached blocks list */}
            {attachedBlocks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Attached ({attachedBlocks.length}):</p>
                <div className="space-y-1">
                  {attachedBlocks.map((b, i) => (
                    <div key={b.id} className="flex items-center justify-between bg-white border border-gray-200 rounded px-2 py-1 text-xs">
                      <span className="text-gray-500 font-mono mr-2">#{i + 1}</span>
                      <span className="flex-1 truncate text-gray-700">{b.title || b.id}</span>
                      <span className="text-gray-400 mx-2">{BLOCK_TYPES.find(t => t.key === b.blockType)?.icon} {b.blockType}</span>
                      <button type="button" onClick={() => removeAttached(b.id)} className="text-red-400 hover:text-red-600">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── SEO Section ──────────────────────────────────────────────── */}
          <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
            <h3 className="text-sm font-semibold text-indigo-800 mb-1">🔍 SEO Settings</h3>
            <p className="text-xs text-indigo-600 mb-4">
              These fields are injected as &lt;head&gt; meta tags by the frontend. Leave blank to fall back to the article title and summary.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="seo-metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                  <span className="ml-2 text-xs font-normal text-gray-400">50–60 characters recommended</span>
                </label>
                <input
                  type="text"
                  id="seo-metaTitle"
                  maxLength={70}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="e.g. Mastering Myopia | Training Programs"
                  value={formData.seo.metaTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, seo: { ...prev.seo, metaTitle: e.target.value } }))
                  }
                />
                <p className="mt-1 text-xs text-gray-400">{formData.seo.metaTitle.length}/70 chars</p>
              </div>

              <div>
                <label htmlFor="seo-metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                  <span className="ml-2 text-xs font-normal text-gray-400">150–160 characters recommended</span>
                </label>
                <textarea
                  id="seo-metaDescription"
                  rows={3}
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Brief description shown in search results…"
                  value={formData.seo.metaDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, seo: { ...prev.seo, metaDescription: e.target.value } }))
                  }
                />
                <p className="mt-1 text-xs text-gray-400">{formData.seo.metaDescription.length}/200 chars</p>
              </div>

              <div>
                <label htmlFor="seo-ogImage" className="block text-sm font-medium text-gray-700 mb-1">
                  Open Graph Image URL
                  <span className="ml-2 text-xs font-normal text-gray-400">1200×630 px recommended</span>
                </label>
                <input
                  type="url"
                  id="seo-ogImage"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="https://example.com/images/og-image.jpg"
                  value={formData.seo.ogImage}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, seo: { ...prev.seo, ogImage: e.target.value } }))
                  }
                />
                <p className="mt-1 text-xs text-gray-400">Shown when shared on social media. Falls back to featured image.</p>
              </div>

              <div>
                <label htmlFor="seo-canonicalUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Canonical URL
                </label>
                <input
                  type="url"
                  id="seo-canonicalUrl"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="https://example.com/articles/my-article (leave blank for default)"
                  value={formData.seo.canonicalUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, seo: { ...prev.seo, canonicalUrl: e.target.value } }))
                  }
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.seo.noIndex}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, seo: { ...prev.seo, noIndex: e.target.checked } }))
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    No Index — hide from search engines
                    <span className="ml-1 text-xs text-gray-400">(adds &lt;meta name="robots" content="noindex"&gt;)</span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Status *
            </label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "draft" | "published",
                })
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.searchExclude}
                  onChange={(e) =>
                    setFormData({ ...formData, searchExclude: e.target.checked })
                  }
                  className="rounded border-gray-300 mr-2"
                />
                <span className="text-sm text-gray-700">Exclude from search</span>
              </label>
            </div>
            <div className="flex-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.promoted}
                  onChange={(e) =>
                    setFormData({ ...formData, promoted: e.target.checked })
                  }
                  className="rounded border-gray-300 mr-2"
                />
                <span className="text-sm text-gray-700">Promote this article</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? "Creating..." : "Create Article"}
            </button>
            <Link
              href="/"
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
