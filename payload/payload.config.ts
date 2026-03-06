import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { Articles } from "./collections/Articles.js";
import {
  AccordionBlock,
  TabsBlock,
  TwoColumnBlock,
  DownloadsBlock,
  GalleryBlock,
  MediaVideoBlock,
  CardBoxBlock,
  CTASectionBlock,
  CarouselBlock,
  PullQuoteBlock,
  LogoWallBlock,
  CodeSnippetBlock,
} from "./collections/blocks/index.js";

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "your-secret-key",

  // Disable admin panel - Payload acts as content engine only
  admin: {
    disable: true,
    // Point Payload's internal auth at its own isolated collection.
    // This makes Payload create a 'payload_users' table and never touch
    // the 'users' table owned by TypeORM/NestJS.
    user: "payload-users",
  },

  // Use PostgreSQL adapter.
  // schemaName: 'payload' puts ALL Payload tables into a separate PostgreSQL
  // schema so they are completely isolated from TypeORM's public schema tables.
  // TypeORM owns: public.users
  // Payload owns:  payload.articles, payload.payload_users, payload.* etc.
  // Zero collision possible.
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    schemaName: "payload",
  }),

  // Collections
  collections: [
    // Payload's own internal auth collection — isolated from NestJS auth.
    // Slug 'payload-users' maps to table 'payload_users'.
    {
      slug: "payload-users",
      auth: true,
      fields: [],
    },
    Articles,
    // Component blocks
    AccordionBlock,
    TabsBlock,
    TwoColumnBlock,
    DownloadsBlock,
    GalleryBlock,
    MediaVideoBlock,
    CardBoxBlock,
    CTASectionBlock,
    CarouselBlock,
    PullQuoteBlock,
    LogoWallBlock,
    CodeSnippetBlock,
  ],

  // Use Lexical rich text editor
  editor: lexicalEditor({}),

  // Disable GraphQL (optional)
  graphQL: {
    disable: true,
  },

  typescript: {
    outputFile: "./payload/payload-types.ts",
  },
});
