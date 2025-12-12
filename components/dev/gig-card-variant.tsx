"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Edit, Share2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PaperTextureHeader,
  getPaperFallbackColors,
} from "@/components/gigpacks/paper-texture-header";

// =============================================================================
// TYPES
// =============================================================================

export type VariantType =
  | "current"
  | "soft-strip"
  | "minimal"
  | "mono"
  | "paper"
  | "grain"
  | "blocks"
  | "frame";

export interface MockGig {
  id: string;
  title: string;
  band_name: string;
  date: string;
  call_time: string;
  venue_name: string;
}

interface GigCardVariantProps {
  variant: VariantType;
  gig: MockGig;
}

// =============================================================================
// HELPER: Generate consistent color from band name
// =============================================================================

const getBandColor = (bandName: string | null) => {
  if (!bandName) return "from-slate-300 to-slate-400";

  const colors = [
    "from-blue-400 to-indigo-500",
    "from-purple-400 to-pink-500",
    "from-green-400 to-teal-500",
    "from-orange-400 to-red-500",
    "from-cyan-400 to-blue-500",
    "from-fuchsia-400 to-purple-500",
  ];
  const hash = bandName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

// =============================================================================
// HEADER VARIANTS
// =============================================================================

const CurrentHeader = ({ gig }: { gig: MockGig }) => {
  const gradient = getBandColor(gig.band_name);
  const initials = getInitials(gig.band_name);

  return (
    <div className={cn("h-60 w-full relative flex items-center justify-center bg-gradient-to-br text-white font-bold text-4xl rounded-t-lg", gradient)}>
      {initials}
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% via-black/15 to-black/40" />
    </div>
  );
};

const SoftStripHeader = ({ gig }: { gig: MockGig }) => {
  const stripColor = "bg-slate-400";
  const initials = getInitials(gig.band_name);

  return (
    <div className="w-full rounded-t-lg overflow-hidden">
      {/* Thin mood strip */}
      <div className={cn("h-2 w-full", stripColor)} />
      
      {/* Soft neutral header */}
      <div className="h-44 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <span className="text-5xl font-bold text-slate-800 dark:text-slate-100">
          {initials}
        </span>
      </div>
    </div>
  );
};

const MinimalHeader = ({ gig }: { gig: MockGig }) => {
  const stripColor = "bg-slate-400";
  const initials = getInitials(gig.band_name);

  return (
    <div className="h-48 w-full bg-card rounded-t-lg flex items-center justify-center relative">
      {/* Accent circle */}
      <div className={cn("absolute w-24 h-24 rounded-full opacity-20", stripColor)} />
      
      {/* Large initials */}
      <span className="text-6xl font-bold text-foreground relative z-10">
        {initials}
      </span>
    </div>
  );
};

const MonoHeader = ({ gig }: { gig: MockGig }) => {
  const initials = getInitials(gig.band_name);

  return (
    <div className="h-48 w-full bg-slate-200 dark:bg-slate-700 rounded-t-lg flex items-center justify-center">
      <span className="text-5xl font-bold text-slate-800 dark:text-slate-100">
        {initials}
      </span>
    </div>
  );
};

const PaperHeader = ({ gig }: { gig: MockGig }) => {
  const initials = getInitials(gig.band_name);
  const paperColors = getPaperFallbackColors({
    id: gig.id,
    title: gig.title,
  });

  return (
    <PaperTextureHeader initials={initials} colors={paperColors} size="small" showGradient={true} />
  );
};

const GrainHeader = ({ gig }: { gig: MockGig }) => {
  const gradient = getBandColor(gig.band_name);
  const initials = getInitials(gig.band_name);

  return (
    <div className={cn("h-48 w-full rounded-t-lg flex items-center justify-center relative overflow-hidden bg-gradient-to-br", gradient)}>
      {/* Grain overlay */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "150px 150px",
        }}
      />
      
      <span className="text-5xl font-bold text-white relative z-10 drop-shadow-md">
        {initials}
      </span>
    </div>
  );
};

const BlocksHeader = ({ gig }: { gig: MockGig }) => {
  const gradient = getBandColor(gig.band_name);
  const initials = getInitials(gig.band_name);
  
  // Extract colors from gradient for two-tone effect
  const colors = gradient.includes("blue") ? ["bg-blue-400", "bg-indigo-500"] :
    gradient.includes("purple") ? ["bg-purple-400", "bg-pink-500"] :
    gradient.includes("green") ? ["bg-green-400", "bg-teal-500"] :
    gradient.includes("orange") ? ["bg-orange-400", "bg-red-500"] :
    gradient.includes("fuchsia") ? ["bg-fuchsia-400", "bg-purple-500"] :
    ["bg-cyan-400", "bg-blue-500"];

  return (
    <div className="h-48 w-full rounded-t-lg flex items-center justify-center relative overflow-hidden">
      {/* Diagonal split */}
      <div className={cn("absolute inset-0", colors[0])} 
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} 
      />
      <div className={cn("absolute inset-0", colors[1])} 
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }} 
      />
      
      <span className="text-5xl font-bold text-white relative z-10 drop-shadow-lg">
        {initials}
      </span>
    </div>
  );
};

const FrameHeader = ({ gig }: { gig: MockGig }) => {
  const initials = getInitials(gig.band_name);
  const stripColor = "bg-slate-400";

  return (
    <div className="h-48 w-full rounded-t-lg bg-slate-100 dark:bg-slate-800 p-4 flex items-center justify-center">
      {/* Inner frame */}
      <div className={cn("w-full h-full border-4 rounded-lg flex items-center justify-center", stripColor.replace("bg-", "border-"))}>
        <span className="text-5xl font-bold text-slate-800 dark:text-slate-100">
          {initials}
        </span>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function GigCardVariant({ variant, gig }: GigCardVariantProps) {
  const HeaderComponent = {
    current: CurrentHeader,
    "soft-strip": SoftStripHeader,
    minimal: MinimalHeader,
    mono: MonoHeader,
    paper: PaperHeader,
    grain: GrainHeader,
    blocks: BlocksHeader,
    frame: FrameHeader,
  }[variant];

  return (
    <Card className="group relative overflow-hidden border-2 transition-all duration-200">
      {/* Header variant */}
      <HeaderComponent gig={gig} />

      {/* Card content - consistent across all variants */}
      <CardContent className="p-5 space-y-3">
        {/* Title & Band */}
        <div>
          <h3 className="text-lg font-bold leading-tight line-clamp-2 mb-1">
            {gig.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">{gig.band_name}</span>
          </div>
        </div>

        {/* Date & Call Time pills */}
        <div className="flex flex-wrap gap-2">
          {gig.date && (
            <div className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold border-2 bg-primary/10 text-primary border-primary/20">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(gig.date)}</span>
            </div>
          )}

          {gig.call_time && (
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1.5 text-sm font-medium text-muted-foreground border border-border/50">
              <Clock className="h-3.5 w-3.5" />
              <span>Call: {gig.call_time}</span>
            </div>
          )}
        </div>

        {/* Venue line */}
        {gig.venue_name && (
          <div className="flex items-center gap-2 pt-2 border-t border-dashed border-border">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium text-muted-foreground line-clamp-1">
              {gig.venue_name}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 font-semibold"
          >
            <Edit className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 font-semibold"
          >
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            Share
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

