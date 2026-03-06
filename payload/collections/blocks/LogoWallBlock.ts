import { CollectionConfig } from "payload";

export const LogoWallBlock: CollectionConfig = {
  slug: "logo-wall-blocks",
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Section Title",
      admin: {
        description: "e.g., Our Partners, Sponsors, Featured Suppliers",
      },
    },
    {
      name: "description",
      type: "textarea",
      label: "Section Description",
    },
    {
      name: "logos",
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 50,
      label: "Logos",
      fields: [
        {
          name: "logoUrl",
          type: "text",
          required: true,
          label: "Logo Image URL",
        },
        {
          name: "altText",
          type: "text",
          required: true,
          label: "Alt Text",
          admin: {
            description: "Company/brand name for accessibility",
          },
        },
        {
          name: "companyName",
          type: "text",
          required: true,
          label: "Company Name",
        },
        {
          name: "linkUrl",
          type: "text",
          label: "Link URL (Optional)",
          admin: {
            description: "URL to company website or details page",
          },
        },
        {
          name: "openInNewTab",
          type: "checkbox",
          defaultValue: true,
          label: "Open Link in New Tab",
          admin: {
            condition: (_, siblingData) => !!siblingData.linkUrl,
          },
        },
      ],
    },
    {
      name: "maxLogoHeight",
      type: "select",
      defaultValue: "80",
      options: [
        { label: "60px", value: "60" },
        { label: "80px", value: "80" },
        { label: "100px", value: "100" },
        { label: "120px", value: "120" },
      ],
      label: "Max Logo Height",
      admin: {
        description: "Enforces consistent sizing across logos",
      },
    },
    {
      name: "columnsDesktop",
      type: "number",
      defaultValue: 4,
      min: 2,
      max: 6,
      label: "Columns on Desktop",
    },
    {
      name: "columnsMobile",
      type: "number",
      defaultValue: 2,
      min: 1,
      max: 3,
      label: "Columns on Mobile",
    },
    {
      name: "alignmentStyle",
      type: "select",
      defaultValue: "grid",
      options: [
        { label: "Grid", value: "grid" },
        { label: "Flex Center", value: "center" },
        { label: "Flex Spaced", value: "spaced" },
      ],
      label: "Alignment Style",
    },
  ],
};
