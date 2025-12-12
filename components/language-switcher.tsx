"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { localeNames } from "@/i18n/config";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("languageSwitcher");

  const toggleLocale = () => {
    // Show loading overlay immediately
    if (typeof window !== 'undefined' && (window as any).startNavigationLoading) {
      (window as any).startNavigationLoading();
    }
    
    // Toggle between 'en' and 'he'
    const newLocale = locale === 'en' ? 'he' : 'en';
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, "");
    // Navigate to new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
    router.refresh();
  };

  const currentLanguage = localeNames[locale as keyof typeof localeNames];
  const nextLanguage = localeNames[(locale === 'en' ? 'he' : 'en') as keyof typeof localeNames];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleLocale}
            aria-label={t("ariaLabel")}
            className="uppercase font-semibold"
          >
            {locale}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{currentLanguage}</p>
          <p className="text-xs text-muted-foreground">
            {t("switchTo", { language: nextLanguage })}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

