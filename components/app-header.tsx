"use client";

import { User } from "@supabase/supabase-js";
import { Link, usePathname } from "@/i18n/routing";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Calendar, Music2, Search } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface AppHeaderProps {
  user: User | null;
}

const navItems = [
  {
    href: "/gigpacks",
    key: "gigs" as const,
    icon: Calendar,
  },
  {
    href: "/bands",
    key: "bands" as const,
    icon: Music2,
  },
];

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("navigation");
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  const normalizedPath =
    pathname?.replace(/^\/[a-zA-Z-]+/, "") || "/";

  // Sync search value with URL params
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);


  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur print:hidden">
      <div className="mx-auto max-w-[1600px] flex items-end justify-between gap-4 px-8 py-4">
        {/* Logo and Nav */}
        <div className="flex items-end gap-4 sm:gap-6">
          <Link
            href="/gigpacks"
            className="flex items-center transition-opacity hover:opacity-80"
            aria-label={t("homeAriaLabel")}
          >
            <AppLogo size="lg" className="h-12 sm:h-14" priority />
          </Link>

          <nav className="flex items-end gap-1 pb-1">
            {navItems.map((item) => {
              const isActive = normalizedPath.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (!isActive && typeof window !== 'undefined' && (window as any).startNavigationLoading) {
                      (window as any).startNavigationLoading();
                    }
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2.5 font-bold uppercase tracking-widest transition-colors",
                    locale === "he"
                      ? "text-sm font-black tracking-tight"
                      : "text-xs tracking-widest",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t(item.key)}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-9 bg-muted/50 border-border/50"
            />
          </div>
          
          <LanguageSwitcher />
          <ThemeToggle />
          {user && <UserMenu user={user} />}
        </div>
      </div>

    </header>
  );
}



