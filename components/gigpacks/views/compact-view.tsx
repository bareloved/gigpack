"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  MapPin,
  Edit,
  Share2,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GigBandImage } from "../gig-band-image";
import type { GigPackListItem } from "@/app/[locale]/gigpacks/client-page";

export type GigGroup = {
  label: string;
  gigs: GigPackListItem[];
};

interface CompactViewProps {
  groups: GigGroup[];
  onEdit: (id: string) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
  viewFilter: "all" | "upcoming" | "past";
  onCreate?: () => void;
  t: (key: string) => string;
  tCommon: (key: string) => string;
  locale: string;
}

const isToday = (dateStr: string | null): boolean => {
  const date = dateStr ? new Date(dateStr) : null;
  if (!date) return false;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() === today.getTime();
};

const formatDate = (dateStr: string | null, locale: string = "en"): string => {
  if (!dateStr) return "TBD";

  if (locale === "he") {
    // Hebrew: Show weekday + numeric DD/MM format
    const date = new Date(dateStr);
    const weekday = date.toLocaleDateString("he-IL", { weekday: "short" });
    const day = date.getDate();
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    return `${weekday}, ${day}/${month}`;
  }

  // English: Show with abbreviated month name
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const SectionHeader = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <h2 className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
      {label}
    </h2>
    <div className="flex-1 h-px bg-border/50" />
  </div>
);

const EmptyState = ({ viewFilter, onCreate, t }: { viewFilter: "all" | "upcoming" | "past"; onCreate?: () => void; t: (key: string) => string }) => (
  <div className="border-2 border-dashed bg-card/50 rounded-lg p-16 text-center space-y-4">
    <div className="rounded-full bg-muted p-4 w-fit mx-auto">
      <Calendar className="h-10 w-10 text-muted-foreground" />
    </div>
    <div className="space-y-2">
      <p className="text-lg font-medium text-muted-foreground">
          {viewFilter === "past"
          ? t("emptyPast")
          : t("emptyUpcoming")}
      </p>
      {viewFilter !== "past" && onCreate && (
          <Button onClick={onCreate} variant="outline" className="mt-2">
              <Edit className="mr-2 h-4 w-4" />
              {t("emptyCtaFirst")}
          </Button>
      )}
    </div>
  </div>
);

export function CompactView({ groups, onEdit, onShare, onDelete, onClick, viewFilter, onCreate, t, tCommon, locale }: CompactViewProps) {
  if (groups.length === 0) return <EmptyState viewFilter={viewFilter} onCreate={onCreate} t={t} />;

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.label}>
          <SectionHeader label={group.label} />
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {group.gigs.map((gig) => {
               const isTodayGig = isToday(gig.date);

               return (
                <Card
                  key={gig.id}
                  className={cn(
                    "hover:bg-accent/5 hover:border-primary/30 cursor-pointer transition-all",
                    isTodayGig && "border-orange-600/30 bg-orange-600/5 dark:border-orange-500/30 dark:bg-orange-500/5"
                  )}
                  onClick={() => onClick(gig.id)}
                >
                  <CardContent className="p-3 space-y-2">
                    {/* Header with Image */}
                    <div className="flex items-start gap-2">
                      <GigBandImage gig={gig} variant="compact" />
                      <span className="font-semibold truncate leading-tight flex-1">{gig.title}</span>
                    </div>

                    {/* Time & Location */}
                    <div className="text-sm space-y-0.5 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span className={cn(isTodayGig && "text-orange-600 dark:text-orange-400 font-medium")}>
                           {formatDate(gig.date, locale)} {gig.call_time && `• ${gig.call_time}`}
                        </span>
                      </div>
                      {gig.venue_name && (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{gig.venue_name}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                      <div className="text-xs text-muted-foreground/70 truncate max-w-[60%]">
                        {gig.band_name || "TBD"}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(gig.id)}>
                            <Edit className="mr-2 h-4 w-4" /> {tCommon("edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onShare(gig.id)}>
                            <Share2 className="mr-2 h-4 w-4" /> {tCommon("share")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(gig.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> {tCommon("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
               );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
