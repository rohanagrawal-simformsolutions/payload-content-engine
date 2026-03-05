"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CmsProvider as CmsProviderType, getCms, setCms } from "@/lib/cms";

interface CmsContextType {
  cms: CmsProviderType;
  changeCms: (newCms: CmsProviderType) => void;
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

export function CmsProviderWrapper({ children }: { children: ReactNode }) {
  const [cms, setCmsState] = useState<CmsProviderType>("payload");

  useEffect(() => {
    setCmsState(getCms());
  }, []);

  const changeCms = (newCms: CmsProviderType) => {
    setCms(newCms);
    setCmsState(newCms);
    // Optionally refresh the page to reload articles from new CMS
    window.location.reload();
  };

  return (
    <CmsContext.Provider value={{ cms, changeCms }}>
      {children}
    </CmsContext.Provider>
  );
}

export function useCms(): CmsContextType {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error("useCms must be used within CmsProviderWrapper");
  }
  return context;
}
