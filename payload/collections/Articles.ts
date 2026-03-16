import { CollectionConfig } from "payload";

export const Articles: CollectionConfig = {
  slug: "articles",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "content",
      type: "richText",
    },
    {
      name: "blocks",
      type: "json",
      label: "Content Blocks",
      admin: {
        description:
          "Array of block objects (accordion, tabs, gallery, etc.) rendered after the main content.",
      },
    },
    {
      name: "featuredImage",
      type: "textarea",
      admin: {
        description: "Base64 encoded featured image",
      },
    },
    {
      name: "tags",
      type: "array",
      fields: [
        {
          name: "tag",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "dashboardUrl",
      type: "text",
    },
    {
      name: "summaryTitle",
      type: "text",
    },
    {
      name: "seo",
      type: "group",
      label: "SEO",
      admin: {
        description:
          "Search engine optimisation fields. These are returned by the API and rendered as <head> tags by the frontend.",
      },
      fields: [
        {
          name: "metaTitle",
          type: "text",
          label: "Meta Title",
          admin: {
            description:
              "Overrides the page <title> tag. Recommended: 50–60 characters.",
          },
        },
        {
          name: "metaDescription",
          type: "textarea",
          label: "Meta Description",
          admin: {
            description:
              "Shown in search-engine result snippets. Recommended: 150–160 characters.",
          },
        },
        {
          name: "ogImage",
          type: "text",
          label: "Open Graph Image URL",
          admin: {
            description:
              "Image shown when the page is shared on social media. Recommended size: 1200×630 px.",
          },
        },
        {
          name: "canonicalUrl",
          type: "text",
          label: "Canonical URL",
          admin: {
            description:
              "Prevents duplicate-content penalties. Leave blank to use the default page URL.",
          },
        },
        {
          name: "noIndex",
          type: "checkbox",
          label: "No Index",
          defaultValue: false,
          admin: {
            description:
              'Tick to hide this page from search engines (adds <meta name="robots" content="noindex, nofollow">).',
          },
        },
      ],
    },
    {
      name: "searchExclude",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "sitemap",
      type: "group",
      fields: [
        {
          name: "inclusion",
          type: "select",
          defaultValue: "default",
          options: [
            { label: "Default (excluded)", value: "default" },
            { label: "Included", value: "included" },
            { label: "Excluded", value: "excluded" },
          ],
        },
        {
          name: "changeFrequency",
          type: "select",
          defaultValue: "always",
          options: [
            { label: "Always", value: "always" },
            { label: "Hourly", value: "hourly" },
            { label: "Daily", value: "daily" },
            { label: "Weekly", value: "weekly" },
            { label: "Monthly", value: "monthly" },
            { label: "Yearly", value: "yearly" },
            { label: "Never", value: "never" },
          ],
        },
      ],
    },
    {
      name: "urlAlias",
      type: "text",
    },
    {
      name: "publishAt",
      type: "date",
    },
    {
      name: "unpublishAt",
      type: "date",
    },
    {
      name: "author",
      type: "text",
      admin: {
        description: "User ID (UUID) of the article author",
      },
    },
    {
      name: "promoted",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        {
          label: "Draft",
          value: "draft",
        },
        {
          label: "Published",
          value: "published",
        },
      ],
    },
  ],
};
