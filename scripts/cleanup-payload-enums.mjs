import pg from "pg";

const { Client } = pg;
const client = new Client({
      connectionString: "postgres://postgres:postgres123@127.0.0.1:5432/payload_nestjs",
});

await client.connect();

// Find all enum types in payload schema
const { rows: enums } = await client.query(`
  SELECT typname
  FROM pg_type
  JOIN pg_namespace ON pg_type.typnamespace = pg_namespace.oid
  WHERE pg_namespace.nspname = 'payload' AND pg_type.typtype = 'e'
  ORDER BY typname
`);

// Find all tables in payload schema for the new blocks
const { rows: tables } = await client.query(`
  SELECT tablename
  FROM pg_tables
  WHERE schemaname = 'payload'
  ORDER BY tablename
`);

console.log("Existing enums in payload schema:");
enums.forEach((r) => console.log(" -", r.typname));

console.log("\nExisting tables in payload schema:");
tables.forEach((r) => console.log(" -", r.tablename));

// Drop all block-related tables (CASCADE to remove dependent objects)
const blockTables = [
      "accordion_blocks",
      "accordion_blocks_items",
      "tabs_blocks",
      "tabs_blocks_tabs",
      "two_column_blocks",
      "downloads_blocks",
      "downloads_blocks_files",
      "gallery_blocks",
      "gallery_blocks_images",
      "media_video_blocks",
      "card_box_blocks",
      "card_box_blocks_cards",
      "cta_section_blocks",
      "carousel_blocks",
      "carousel_blocks_slides",
      "pull_quote_blocks",
      "logo_wall_blocks",
      "logo_wall_blocks_logos",
      "code_snippet_blocks",
];

for (const table of blockTables) {
      await client.query(`DROP TABLE IF EXISTS payload."${table}" CASCADE`);
      console.log(`Dropped table (if existed): payload.${table}`);
}

// Drop all enum types in the payload schema for blocks
for (const { typname } of enums) {
      if (typname.includes("block")) {
            await client.query(`DROP TYPE IF EXISTS payload."${typname}" CASCADE`);
            console.log(`Dropped enum: payload.${typname}`);
      }
}

console.log("\nCleanup complete. Payload will recreate these on next start.");
await client.end();
