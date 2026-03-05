"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RichTextEditor from "@/components/RichTextEditor";

export default function EditArticlePage() {
  return (
    <ProtectedRoute>
      <EditArticleForm />
    </ProtectedRoute>
  );
}

function EditArticleForm() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { token } = useAuth();

  const [articleId, setArticleId] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summaryTitle: "",
    content: "",
    featuredImage: "",
    tags: "",
    status: "published" as "draft" | "published",
    searchExclude: false,
    promoted: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (slug) fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`http://localhost:3000/articles/${slug}`);
      if (!response.ok) throw new Error("Article not found");
      const data = await response.json();

      setArticleId(data.id);

      // Extract text content from Lexical format for the editor
      let contentHtml = "";
      if (data.content?.root?.children) {
        contentHtml = extractHtmlFromLexical(data.content);
      }

      // Extract tags as comma-separated string
      const tagsStr = (data.tags || [])
        .map((t: any) => (typeof t === "string" ? t : t?.tag || ""))
        .filter(Boolean)
        .join(", ");

      setFormData({
        title: data.title || "",
        slug: data.slug || "",
        summaryTitle: data.summaryTitle || "",
        content: contentHtml,
        featuredImage: data.featuredImage || "",
        tags: tagsStr,
        status: data.status || "published",
        searchExclude: data.searchExclude || false,
        promoted: data.promoted || false,
      });

      if (data.featuredImage) {
        setImagePreview(data.featuredImage);
      }
    } catch (err) {
      setError("Failed to load article");
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const extractHtmlFromLexical = (content: any): string => {
    if (!content?.root?.children) return "";
    return content.root.children
      .map((node: any) => {
        if (node.children) {
          return node.children
            .map((child: any) => child.text || "")
            .join("");
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");
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

  const removeImage = () => {
    setFormData({ ...formData, featuredImage: "" });
    setImagePreview(null);
  };

  const convertToLexical = (html: string) => {
    if (!html) {
      return { root: { type: "root", children: [] } };
    }

    return {
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", text: html }],
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
      };

      await api.put(`/admin/articles/${articleId}`, articleData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      router.push(`/articles/${formData.slug}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to update article. Please try again."
      );
      console.error("Error details:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading article...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link href={`/articles/${slug}`} className="text-blue-600 hover:text-blue-800">
          ← Back to article
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Article</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-2">
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
                <p className="text-sm text-gray-600 mb-2">Current image:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-xs h-auto rounded-md shadow"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove image
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="summaryTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Summary / Short Description
            </label>
            <textarea
              id="summaryTitle"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="technology, web development, tutorial"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
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
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href={`/articles/${slug}`}
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
