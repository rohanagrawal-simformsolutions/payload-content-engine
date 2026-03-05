export type CmsProvider = "payload" | "strapi";

const STORAGE_KEY = "cmsProvider";
const DEFAULT_CMS: CmsProvider = "payload";

export function getCms(): CmsProvider {
  if (typeof window === "undefined") {
    return DEFAULT_CMS;
  }

  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "strapi" ? "strapi" : "payload";
}

export function setCms(value: CmsProvider) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, value);
}
