import { CollectionConfig } from "payload";

export const CodeSnippetBlock: CollectionConfig = {
  slug: "code-snippet-blocks",
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Block Title",
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      admin: {
        description: "Brief description of the embedded content",
      },
    },
    {
      name: "embedType",
      type: "select",
      required: true,
      defaultValue: "iframe",
      options: [
        { label: "Iframe Embed", value: "iframe" },
        { label: "Script Embed", value: "script" },
      ],
      label: "Embed Type",
      admin: {
        description: "Iframe is recommended for security",
      },
    },
    {
      name: "iframeCode",
      type: "textarea",
      admin: {
        condition: (_, siblingData) => siblingData.embedType === "iframe",
        description: "HTML iframe embed code",
      },
    },
    {
      name: "scriptCode",
      type: "textarea",
      admin: {
        condition: (_, siblingData) => siblingData.embedType === "script",
        description: "HTML script embed code (restricted)",
      },
    },
    {
      name: "aspectRatio",
      type: "select",
      defaultValue: "16-9",
      options: [
        { label: "16:9 (Landscape)", value: "16-9" },
        { label: "4:3 (Standard)", value: "4-3" },
        { label: "1:1 (Square)", value: "1-1" },
        { label: "Auto", value: "auto" },
      ],
      label: "Embed Aspect Ratio",
      admin: {
        description: "Controls responsive sizing",
      },
    },
    {
      name: "maxWidth",
      type: "number",
      defaultValue: 1200,
      min: 300,
      max: 1920,
      label: "Max Width (px)",
      admin: {
        description: "Maximum container width",
      },
    },
    {
      name: "allowFullscreen",
      type: "checkbox",
      defaultValue: true,
      label: "Allow Fullscreen",
    },
    {
      name: "sandboxRestrictions",
      type: "checkbox",
      defaultValue: true,
      label: "Enable Sandbox Security",
      admin: {
        description: "Restricts embedded script capabilities (recommended)",
      },
    },
    {
      name: "fallbackText",
      type: "textarea",
      label: "Fallback Text",
      admin: {
        description: "Text to show if embed fails to load",
      },
    },
  ],
};
