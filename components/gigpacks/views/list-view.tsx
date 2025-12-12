"use client";

import { Button } from "@/components/ui/button";
import { Edit, Share2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { GigBandImage } from "../gig-band-image";
import type { GigPackListItem } from "@/app/[locale]/gigpacks/client-page";

export type GigGroup = {
  label: string;
  gigs: GigPackListItem[];
};

interface ListViewProps {
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
      <MapPin className="h-10 w-10 text-muted-foreground" />
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

export function ListView({ groups, onEdit, onShare, onDelete, onClick, viewFilter, onCreate, t, tCommon, locale }: ListViewProps) {
  if (groups.length === 0) return <EmptyState viewFilter={viewFilter} onCreate={onCreate} t={t} />;

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.label}>
          <SectionHeader label={group.label} />
          <div className="flex flex-col gap-2">
            {group.gigs.map((gig) => {
              const isTodayGig = isToday(gig.date);

              return (
                <div
                  key={gig.id}
                  className={cn(
                    "group flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer relative",
                    isTodayGig && "border-orange-600/30 bg-orange-600/5 dark:border-orange-500/30 dark:bg-orange-500/5"
                  )}
                  onClick={() => onClick(gig.id)}
                >
                  {/* Band Thumbnail */}
                  <div className="shrink-0">
                    <GigBandImage gig={gig} variant="thumbnail" />
                  </div>

                  {/* Status & Date Column */}
                  <div className="flex items-center gap-3 md:w-48 shrink-0">
                    <div className="flex flex-col">
                      <span className={cn("font-bold text-lg leading-none", isTodayGig && "text-orange-600 dark:text-orange-400")}>
                        {gig.date ? formatDate(gig.date, locale) : "TBD"}
                      </span>
                      <span className="text-sm text-muted-foreground">{gig.call_time || "TBD"}</span>
                    </div>
                  </div>

                  {/* Main Info Column */}
                  <div className="flex-1 min-w-0 grid gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base truncate">{gig.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground/80">{gig.band_name || "No band name"}</span>
                      <span>•</span>
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{gig.venue_name || "TBD Venue"}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 md:ml-4 pt-2 md:pt-0 border-t md:border-t-0 border-dashed border-border w-full md:w-auto justify-end" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(gig.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onShare(gig.id)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
