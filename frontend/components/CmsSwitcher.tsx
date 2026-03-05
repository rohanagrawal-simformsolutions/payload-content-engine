"use client";

import { useCms } from "@/contexts/CmsContext";

export default function CmsSwitcher() {
  const { cms, changeCms } = useCms();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">CMS:</span>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => changeCms("payload")}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            cms === "payload"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Payload
        </button>
        <button
          onClick={() => changeCms("strapi")}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            cms === "strapi"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Strapi
        </button>
      </div>
    </div>
  );
}
