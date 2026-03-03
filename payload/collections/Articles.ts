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
      name: "meta",
      type: "group",
      fields: [
        {
          name: "title",
          type: "text",
        },
        {
          name: "description",
          type: "textarea",
        },
        {
          name: "image",
          type: "text",
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
