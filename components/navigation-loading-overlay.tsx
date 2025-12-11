"use client";

import { useState, useEffect } from "react";
import { usePathname } from "@/i18n/routing";
import { AppLogo } from "@/components/app-logo";

export function NavigationLoadingOverlay() {
  const [isNavigating, setIsNavigating] = useState(false);

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

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-pulse">
          <AppLogo variant="icon" size="lg" />
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}