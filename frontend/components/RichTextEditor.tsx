"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";
import { useState } from "react";
import "./RichTextEditor.css";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  enableAdvanced?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
  enableAdvanced = true,
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return <div className="editor-loading">Loading editor...</div>;
  }

  const addLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl("");
      setShowLinkDialog(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <span className="toolbar-label">Text:</span>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`toolbar-btn ${editor.isActive("bold") ? "is-active" : ""}`}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`toolbar-btn ${editor.isActive("italic") ? "is-active" : ""}`}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`toolbar-btn ${editor.isActive("underline") ? "is-active" : ""}`}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-group">
          <span className="toolbar-label">Headings:</span>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`toolbar-btn ${editor.isActive("heading", { level: 1 }) ? "is-active" : ""}`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`toolbar-btn ${editor.isActive("heading", { level: 2 }) ? "is-active" : ""}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`toolbar-btn ${editor.isActive("heading", { level: 3 }) ? "is-active" : ""}`}
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            className={`toolbar-btn ${editor.isActive("heading", { level: 4 }) ? "is-active" : ""}`}
            title="Heading 4"
          >
            H4
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`toolbar-btn ${editor.isActive("paragraph") ? "is-active" : ""}`}
            title="Paragraph"
          >
            ¶
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-group">
          <span className="toolbar-label">Lists:</span>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`toolbar-btn ${editor.isActive("bulletList") ? "is-active" : ""}`}
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`toolbar-btn ${editor.isActive("orderedList") ? "is-active" : ""}`}
            title="Ordered List"
          >
            1. List
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-group">
          <span className="toolbar-label">Alignment:</span>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`toolbar-btn ${editor.isActive({ textAlign: "left" }) ? "is-active" : ""}`}
            title="Align Left"
          >
            ⬅
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`toolbar-btn ${editor.isActive({ textAlign: "center" }) ? "is-active" : ""}`}
            title="Align Center"
          >
            ⬆⬇
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`toolbar-btn ${editor.isActive({ textAlign: "right" }) ? "is-active" : ""}`}
            title="Align Right"
          >
            ➡
          </button>
        </div>

        {enableAdvanced && (
          <>
            <div className="toolbar-divider"></div>

            <div className="toolbar-group">
              <span className="toolbar-label">Advanced:</span>
              <button
                type="button"
                onClick={() => setShowLinkDialog(true)}
                className={`toolbar-btn ${editor.isActive("link") ? "is-active" : ""}`}
                title="Add Link"
              >
                🔗
              </button>
              {editor.isActive("link") && (
                <button
                  type="button"
                  onClick={removeLink}
                  className="toolbar-btn danger"
                  title="Remove Link"
                >
                  ✕
                </button>
              )}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`toolbar-btn ${editor.isActive("codeBlock") ? "is-active" : ""}`}
                title="Code Block"
              >
                &lt;/&gt;
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`toolbar-btn ${editor.isActive("blockquote") ? "is-active" : ""}`}
                title="Blockquote"
              >
                &quot;
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="toolbar-btn"
                title="Horizontal Rule"
              >
                —
              </button>
            </div>

            <div className="toolbar-divider"></div>

            <div className="toolbar-group">
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                className="toolbar-btn"
                title="Undo"
              >
                ↶
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                className="toolbar-btn"
                title="Redo"
              >
                ↷
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().clearNodes().run()}
                className="toolbar-btn"
                title="Clear Formatting"
              >
                ✎
              </button>
            </div>
          </>
        )}
      </div>

      {showLinkDialog && (
        <div className="link-dialog">
          <input
            type="text"
            placeholder="Enter URL (e.g., https://example.com)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addLink();
              if (e.key === "Escape") setShowLinkDialog(false);
            }}
            autoFocus
          />
          <button onClick={addLink} className="dialog-btn-primary">
            Add Link
          </button>
          <button
            onClick={() => setShowLinkDialog(false)}
            className="dialog-btn-secondary"
          >
            Cancel
          </button>
        </div>
      )}

      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
