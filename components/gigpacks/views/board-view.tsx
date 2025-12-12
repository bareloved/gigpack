"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  MapPin,
  Edit,
  Clock,
  Trash2,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GigBandImage } from "../gig-band-image";
import { HandDrawnSquiggle } from "@/components/hand-drawn/accents";
import type { GigPackListItem } from "@/app/[locale]/gigpacks/client-page";

export type GigGroup = {
  label: string;
  gigs: GigPackListItem[];
};

interface BoardViewProps {
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

const isPast = (dateStr: string | null): boolean => {
  const date = dateStr ? new Date(dateStr) : null;
  if (!date) return false;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
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
  <Card className="border-2 border-dashed bg-card/50">
    <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="rounded-full bg-muted p-4">
        <Calendar className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2">
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
    </CardContent>
  </Card>
);

export function BoardView({ groups, onEdit, onShare, onDelete, onClick, viewFilter, onCreate, t, tCommon, locale }: BoardViewProps) {
  if (groups.length === 0) return <EmptyState viewFilter={viewFilter} onCreate={onCreate} t={t} />;

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.label}>
          <SectionHeader label={group.label} />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {group.gigs.map((gig) => {
                const isTodayGig = isToday(gig.date);
                const isPastGig = isPast(gig.date);
                return (
                    <Card
                      key={gig.id}
                      className={cn(
                        "group relative overflow-hidden border-2 transition-all duration-200 cursor-pointer",
                        "hover:shadow-xl hover:scale-[1.02] hover:border-primary/40",
                        isPastGig && "opacity-75"
                      )}
                      onClick={() => onClick(gig.id)}
                    >
                      {/* Today indicator stripe */}
                      {isTodayGig && (
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary z-10" />
                      )}

                      {/* Hero Image with overlaid title - Spotify style */}
                      <div className="relative">
                        <GigBandImage gig={gig} variant="card" />

                        {/* Title & Band overlaid on image */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                          <h3 className="text-2xl font-bold leading-tight line-clamp-2 text-white drop-shadow-lg mb-2 group-hover:text-primary/90 transition-colors">
                            {gig.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg text-white/90 font-medium drop-shadow">{gig.band_name || "TBD"}</span>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-5 space-y-3">
                        {/* Date & Call Time pills */}
                        <div className="flex flex-wrap gap-2">
                          {gig.date && (
                            <div className={cn(
                              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold border-2",
                              isTodayGig
                                ? "bg-orange-600/20 text-orange-600 border-orange-600/40 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/40"
                                : "bg-orange-600/15 text-orange-600 border-orange-600/30 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30"
                            )}>
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{isTodayGig ? t("today") : formatDate(gig.date, locale)}</span>
                            </div>
                          )}

                          {gig.call_time && (
                              <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1.5 text-sm font-medium text-muted-foreground border border-border/50">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{t("callLabel")} {gig.call_time}</span>
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
                        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-[15px]"
                            onClick={() => onEdit(gig.id)}
                          >
                            <Edit className="mx-1.5 h-3.5 w-3.5" />
                            {tCommon("edit")}
                          </Button>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 text-[15px]"
                                  onClick={() => onShare(gig.id)}
                                >
                                  <Share2 className="mx-1.5 h-3.5 w-3.5" />
                                  {tCommon("share")}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("tooltipShare")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(gig.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
