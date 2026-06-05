'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface FormAction {
  formType: 'sale' | 'production';
  fields: Record<string, string>;
}

interface AiPageContextType {
  /** Current page path */
  currentPage: string;
  /** Human-readable page name */
  pageName: string;
  /** Register a callback to fill form fields */
  registerFormFiller: (filler: (action: FormAction) => void) => void;
  /** Register a callback to refresh page data */
  registerDataRefresher: (refresher: () => void) => void;
  /** Fill form fields via AI action */
  fillForm: (action: FormAction) => void;
  /** Refresh page data after AI mutation */
  refreshData: () => void;
  /** Register a callback to navigate */
  registerNavigator: (nav: (url: string) => void) => void;
  /** Navigate to a URL */
  navigate: (url: string) => void;
}

const AiPageContext = createContext<AiPageContextType | null>(null);

const PAGE_NAMES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard — Overview of production trends and sales activity',
  '/admin/godown': 'Egg Godown — Overview of production, sales, and stock',
  '/admin/godown/production': 'Egg Production — Manage daily egg collection by location/shed',
  '/admin/godown/sales': 'Egg Sales — Record and manage egg sales to buyers',
  '/admin/settings': 'Settings — User account settings',
};

export function AiPageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [formFiller, setFormFiller] = useState<((action: FormAction) => void) | null>(null);
  const [dataRefresher, setDataRefresher] = useState<(() => void) | null>(null);
  const [navigator, setNavigator] = useState<((url: string) => void) | null>(null);

  const registerFormFiller = useCallback((filler: (action: FormAction) => void) => {
    setFormFiller(() => filler);
  }, []);

  const registerDataRefresher = useCallback((refresher: () => void) => {
    setDataRefresher(() => refresher);
  }, []);

  const registerNavigator = useCallback((nav: (url: string) => void) => {
    setNavigator(() => nav);
  }, []);

  const fillForm = useCallback((action: FormAction) => {
    if (formFiller) formFiller(action);
  }, [formFiller]);

  const refreshData = useCallback(() => {
    if (dataRefresher) dataRefresher();
  }, [dataRefresher]);

  const navigate = useCallback((url: string) => {
    if (navigator) navigator(url);
  }, [navigator]);

  const pageName = PAGE_NAMES[pathname] || `Page: ${pathname}`;

  return (
    <AiPageContext.Provider value={{
      currentPage: pathname,
      pageName,
      registerFormFiller,
      registerDataRefresher,
      registerNavigator,
      fillForm,
      refreshData,
      navigate,
    }}>
      {children}
    </AiPageContext.Provider>
  );
}

export function useAiPageContext() {
  const ctx = useContext(AiPageContext);
  if (!ctx) throw new Error('useAiPageContext must be used within AiPageProvider');
  return ctx;
}
