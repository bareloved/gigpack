import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { NavigationLoadingOverlay } from "@/components/navigation-loading-overlay";

export default async function GigPacksLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/sign-in`);
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} />
      <NavigationLoadingOverlay />
      <main className="mx-auto max-w-[1600px] px-8 py-8">
        {children}
      </main>
    </div>
  );
}

