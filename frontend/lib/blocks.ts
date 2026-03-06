import api from "./api";

// ===== BLOCK TYPES =====
export type BlockType =
  | "accordion"
  | "tabs"
  | "two-column"
  | "downloads"
  | "gallery"
  | "media-video"
  | "card-box"
  | "cta-section"
  | "carousel"
  | "pull-quote"
  | "logo-wall"
  | "code-snippet";

// Mapping block types to API endpoints
const blockEndpointMap: Record<BlockType, string> = {
  accordion: "/blocks/accordion",
  tabs: "/blocks/tabs",
  "two-column": "/blocks/two-column",
  downloads: "/blocks/downloads",
  gallery: "/blocks/gallery",
  "media-video": "/blocks/media-video",
  "card-box": "/blocks/card-box",
  "cta-section": "/blocks/cta-section",
  carousel: "/blocks/carousel",
  "pull-quote": "/blocks/pull-quote",
  "logo-wall": "/blocks/logo-wall",
  "code-snippet": "/blocks/code-snippet",
};

const adminBlockEndpointMap: Record<BlockType, string> = {
  accordion: "/admin/blocks/accordion",
  tabs: "/admin/blocks/tabs",
  "two-column": "/admin/blocks/two-column",
  downloads: "/admin/blocks/downloads",
  gallery: "/admin/blocks/gallery",
  "media-video": "/admin/blocks/media-video",
  "card-box": "/admin/blocks/card-box",
  "cta-section": "/admin/blocks/cta-section",
  carousel: "/admin/blocks/carousel",
  "pull-quote": "/admin/blocks/pull-quote",
  "logo-wall": "/admin/blocks/logo-wall",
  "code-snippet": "/admin/blocks/code-snippet",
};

// Fetch blocks by type (public)
export async function getBlocks(
  blockType: BlockType,
  page = 1,
  limit = 10,
): Promise<{ docs: any[]; totalDocs: number }> {
  const endpoint = blockEndpointMap[blockType];
  if (!endpoint) throw new Error(`Unknown block type: ${blockType}`);
  const response = await api.get(endpoint, { params: { page, limit } });
  return response.data;
}

// Create a block (admin only)
export async function createBlock(
  blockType: BlockType,
  data: Record<string, unknown>,
  token: string,
): Promise<any> {
  const endpoint = adminBlockEndpointMap[blockType];
  if (!endpoint) throw new Error(`Unknown block type: ${blockType}`);
  const response = await api.post(endpoint, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// Update a block (admin only)
export async function updateBlock(
  blockType: BlockType,
  id: string,
  data: Record<string, unknown>,
  token: string,
): Promise<any> {
  const endpoint = adminBlockEndpointMap[blockType];
  if (!endpoint) throw new Error(`Unknown block type: ${blockType}`);
  const response = await api.put(`${endpoint}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// Delete a block (admin only)
export async function deleteBlock(
  blockType: BlockType,
  id: string,
  token: string,
): Promise<void> {
  const endpoint = adminBlockEndpointMap[blockType];
  if (!endpoint) throw new Error(`Unknown block type: ${blockType}`);
  await api.delete(`${endpoint}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
