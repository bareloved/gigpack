"use client";

import { GigPack } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Music, Users, Shirt, Package, ParkingCircle, DollarSign } from "lucide-react";
import { HandDrawnCornerBracket } from "@/components/hand-drawn/accents";

interface VintagePosterLayoutProps {
  gigPack: Omit<GigPack, "internal_notes" | "owner_id">;
  openMaps: () => void;
}

/**
 * Format date for punched-in date block
 * Returns: { dayOfWeek: "FRI", day: "23", month: "MAR" }
 */
function formatDateBlock(dateString: string | null): { dayOfWeek: string; day: string; month: string } | null {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const day = date.getDate().toString();
  const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  
  return { dayOfWeek, day, month };
}

/**
 * Parse setlist line to extract song name, artist, and key
 * Format: "SONG NAME – Artist – Key" or variations
 */
function parseSetlistLine(line: string): { number: number; title: string; meta: string } {
  const parts = line.split('–').map(s => s.trim());
  const title = parts[0] || line;
  const meta = parts.slice(1).join(' – ') || '';
  return { number: 0, title, meta };
}

/**
 * Vintage Poster theme layout
 * Classic venue flyer aesthetic: bold header, punched-in date block, printed-style setlist
 */
export function VintagePosterLayout({ gigPack, openMaps }: VintagePosterLayoutProps) {
  const dateBlock = formatDateBlock(gigPack.date);
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background dark:from-background dark:via-muted/10 dark:to-background">
      <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Main Poster Card */}
        <div className="bg-card border-4 border-primary/40 dark:border-primary/50 rounded-lg shadow-2xl overflow-hidden relative">
          {/* Hand-drawn corner brackets */}
          <HandDrawnCornerBracket className="absolute top-2 left-2 text-primary/60 dark:text-primary/50 w-6 h-6 md:w-8 md:h-8" style={{ transform: 'rotate(0deg)' }} />
          <HandDrawnCornerBracket className="absolute top-2 right-2 text-primary/60 dark:text-primary/50 w-6 h-6 md:w-8 md:h-8" style={{ transform: 'rotate(90deg)' }} />
          <HandDrawnCornerBracket className="absolute bottom-2 right-2 text-primary/60 dark:text-primary/50 w-6 h-6 md:w-8 md:h-8" style={{ transform: 'rotate(180deg)' }} />
          <HandDrawnCornerBracket className="absolute bottom-2 left-2 text-primary/60 dark:text-primary/50 w-6 h-6 md:w-8 md:h-8" style={{ transform: 'rotate(270deg)' }} />
          {/* STRONGER HEADER BAR - Warm amber/red background, bold gig title */}
          <div className="relative bg-gradient-to-r from-[hsl(25,85%,55%)] via-[hsl(25,90%,50%)] to-[hsl(25,85%,55%)] dark:from-[hsl(25,85%,45%)] dark:via-[hsl(25,90%,40%)] dark:to-[hsl(25,85%,45%)] text-white px-6 py-6 md:px-10 md:py-8 border-b-4 border-black/20 dark:border-white/20">
            <div className="space-y-3 md:space-y-4">
              {/* Gig Title - Large, bold, high-contrast */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] drop-shadow-md">
                {gigPack.title}
              </h1>
              {/* Band Name - Smaller subtitle */}
              {gigPack.band_name && (
                <p className="text-xl md:text-2xl lg:text-3xl font-bold tracking-wide opacity-95">
                  {gigPack.band_name}
                </p>
              )}
            </div>
          </div>

          {/* PUNCHED-IN DATE BLOCK & VENUE SECTION */}
          <div className="bg-card px-6 md:px-10 pt-6 pb-4 border-b-2 border-dashed border-muted">
            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
              {/* Date Block - Sticker/stamp effect */}
              {dateBlock && (
                <div className="flex-shrink-0">
                  <div className="bg-white dark:bg-card border-4 border-primary dark:border-primary/80 rounded-lg shadow-lg p-4 md:p-5 min-w-[140px] md:min-w-[160px]">
                    <div className="text-center space-y-1">
                      {/* Day of Week */}
                      <div className="text-xs md:text-sm font-black uppercase tracking-widest text-primary dark:text-primary">
                        {dateBlock.dayOfWeek}
                      </div>
                      {/* Day Number - Large */}
                      <div className="text-4xl md:text-5xl font-black leading-none text-foreground dark:text-foreground">
                        {dateBlock.day}
                      </div>
                      {/* Month */}
                      <div className="text-sm md:text-base font-bold uppercase tracking-wide text-muted-foreground dark:text-muted-foreground">
                        {dateBlock.month}
                      </div>
                    </div>
                  </div>
                  {/* Times below date block */}
                  {(gigPack.call_time || gigPack.on_stage_time) && (
                    <div className="mt-3 space-y-1.5 text-xs md:text-sm">
                      {gigPack.call_time && (
                        <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Call: {gigPack.call_time}</span>
                        </div>
                      )}
                      {gigPack.on_stage_time && (
                        <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Stage: {gigPack.on_stage_time}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Venue & Location - Next to date block */}
              {(gigPack.venue_name || gigPack.venue_address) && (
                <div className="flex-1 space-y-2">
                  {gigPack.venue_name && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary dark:text-primary flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-xl md:text-2xl font-bold text-foreground dark:text-foreground">
                          {gigPack.venue_name}
                        </div>
                        {gigPack.venue_address && (
                          <div className="text-sm md:text-base text-muted-foreground dark:text-muted-foreground">
                            {gigPack.venue_address}
                          </div>
                        )}
                        {gigPack.venue_maps_url && (
                          <Button 
                            onClick={openMaps} 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 border-primary/50 hover:bg-primary/10 dark:border-primary/50 dark:hover:bg-primary/20"
                          >
                            <MapPin className="mr-2 h-3.5 w-3.5" />
                            Open in Maps
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 md:p-10 space-y-8 bg-card">
            {/* Lineup - "Who's Playing" section */}
            {gigPack.lineup && gigPack.lineup.length > 0 && (
              <div className="space-y-4">
                {/* Section Header - Stamp-like label */}
                <div className="flex items-center gap-2 border-t-2 border-primary/30 dark:border-primary/40 pt-4">
                  <div className="bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded border border-primary/30 dark:border-primary/40">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-black text-primary dark:text-primary">
                      <Users className="h-3.5 w-3.5" />
                      <span>WHO'S PLAYING</span>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {gigPack.lineup.map((member, index) => (
                    <div 
                      key={index} 
                      className="bg-muted/40 dark:bg-muted/30 border-l-4 border-primary dark:border-primary/80 rounded-r-lg p-4 hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors"
                    >
                      <div className="font-black text-lg uppercase tracking-wide text-foreground dark:text-foreground">
                        {member.role}
                      </div>
                      {member.name && (
                        <div className="text-muted-foreground dark:text-muted-foreground font-semibold mt-1">
                          {member.name}
                        </div>
                      )}
                      {member.notes && (
                        <div className="text-sm text-muted-foreground dark:text-muted-foreground mt-2 italic">
                          {member.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Setlist - Printed-style typography */}
            {gigPack.setlist && (
              <div className="space-y-4">
                {/* Section Header - Stamp-like label */}
                <div className="flex items-center gap-2 border-t-2 border-primary/30 dark:border-primary/40 pt-4">
                  <div className="bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded border border-primary/30 dark:border-primary/40">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-black text-primary dark:text-primary">
                      <Music className="h-3.5 w-3.5" />
                      <span>SETLIST</span>
                    </div>
                  </div>
                </div>
                {/* Setlist Container - Paper-like background */}
                <div className="bg-[hsl(var(--muted))]/60 dark:bg-[hsl(var(--muted))]/40 border-2 border-muted dark:border-muted/50 rounded-lg p-5 md:p-6 shadow-inner">
                  <div className="space-y-0.5">
                    {gigPack.setlist.split('\n').map((line, index) => {
                      if (!line.trim()) {
                        return <div key={index} className="h-1"></div>;
                      }
                      const parsed = parseSetlistLine(line);
                      return (
                        <div key={index} className="flex gap-3 py-1.5 border-b border-dashed border-muted/60 dark:border-muted/40 last:border-0">
                          {/* Song Number */}
                          <span className="text-primary dark:text-primary font-black min-w-[2rem] text-xs md:text-sm tabular-nums">
                            {index + 1}.
                          </span>
                          {/* Song Title - Bold */}
                          <span className="flex-1 font-bold text-sm md:text-base text-foreground dark:text-foreground tracking-tight leading-snug">
                            {parsed.title}
                          </span>
                          {/* Meta (artist/key) - Dimmer, smaller */}
                          {parsed.meta && (
                            <span className="text-xs md:text-sm text-muted-foreground dark:text-muted-foreground font-medium ml-auto pl-2">
                              {parsed.meta}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Logistics */}
            {(gigPack.dress_code || gigPack.backline_notes || gigPack.parking_notes || gigPack.payment_notes) && (
              <div className="space-y-4">
                {/* Section Header - Stamp-like label */}
                <div className="flex items-center gap-2 border-t-2 border-primary/30 dark:border-primary/40 pt-4">
                  <div className="bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded border border-primary/30 dark:border-primary/40">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-black text-primary dark:text-primary">
                      <Package className="h-3.5 w-3.5" />
                      <span>LOGISTICS</span>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {gigPack.dress_code && (
                    <div className="bg-muted/40 dark:bg-muted/30 border-t-4 border-primary dark:border-primary/80 rounded-lg p-5">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-black text-muted-foreground dark:text-muted-foreground mb-2">
                        <Shirt className="h-4 w-4" />
                        Dress Code
                      </div>
                      <p className="text-sm font-semibold text-foreground dark:text-foreground">{gigPack.dress_code}</p>
                    </div>
                  )}
                  {gigPack.backline_notes && (
                    <div className="bg-muted/40 dark:bg-muted/30 border-t-4 border-primary dark:border-primary/80 rounded-lg p-5">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-black text-muted-foreground dark:text-muted-foreground mb-2">
                        <Package className="h-4 w-4" />
                        Backline
                      </div>
                      <p className="text-sm whitespace-pre-wrap text-foreground dark:text-foreground">{gigPack.backline_notes}</p>
                    </div>
                  )}
                  {gigPack.parking_notes && (
                    <div className="bg-muted/40 dark:bg-muted/30 border-t-4 border-primary dark:border-primary/80 rounded-lg p-5">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-black text-muted-foreground dark:text-muted-foreground mb-2">
                        <ParkingCircle className="h-4 w-4" />
                        Parking
                      </div>
                      <p className="text-sm whitespace-pre-wrap text-foreground dark:text-foreground">{gigPack.parking_notes}</p>
                    </div>
                  )}
                  {gigPack.payment_notes && (
                    <div className="bg-muted/40 dark:bg-muted/30 border-t-4 border-primary dark:border-primary/80 rounded-lg p-5">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-black text-muted-foreground dark:text-muted-foreground mb-2">
                        <DollarSign className="h-4 w-4" />
                        Payment
                      </div>
                      <p className="text-sm whitespace-pre-wrap text-foreground dark:text-foreground">{gigPack.payment_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t-2 border-dashed bg-muted/20 dark:bg-muted/10 px-6 py-4 text-center text-xs text-muted-foreground/60 dark:text-muted-foreground/50">
            <p>
              Powered by <span className="font-bold text-primary dark:text-primary">GigPack</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

