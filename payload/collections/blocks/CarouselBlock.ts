import { CollectionConfig } from "payload";

export const CarouselBlock: CollectionConfig = {
  slug: "carousel-blocks",
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Carousel Title",
    },
    {
      name: "carouselType",
      type: "select",
      required: true,
      defaultValue: "cardBox",
      options: [
        { label: "Card Box", value: "cardBox" },
        { label: "Image Carousel", value: "image" },
        { label: "Speaker/Profile Cards", value: "profile" },
        { label: "Resource Cards", value: "resource" },
        { label: "Content/Article Cards", value: "content" },
      ],
      label: "Carousel Type",
    },
    {
      name: "slides",
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 50,
      label: "Carousel Slides",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          label: "Slide Title",
        },
        {
          name: "description",
          type: "textarea",
          label: "Slide Description",
        },
        {
          name: "imageUrl",
          type: "text",
          required: true,
          label: "Image URL",
        },
        {
          name: "imageAlt",
          type: "text",
          required: true,
          label: "Image Alt Text",
        },
        {
          name: "linkUrl",
          type: "text",
          label: "Slide Link URL",
        },
        {
          name: "ctaText",
          type: "text",
          label: "CTA Button Text",
        },
      ],
    },
    {
      name: "autoplay",
      type: "checkbox",
      defaultValue: true,
      label: "Autoplay Slides",
    },
    {
      name: "autoplayInterval",
      type: "number",
      defaultValue: 5000,
      min: 1000,
      max: 30000,
      label: "Autoplay Interval (ms)",
      admin: {
        condition: (_, siblingData) => siblingData.autoplay === true,
        description: "Milliseconds between slide changes",
      },
    },
    {
      name: "showNavigation",
      type: "checkbox",
      defaultValue: true,
      label: "Show Navigation Arrows",
    },
    {
      name: "showPagination",
      type: "checkbox",
      defaultValue: true,
      label: "Show Pagination Dots",
    },
    {
      name: "slidesPerView",
      type: "number",
      defaultValue: 3,
      min: 1,
      max: 6,
      label: "Slides Per View (Desktop)",
    },
    {
      name: "gap",
      type: "number",
      defaultValue: 20,
      min: 0,
      max: 100,
      label: "Gap Between Slides (px)",
    },
  ],
};
