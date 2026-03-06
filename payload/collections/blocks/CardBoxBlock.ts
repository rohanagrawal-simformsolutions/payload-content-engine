import { CollectionConfig } from "payload";

export const CardBoxBlock: CollectionConfig = {
  slug: "card-box-blocks",
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
      name: "cards",
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 12,
      label: "Cards",
      fields: [
        {
          name: "cardTitle",
          type: "text",
          required: true,
          label: "Card Title",
        },
        {
          name: "description",
          type: "textarea",
          required: true,
          label: "Card Description",
          admin: {
            description: "Brief description; will be truncated if too long",
          },
        },
        {
          name: "imageUrl",
          type: "text",
          label: "Card Image URL",
          admin: {
            description: "Optional image URL (if omitted, text-only card)",
          },
        },
        {
          name: "imageAlt",
          type: "text",
          label: "Image Alt Text",
          admin: {
            condition: (_, siblingData) => !!siblingData.imageUrl,
          },
        },
        {
          name: "cta",
          type: "group",
          label: "Call-to-Action",
          admin: {
            description: "Optional CTA button",
          },
          fields: [
            {
              name: "text",
              type: "text",
              label: "CTA Text",
            },
            {
              name: "url",
              type: "text",
              label: "CTA URL",
              admin: {
                condition: (_, siblingData) => !!siblingData.text,
              },
            },
            {
              name: "style",
              type: "select",
              defaultValue: "primary",
              options: [
                { label: "Primary", value: "primary" },
                { label: "Secondary", value: "secondary" },
                { label: "Tertiary", value: "tertiary" },
              ],
              admin: {
                condition: (_, siblingData) => !!siblingData.text,
              },
            },
          ],
        },
      ],
    },
    {
      name: "columnsDesktop",
      type: "number",
      defaultValue: 3,
      min: 1,
      max: 4,
      label: "Columns on Desktop",
    },
    {
      name: "columnsMobile",
      type: "number",
      defaultValue: 1,
      min: 1,
      max: 2,
      label: "Columns on Mobile",
    },
    {
      name: "cardHeight",
      type: "select",
      defaultValue: "auto",
      options: [
        { label: "Auto", value: "auto" },
        { label: "Small", value: "small" },
        { label: "Medium", value: "medium" },
        { label: "Large", value: "large" },
      ],
      label: "Card Height",
    },
  ],
};
