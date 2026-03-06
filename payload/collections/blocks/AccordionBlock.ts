import { CollectionConfig } from "payload";

export const AccordionBlock: CollectionConfig = {
  slug: "accordion-blocks",
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
      name: "anchorId",
      type: "text",
      label: "Anchor ID",
      admin: {
        description: "Optional anchor ID for linking (e.g., #faq-section)",
      },
    },
    {
      name: "items",
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 20,
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          label: "Item Title",
        },
        {
          name: "content",
          type: "textarea",
          label: "Item Content",
          admin: {
            description:
              "Plain text/HTML content. Leave empty if using Nested Blocks below.",
            condition: (_, siblingData) => !siblingData.nestedBlocks?.length,
          },
        },
        {
          name: "nestedBlocks",
          type: "json",
          label: "Nested Blocks (JSON)",
          admin: {
            description:
              "Optional: paste a block array (e.g. a CardBox or MediaVideo) to render inside this item instead of plain text.",
          },
        },
        {
          name: "isExpanded",
          type: "checkbox",
          defaultValue: false,
          label: "Expanded by default",
        },
      ],
    },
    {
      name: "allowMultipleOpen",
      type: "checkbox",
      defaultValue: true,
      label: "Allow Multiple Tabs Open",
    },
  ],
};
