import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Music } from "lucide-react";
import { UserMenu } from "@/components/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default async function GigPacksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/gigpacks" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Music className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">GigPack</h1>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

