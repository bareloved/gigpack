"use client";

import { AppLogo } from "@/components/app-logo";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center gap-8">
        <AppLogo variant="icon" size="lg" />
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    </div>
  );
}

