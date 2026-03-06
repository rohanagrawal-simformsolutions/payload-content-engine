import { CollectionConfig } from "payload";

export const TabsBlock: CollectionConfig = {
  slug: "tabs-blocks",
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
      name: "anchorId",
      type: "text",
      label: "Anchor ID",
      admin: {
        description: "Optional anchor ID for linking",
      },
    },
    {
      name: "tabs",
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 10,
      fields: [
        {
          name: "tabTitle",
          type: "text",
          required: true,
          label: "Tab Title",
        },
        {
          name: "tabId",
          type: "text",
          required: true,
          label: "Tab ID",
          admin: {
            description: "Unique identifier for tab (e.g., overview)",
          },
        },
        {
          name: "nestedBlocks",
          type: "json",
          label: "Nested Blocks (JSON)",
          admin: {
            description:
              "Optional: paste a block array to render inside this tab. Overrides Content Blocks below.",
          },
        },
        {
          name: "blocks",
          type: "array",
          label: "Content Blocks (legacy)",
          maxRows: 5,
          fields: [
            {
              name: "blockType",
              type: "select",
              required: true,
              options: [
                { label: "Rich Text", value: "richText" },
                { label: "Accordion", value: "accordion" },
                { label: "Media/Video", value: "media" },
                { label: "Downloads", value: "downloads" },
                { label: "CTA", value: "cta" },
              ],
            },
            {
              name: "content",
              type: "textarea",
              admin: {
                condition: (_, siblingData) =>
                  siblingData.blockType === "richText",
                description: "Plain text/HTML content.",
              },
            },
            {
              name: "mediaUrl",
              type: "text",
              admin: {
                condition: (_, siblingData) =>
                  siblingData.blockType === "media",
              },
            },
            {
              name: "ctaText",
              type: "text",
              admin: {
                condition: (_, siblingData) => siblingData.blockType === "cta",
              },
            },
            {
              name: "ctaUrl",
              type: "text",
              admin: {
                condition: (_, siblingData) => siblingData.blockType === "cta",
              },
            },
          ],
        },
      ],
    },
    {
      name: "activeTabIndex",
      type: "number",
      defaultValue: 0,
      label: "Default Active Tab",
    },
  ],
};
