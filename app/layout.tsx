import type { Metadata } from "next";
import "./globals.css";
import { heebo, anton, zalandoSansEn } from "@/lib/fonts";

export const metadata: Metadata = {
  title: {
    default: "Gigmaster",
    template: "%s | Gigmaster",
  },
  description: "Pack, plan, and share every gig with Gigmaster.",
  icons: {
    icon: "/branding/gigpack-logo.png",
    shortcut: "/branding/gigpack-logo.png",
    apple: "/branding/gigpack-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Root layout - Next.js requires html/body here
  // ThemeProvider is handled in locale layouts
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${heebo.className} ${heebo.variable} ${anton.variable} ${zalandoSansEn.variable}`}>
        {children}
      </body>
    </html>
  );
}

