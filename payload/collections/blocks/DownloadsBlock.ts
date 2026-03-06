import { CollectionConfig } from "payload";

export const DownloadsBlock: CollectionConfig = {
  slug: "downloads-blocks",
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
        description: "Brief description of the downloads",
      },
    },
    {
      name: "files",
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 50,
      label: "Download Files",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          label: "File Title",
        },
        {
          name: "description",
          type: "textarea",
          label: "File Description",
        },
        {
          name: "fileUrl",
          type: "text",
          required: true,
          label: "File URL",
          admin: {
            description: "URL to the file to be downloaded",
          },
        },
        {
          name: "fileSize",
          type: "text",
          label: "File Size",
          admin: {
            description: "e.g., 2.5 MB",
          },
        },
        {
          name: "fileType",
          type: "select",
          required: true,
          options: [
            { label: "PDF", value: "pdf" },
            { label: "Word (.docx)", value: "docx" },
            { label: "Excel (.xlsx)", value: "xlsx" },
            { label: "PowerPoint (.pptx)", value: "pptx" },
            { label: "ZIP", value: "zip" },
            { label: "Image", value: "image" },
            { label: "Other", value: "other" },
          ],
        },
        {
          name: "accessLevel",
          type: "select",
          defaultValue: "public",
          options: [
            { label: "Public", value: "public" },
            { label: "Members Only", value: "members" },
            { label: "Premium", value: "premium" },
          ],
          label: "Access Level",
        },
      ],
    },
    {
      name: "trackAnalytics",
      type: "checkbox",
      defaultValue: true,
      label: "Track Download Analytics",
    },
  ],
};
