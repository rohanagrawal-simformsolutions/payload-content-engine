import { CollectionConfig } from "payload";

export const CTASectionBlock: CollectionConfig = {
  slug: "cta-section-blocks",
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Section Title",
    },
    {
      name: "description",
      type: "richText",
      label: "Description",
      admin: {
        description: "Optional description or call-to-action copy",
      },
    },
    {
      name: "primaryCta",
      type: "group",
      required: true,
      label: "Primary CTA",
      fields: [
        {
          name: "text",
          type: "text",
          required: true,
          label: "Button Text",
        },
        {
          name: "url",
          type: "text",
          required: true,
          label: "Button URL",
        },
        {
          name: "openInNewTab",
          type: "checkbox",
          defaultValue: false,
          label: "Open in New Tab",
        },
      ],
    },
    {
      name: "secondaryCta",
      type: "group",
      label: "Secondary CTA (Optional)",
      fields: [
        {
          name: "text",
          type: "text",
          label: "Button Text",
        },
        {
          name: "url",
          type: "text",
          label: "Button URL",
          admin: {
            condition: (_, siblingData) => !!siblingData.text,
          },
        },
        {
          name: "openInNewTab",
          type: "checkbox",
          defaultValue: false,
          label: "Open in New Tab",
          admin: {
            condition: (_, siblingData) => !!siblingData.text,
          },
        },
      ],
    },
    {
      name: "backgroundStyle",
      type: "select",
      defaultValue: "primary",
      options: [
        { label: "Primary Color", value: "primary" },
        { label: "Secondary Color", value: "secondary" },
        { label: "Light Background", value: "light" },
        { label: "Dark Background", value: "dark" },
        { label: "Gradient", value: "gradient" },
      ],
      label: "Background Style",
    },
    {
      name: "textAlignment",
      type: "select",
      defaultValue: "center",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
      label: "Text Alignment",
    },
  ],
};
