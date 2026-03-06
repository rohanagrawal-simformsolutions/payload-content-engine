import { CollectionConfig } from "payload";

export const GalleryBlock: CollectionConfig = {
  slug: "gallery-blocks",
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Gallery Title",
    },
    {
      name: "description",
      type: "textarea",
      label: "Gallery Description",
    },
    {
      name: "images",
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 100,
      label: "Images",
      fields: [
        {
          name: "imageUrl",
          type: "text",
          required: true,
          label: "Image URL",
        },
        {
          name: "altText",
          type: "text",
          required: true,
          label: "Alt Text",
          admin: {
            description: "SEO-friendly image description",
          },
        },
        {
          name: "caption",
          type: "text",
          label: "Image Caption",
        },
        {
          name: "aspectRatio",
          type: "select",
          defaultValue: "16-9",
          options: [
            { label: "Square (1:1)", value: "1-1" },
            { label: "Portrait (3:4)", value: "3-4" },
            { label: "Landscape (16:9)", value: "16-9" },
            { label: "Wide (21:9)", value: "21-9" },
          ],
          label: "Aspect Ratio",
        },
      ],
    },
    {
      name: "layout",
      type: "select",
      defaultValue: "grid-3",
      options: [
        { label: "Grid (3 columns)", value: "grid-3" },
        { label: "Grid (4 columns)", value: "grid-4" },
        { label: "Masonry", value: "masonry" },
        { label: "Carousel", value: "carousel" },
      ],
      label: "Gallery Layout",
    },
    {
      name: "enableLightbox",
      type: "checkbox",
      defaultValue: true,
      label: "Enable Lightbox/Modal View",
    },
    {
      name: "columnsOnDesktop",
      type: "number",
      defaultValue: 3,
      min: 1,
      max: 6,
      label: "Columns on Desktop",
    },
    {
      name: "columnsOnMobile",
      type: "number",
      defaultValue: 1,
      min: 1,
      max: 3,
      label: "Columns on Mobile",
    },
  ],
};
