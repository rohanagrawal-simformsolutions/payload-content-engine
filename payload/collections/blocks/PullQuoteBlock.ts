import { CollectionConfig } from "payload";

export const PullQuoteBlock: CollectionConfig = {
  slug: "pull-quote-blocks",
  admin: {
    useAsTitle: "quote",
  },
  fields: [
    {
      name: "quote",
      type: "textarea",
      required: true,
      label: "Quote Text",
      admin: {
        description: "The quote text to display",
      },
    },
    {
      name: "author",
      type: "text",
      required: true,
      label: "Author/Attribution",
    },
    {
      name: "authorTitle",
      type: "text",
      label: "Author Title",
      admin: {
        description: "e.g., CEO, Program Member, Success Story",
      },
    },
    {
      name: "authorImage",
      type: "text",
      label: "Author Image URL",
      admin: {
        description: "Optional image (profile photo, company logo, etc.)",
      },
    },
    {
      name: "authorImageAlt",
      type: "text",
      label: "Image Alt Text",
      admin: {
        condition: (_, siblingData) => !!siblingData.authorImage,
      },
    },
    {
      name: "quoteType",
      type: "select",
      defaultValue: "testimonial",
      options: [
        { label: "Testimonial", value: "testimonial" },
        { label: "Success Story", value: "successStory" },
        { label: "Partner Endorsement", value: "endorsement" },
        { label: "General Quote", value: "quote" },
      ],
      label: "Quote Type",
    },
    {
      name: "backgroundColor",
      type: "select",
      defaultValue: "light",
      options: [
        { label: "Light", value: "light" },
        { label: "Primary Color", value: "primary" },
        { label: "Secondary Color", value: "secondary" },
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
    {
      name: "rating",
      type: "number",
      min: 0,
      max: 5,
      label: "Rating (0-5 stars)",
      admin: {
        description: "Optional star rating",
      },
    },
  ],
};
