"use client";

import { useTranslations, useLocale } from "next-intl";
import { GigPack } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Music, Users, Shirt, Package, ParkingCircle, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { StructuredSetlist } from "@/components/structured-setlist";
import { PackingChecklist } from "@/components/packing-checklist";

interface MinimalLayoutProps {
  gigPack: Omit<GigPack, "internal_notes" | "owner_id">;
  openMaps: () => void;
  slug: string;
}

/**
 * Minimal theme layout
 * Clean, modern design with lots of whitespace and subtle accents
 * Supports branding: logo, hero image, accent color, poster skin
 */
export function MinimalLayout({ gigPack, openMaps, slug }: MinimalLayoutProps) {
  const locale = useLocale();
  const t = useTranslations("public");
  const tGigpack = useTranslations("gigpack");
  const tCommon = useTranslations("common");
  
  // Get branding values with fallbacks
  const accentColor = gigPack.accent_color || null;
  const posterSkin = gigPack.poster_skin || "clean";
  
  // Apply accent color as CSS variable if provided
  const customStyle = accentColor ? {
    "--custom-accent": accentColor,
  } as React.CSSProperties : {};
  
  return (
    <div className={`min-h-screen poster-skin-${posterSkin}`} style={customStyle}>
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Hero Image (optional) */}
        {gigPack.hero_image_url && (
          <div className="hero-image-container rounded-t-lg mb-0 h-48 md:h-64">
            <img src={gigPack.hero_image_url} alt="Hero" className="hero-image" />
            <div className="hero-overlay"></div>
          </div>
        )}

        {/* Main Card */}
        <Card className={`border shadow-lg bg-card/90 backdrop-blur-sm ${gigPack.hero_image_url ? 'rounded-t-none' : ''}`}>
          <div className="p-8 md:p-12 space-y-10">
            {/* Header with optional logo */}
            <div className="space-y-4 text-center border-b pb-8">
              {gigPack.band_logo_url && (
                <div className="flex justify-center mb-4">
                  <img src={gigPack.band_logo_url} alt="Band logo" className="band-logo" />
                </div>
              )}
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {gigPack.title}
              </h1>
              {gigPack.band_name && (
                <p className="text-xl text-muted-foreground">
                  {gigPack.band_name}
                </p>
              )}
              {/* Gig Mood Tag */}
              {gigPack.gig_mood && (
                <div className="flex justify-center pt-2">
                  <span 
                    className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border"
                    style={accentColor ? { 
                      backgroundColor: accentColor + '15',
                      borderColor: accentColor + '40',
                      color: accentColor 
                    } : {
                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                      borderColor: 'hsl(var(--primary) / 0.2)',
                      color: 'hsl(var(--primary))'
                    }}
                  >
                    {gigPack.gig_mood}
                  </span>
                </div>
              )}
            </div>

            {/* Date & Time */}
            {(gigPack.date || gigPack.call_time || gigPack.on_stage_time) && (
              <div className="space-y-4">
                {gigPack.date && (
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <Calendar className="h-5 w-5" style={accentColor ? { color: accentColor } : {}} />
                    <span className="font-semibold">{formatDate(gigPack.date, locale)}</span>
                  </div>
                )}
                {(gigPack.call_time || gigPack.on_stage_time) && (
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                    {gigPack.call_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{tGigpack("call")}: {gigPack.call_time}</span>
                      </div>
                    )}
                    {gigPack.on_stage_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{tGigpack("onStage")}: {gigPack.on_stage_time}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Venue */}
            {(gigPack.venue_name || gigPack.venue_address) && (
              <div className="space-y-3 pt-6 border-t" style={accentColor ? { borderColor: accentColor + '40' } : {}}>
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider font-semibold" style={accentColor ? { color: accentColor } : {}}>
                  <MapPin className="h-4 w-4" />
                  <span>{t("venue")}</span>
                </div>
                <div className="space-y-2">
                  {gigPack.venue_name && (
                    <div className="text-xl font-semibold">{gigPack.venue_name}</div>
                  )}
                  {gigPack.venue_address && (
                    <div className="text-muted-foreground">{gigPack.venue_address}</div>
                  )}
                  {gigPack.venue_maps_url && (
                    <Button 
                      onClick={openMaps} 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      style={accentColor ? { borderColor: accentColor, color: accentColor } : {}}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      {tCommon("openInMaps")}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Lineup */}
            {gigPack.lineup && gigPack.lineup.length > 0 && (
              <div className="space-y-4 pt-6 border-t" style={accentColor ? { borderColor: accentColor + '40' } : {}}>
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider font-semibold" style={accentColor ? { color: accentColor } : {}}>
                  <Users className="h-4 w-4" />
                  <span>{t("whosPlaying")}</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {gigPack.lineup.map((member, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="font-semibold">{member.role}</div>
                      {member.name && (
                        <div className="text-sm text-muted-foreground mt-1">{member.name}</div>
                      )}
                      {member.notes && (
                        <div className="text-sm text-muted-foreground mt-2 italic">{member.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Setlist */}
            {(gigPack.setlist_structured || gigPack.setlist) && (
              <div className="space-y-4 pt-6 border-t" style={accentColor ? { borderColor: accentColor + '40' } : {}}>
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider font-semibold" style={accentColor ? { color: accentColor } : {}}>
                  <Music className="h-4 w-4" />
                  <span>{t("setlist")}</span>
                </div>
                <div className="bg-muted/30 border rounded-lg p-6">
                  {/* Structured setlist takes priority */}
                  {gigPack.setlist_structured && gigPack.setlist_structured.length > 0 ? (
                    <StructuredSetlist 
                      sections={gigPack.setlist_structured} 
                      variant="minimal"
                      accentColor={accentColor || undefined}
                    />
                  ) : (
                    /* Fallback to text setlist */
                  <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                      {gigPack.setlist?.split('\n').map((line, index) => (
                      line.trim() ? (
                        <div key={index} className="flex gap-3 py-1.5 border-b border-dashed last:border-0">
                            <span className="font-semibold min-w-[2rem]" style={accentColor ? { color: accentColor } : {}}>
                            {index + 1}.
                          </span>
                          <span className="flex-1">{line}</span>
                        </div>
                      ) : (
                        <div key={index} className="h-2"></div>
                      )
                    ))}
                  </div>
                  )}
                </div>
              </div>
            )}

            {/* Logistics */}
            {(gigPack.dress_code || gigPack.backline_notes || gigPack.parking_notes || gigPack.payment_notes) && (
              <div className="space-y-4 pt-6 border-t" style={accentColor ? { borderColor: accentColor + '40' } : {}}>
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider font-semibold" style={accentColor ? { color: accentColor } : {}}>
                  <Package className="h-4 w-4" />
                  <span>Don&apos;t forget</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {gigPack.dress_code && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                        <Shirt className="h-3.5 w-3.5" />
                        {t("dressCode")}
                      </div>
                      <p className="text-sm">{gigPack.dress_code}</p>
                    </div>
                  )}
                  {gigPack.backline_notes && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                        <Package className="h-3.5 w-3.5" />
                        {t("backline")}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{gigPack.backline_notes}</p>
                    </div>
                  )}
                  {gigPack.parking_notes && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                        <ParkingCircle className="h-3.5 w-3.5" />
                        {t("parking")}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{gigPack.parking_notes}</p>
                    </div>
                  )}
                  {gigPack.payment_notes && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                        <DollarSign className="h-3.5 w-3.5" />
                        {t("payment")}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{gigPack.payment_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Packing Checklist */}
            {gigPack.packing_checklist && gigPack.packing_checklist.length > 0 && (
              <div className="space-y-4 pt-6 border-t" style={accentColor ? { borderColor: accentColor + '40' } : {}}>
                <PackingChecklist
                  items={gigPack.packing_checklist}
                  gigSlug={slug}
                  accentColor={accentColor || undefined}
                  variant="minimal"
                />
              </div>
            )}
          </div>
        </Card>
        
        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground/60">
          <p>
            Powered by <span className="font-semibold text-primary">GigPack</span>
          </p>
        </div>
      </div>
    </div>
  );
}

