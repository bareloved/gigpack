import { AppLogo } from "@/components/app-logo";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-pulse">
          <AppLogo variant="icon" size="lg" />
        </div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

