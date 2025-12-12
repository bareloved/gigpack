"use client";

import { useEffect } from "react";
import { rtlLocales, Locale } from "@/i18n/config";

interface LocaleHtmlAttributesProps {
  locale: string;
}

export function LocaleHtmlAttributes({ locale }: LocaleHtmlAttributesProps) {
  const isRtl = rtlLocales.includes(locale as Locale);

  useEffect(() => {
    // Set lang, dir, and data-locale attributes on the html element immediately
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = isRtl ? "rtl" : "ltr";
      document.documentElement.setAttribute("data-locale", locale);
    }
  }, [locale, isRtl]);

  // Also set via script tag for immediate execution (before React hydrates)
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          document.documentElement.lang = "${locale}";
          document.documentElement.dir = "${isRtl ? "rtl" : "ltr"}";
          document.documentElement.setAttribute("data-locale", "${locale}");
        `,
      }}
    />
  );
}

