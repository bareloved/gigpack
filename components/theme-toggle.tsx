"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="transition-transform hover:rotate-12"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-500 transition-all" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700 transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </p>
          <p className="text-xs text-muted-foreground">
            Switch to {theme === "dark" ? "light" : "dark"} theme
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

