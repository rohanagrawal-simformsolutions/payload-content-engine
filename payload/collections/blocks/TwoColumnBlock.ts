import { CollectionConfig } from "payload";

export const TwoColumnBlock: CollectionConfig = {
  slug: "two-column-blocks",
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
      name: "layout",
      type: "select",
      required: true,
      defaultValue: "imageText",
      options: [
        { label: "Image + Text", value: "imageText" },
        { label: "Text + Image", value: "textImage" },
        { label: "Text + Text", value: "textText" },
      ],
      label: "Layout Type",
    },
    {
      name: "leftColumn",
      type: "group",
      label: "Left Column",
      fields: [
        {
          name: "contentType",
          type: "select",
          required: true,
          options: [
            { label: "Rich Text", value: "richText" },
            { label: "Media", value: "media" },
            { label: "Nested Blocks", value: "blocks" },
          ],
        },
        {
          name: "richText",
          type: "textarea",
          admin: {
            condition: (_, siblingData) =>
              siblingData.contentType === "richText",
            description: "Plain text/HTML content.",
          },
        },
        {
          name: "nestedBlocks",
          type: "json",
          label: "Nested Blocks (JSON)",
          admin: {
            condition: (_, siblingData) => siblingData.contentType === "blocks",
            description:
              "Paste a block array (e.g. a Gallery, CardBox) to render in this column.",
          },
        },
        {
          name: "mediaUrl",
          type: "text",
          admin: {
            condition: (_, siblingData) => siblingData.contentType === "media",
          },
        },
        {
          name: "mediaAlt",
          type: "text",
          admin: {
            condition: (_, siblingData) => siblingData.contentType === "media",
          },
        },
      ],
    },
    {
      name: "rightColumn",
      type: "group",
      label: "Right Column",
      fields: [
        {
          name: "contentType",
          type: "select",
          required: true,
          options: [
            { label: "Rich Text", value: "richText" },
            { label: "Media", value: "media" },
            { label: "Nested Blocks", value: "blocks" },
          ],
        },
        {
          name: "richText",
          type: "textarea",
          admin: {
            condition: (_, siblingData) =>
              siblingData.contentType === "richText",
            description: "Plain text/HTML content.",
          },
        },
        {
          name: "nestedBlocks",
          type: "json",
          label: "Nested Blocks (JSON)",
          admin: {
            condition: (_, siblingData) => siblingData.contentType === "blocks",
            description:
              "Paste a block array (e.g. a Gallery, CardBox) to render in this column.",
          },
        },
        {
          name: "mediaUrl",
          type: "text",
          admin: {
            condition: (_, siblingData) => siblingData.contentType === "media",
          },
        },
        {
          name: "mediaAlt",
          type: "text",
          admin: {
            condition: (_, siblingData) => siblingData.contentType === "media",
          },
        },
      ],
    },
    {
      name: "columnRatio",
      type: "select",
      defaultValue: "50-50",
      options: [
        { label: "50-50", value: "50-50" },
        { label: "60-40", value: "60-40" },
        { label: "40-60", value: "40-60" },
        { label: "70-30", value: "70-30" },
        { label: "30-70", value: "30-70" },
      ],
      label: "Column Width Ratio",
    },
    {
      name: "reverseOnMobile",
      type: "checkbox",
      defaultValue: false,
      label: "Stack Vertically on Mobile",
    },
  ],
};
