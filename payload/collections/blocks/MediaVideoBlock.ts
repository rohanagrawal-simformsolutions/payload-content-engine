import { CollectionConfig } from "payload";

export const MediaVideoBlock: CollectionConfig = {
  slug: "media-video-blocks",
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Video Title",
    },
    {
      name: "description",
      type: "textarea",
      label: "Video Description",
    },
    {
      name: "sourceType",
      type: "select",
      required: true,
      defaultValue: "youtube",
      options: [
        { label: "YouTube", value: "youtube" },
        { label: "Vimeo", value: "vimeo" },
        { label: "Self-Hosted", value: "selfHosted" },
        { label: "Embed Code", value: "embed" },
      ],
      label: "Video Source",
    },
    {
      name: "youtubeUrl",
      type: "text",
      admin: {
        condition: (_, siblingData) => siblingData.sourceType === "youtube",
        description: "Full YouTube URL (e.g., https://youtube.com/watch?v=...)",
      },
    },
    {
      name: "vimeoUrl",
      type: "text",
      admin: {
        condition: (_, siblingData) => siblingData.sourceType === "vimeo",
        description: "Full Vimeo URL",
      },
    },
    {
      name: "videoUrl",
      type: "text",
      admin: {
        condition: (_, siblingData) => siblingData.sourceType === "selfHosted",
        description: "URL to mp4 or other video file",
      },
    },
    {
      name: "thumbnailUrl",
      type: "text",
      admin: {
        condition: (_, siblingData) => siblingData.sourceType === "selfHosted",
        description: "Thumbnail image URL",
      },
    },
    {
      name: "embedCode",
      type: "textarea",
      admin: {
        condition: (_, siblingData) => siblingData.sourceType === "embed",
        description: "Raw HTML embed code (iframe)",
      },
    },
    {
      name: "aspectRatio",
      type: "select",
      defaultValue: "16-9",
      options: [
        { label: "16:9 (Landscape)", value: "16-9" },
        { label: "4:3 (Standard)", value: "4-3" },
        { label: "1:1 (Square)", value: "1-1" },
        { label: "9:16 (Portrait)", value: "9-16" },
      ],
      label: "Video Aspect Ratio",
    },
    {
      name: "autoplay",
      type: "checkbox",
      defaultValue: false,
      label: "Autoplay (muted)",
    },
    {
      name: "controls",
      type: "checkbox",
      defaultValue: true,
      label: "Show Player Controls",
    },
    {
      name: "trackAnalytics",
      type: "checkbox",
      defaultValue: true,
      label: "Track Plays and Completions",
    },
  ],
};
