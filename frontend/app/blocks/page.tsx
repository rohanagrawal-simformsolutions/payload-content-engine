"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getBlocks, deleteBlock, BlockType } from "@/lib/blocks";
import BlockRenderer from "@/components/BlockRenderer";
import BlockCreateForm from "@/components/blocks/BlockCreateForm";

// ─── Block type meta ─────────────────────────────────────────────────────────
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

function toRenderable(blockType: BlockType, doc: any) {
  if (blockType === "tabs" && doc.tabs) {
    return {
      ...doc,
      blockType,
      tabs: doc.tabs.map((t: any) => ({
        ...t,
        blocks: t.blocks ?? [{ blockType: "richText", content: t.content ?? "" }],
      })),
    };
  }
  return { ...doc, blockType };
}

export default function BlocksPage() {
  const { isAuthenticated, token } = useAuth();

  const [activeType, setActiveType] = useState<BlockType>("accordion");
  const [view, setView] = useState<"list" | "create">("list");
  const [blocks, setBlocks] = useState<any[]>([]);
  const [counts, setCounts] = useState<Partial<Record<BlockType, number>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewBlock, setPreviewBlock] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchBlocks = useCallback(async (type: BlockType) => {
    setLoading(true);
    setError("");
    try {
      const res = await getBlocks(type, 1, 50);
      setBlocks(res.docs ?? []);
      setCounts(prev => ({ ...prev, [type]: res.totalDocs ?? res.docs?.length ?? 0 }));
    } catch (e: any) {
      setError(e?.message || "Failed to load blocks");
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlocks(activeType);
    setPreviewBlock(null);
    setView("list");
  }, [activeType, fetchBlocks]);

  const handleCreated = (_block: any) => {
    setSuccessMsg("Block saved successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
    fetchBlocks(activeType);
    setView("list");
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm("Delete this block? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await deleteBlock(activeType, id, token);
      setBlocks(prev => prev.filter(b => b.id !== id));
      setCounts(prev => ({ ...prev, [activeType]: Math.max(0, (prev[activeType] ?? 1) - 1) }));
      if (previewBlock?.id === id) setPreviewBlock(null);
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const getBlockTitle = (doc: any): string =>
    doc.title || doc.quote?.substring(0, 60) || `Block #${doc.id}`;

  const activeLabel = BLOCK_TYPES.find(t => t.key === activeType)?.label ?? activeType;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Component Library</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Create, manage and preview CMS blocks — all stored in Payload DB
            </p>
          </div>
          {!isAuthenticated && (
            <a
              href="/login"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Login to create blocks
            </a>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex gap-0 min-h-[calc(100vh-100px)]">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 flex-shrink-0">
          <div className="p-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
              Block Types
            </p>
            <nav className="space-y-0.5">
              {BLOCK_TYPES.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveType(key)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors ${
                    activeType === key
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span>{label}</span>
                  </span>
                  {(counts[key] ?? 0) > 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        activeType === key
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {counts[key]}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 overflow-y-auto p-6">
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {successMsg}
            </div>
          )}

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">{activeLabel}</h2>
              {blocks.length > 0 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {blocks.length} stored
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setView("list"); setPreviewBlock(null); }}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  view === "list"
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Saved Blocks
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => setView("create")}
                  className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                    view === "create"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  + Create New
                </button>
              )}
            </div>
          </div>

          {/* Create form */}
          {view === "create" && isAuthenticated && token && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <h3 className="text-sm font-semibold text-gray-700">Create {activeLabel}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Fill in the fields and click Save. The block will be stored in Payload DB.
                </p>
              </div>
              <div className="p-5">
                <BlockCreateForm
                  key={activeType}
                  blockType={activeType}
                  token={token}
                  onCreated={handleCreated}
                />
              </div>
            </div>
          )}

          {/* Saved blocks list */}
          {view === "list" && (
            <>
              {loading && (
                <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                  Loading…
                </div>
              )}
              {error && !loading && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}
              {!loading && !error && blocks.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-sm font-medium text-gray-500">
                    No {activeLabel} blocks saved yet
                  </p>
                  {isAuthenticated ? (
                    <button
                      onClick={() => setView("create")}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Create the first one →
                    </button>
                  ) : (
                    <p className="mt-2 text-xs text-gray-400">
                      <a href="/login" className="text-blue-500 hover:underline">Login</a>{" "}
                      to create blocks
                    </p>
                  )}
                </div>
              )}
              {!loading && blocks.length > 0 && (
                <div className="space-y-3">
                  {blocks.map(doc => (
                    <div
                      key={doc.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {getBlockTitle(doc)}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            ID:{" "}
                            <span className="font-mono">{doc.id}</span>
                            {doc.createdAt && (
                              <> · {new Date(doc.createdAt).toLocaleDateString()}</>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() =>
                              previewBlock?.id === doc.id
                                ? setPreviewBlock(null)
                                : setPreviewBlock(doc)
                            }
                            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                              previewBlock?.id === doc.id
                                ? "bg-purple-600 text-white"
                                : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                            }`}
                          >
                            {previewBlock?.id === doc.id ? "Hide Preview" : "Preview"}
                          </button>
                          {isAuthenticated && (
                            <button
                              onClick={() => handleDelete(doc.id)}
                              disabled={deleting === doc.id}
                              className="text-xs px-3 py-1.5 rounded-md font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 disabled:opacity-40"
                            >
                              {deleting === doc.id ? "…" : "Delete"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Inline preview */}
                      {previewBlock?.id === doc.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                            <span className="text-xs font-medium text-purple-600">
                              Live Preview — rendered from saved data
                            </span>
                          </div>
                          <div className="rounded-lg overflow-hidden border border-gray-100 bg-white p-4">
                            <BlockRenderer blocks={[toRenderable(activeType, doc)]} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
