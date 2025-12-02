import { Music } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="text-center space-y-6 max-w-md">
        <Music className="h-24 w-24 text-muted-foreground/50 mx-auto" />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Gig Pack Not Found</h1>
          <p className="text-muted-foreground text-lg">
            This gig pack doesn&apos;t exist or is no longer available.
          </p>
        </div>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}

