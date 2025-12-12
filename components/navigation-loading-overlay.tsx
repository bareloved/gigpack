"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "@/i18n/routing";
import { AppLogo } from "@/components/app-logo";
import { Loader2 } from "lucide-react";

export function NavigationLoadingOverlay() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  const handleNavigationStart = () => {
    setIsNavigating(true);
  };

  const handleNavigationEnd = () => {
    setIsNavigating(false);
  };

  // Expose navigation functions globally so other components can control the loading state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).startNavigationLoading = handleNavigationStart;
      (window as any).endNavigationLoading = handleNavigationEnd;
    }
  }, []);

  // Auto-end navigation when pathname changes (navigation completed)
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      // Small delay to ensure page has rendered
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Safety timeout: never show loading for more than 5 seconds
  useEffect(() => {
    if (isNavigating) {
      const timeout = setTimeout(() => {
        setIsNavigating(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isNavigating]);

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="animate-pulse">
          <AppLogo variant="icon" size="lg" />
        </div>
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    </div>
  );
}