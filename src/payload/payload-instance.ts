import { getPayload, Payload } from "payload";
import config from "../../payload/payload.config.js";

let cachedPayload: Payload | null = null;

export async function getPayloadInstance(): Promise<Payload> {
  if (cachedPayload) {
    return cachedPayload;
  }

  // Payload v3 Local API — no express binding needed when admin is disabled
  cachedPayload = await getPayload({ config });

  return cachedPayload;
}

// Global declaration for Payload instance
declare global {
  var payload: Payload;
}
