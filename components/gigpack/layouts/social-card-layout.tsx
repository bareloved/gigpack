"use client";

import { GigPack } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Music, Users, Shirt, Package, ParkingCircle, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SocialCardLayoutProps {
  gigPack: Omit<GigPack, "internal_notes" | "owner_id">;
  openMaps: () => void;
}

/**
 * Social Card theme layout
 * Social media-inspired layout with hero banner and card-based sections
 */
export function SocialCardLayout({ gigPack, openMaps }: SocialCardLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Banner Card */}
        <Card className="mb-6 overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 md:p-12">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                {gigPack.title}
              </h1>
              {gigPack.band_name && (
                <p className="text-xl md:text-2xl opacity-90">
                  {gigPack.band_name}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-primary-foreground/20">
                {gigPack.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="font-semibold">{formatDate(gigPack.date)}</span>
                  </div>
                )}
                {(gigPack.call_time || gigPack.on_stage_time) && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-semibold">
                      {gigPack.call_time || gigPack.on_stage_time}
                    </span>
                  </div>
                )}
                {gigPack.venue_name && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span className="font-semibold">{gigPack.venue_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Info Cards Stack */}
        <div className="space-y-4">
          {/* Venue Card */}
          {(gigPack.venue_name || gigPack.venue_address) && (
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider font-bold text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>Venue</span>
                </div>
                <div className="space-y-2">
                  {gigPack.venue_name && (
                    <div className="text-xl font-bold">{gigPack.venue_name}</div>
                  )}
                  {gigPack.venue_address && (
                    <div className="text-muted-foreground">{gigPack.venue_address}</div>
                  )}
                  {gigPack.venue_maps_url && (
                    <Button onClick={openMaps} variant="outline" size="sm" className="mt-3">
                      <MapPin className="mr-2 h-4 w-4" />
                      Open in Maps
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Times Card */}
          {(gigPack.call_time || gigPack.on_stage_time) && (
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider font-bold text-muted-foreground mb-4">
                  <Clock className="h-4 w-4" />
                  <span>Schedule</span>
                </div>
                <div className="space-y-3">
                  {gigPack.call_time && (
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        Call Time
                      </div>
                      <div className="text-lg font-semibold">{gigPack.call_time}</div>
                    </div>
                  )}
                  {gigPack.on_stage_time && (
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        On Stage
                      </div>
                      <div className="text-lg font-semibold">{gigPack.on_stage_time}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lineup Card */}
          {gigPack.lineup && gigPack.lineup.length > 0 && (
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider font-bold text-muted-foreground mb-4">
                  <Users className="h-4 w-4" />
                  <span>Who's Playing</span>
                </div>
                <div className="space-y-3">
                  {gigPack.lineup.map((member, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
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
              </CardContent>
            </Card>
          )}

          {/* Setlist Card */}
          {gigPack.setlist && (
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider font-bold text-muted-foreground mb-4">
                  <Music className="h-4 w-4" />
                  <span>Setlist</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {gigPack.setlist.split('\n').map((line, index) => (
                      line.trim() ? (
                        <div key={index} className="flex gap-3 py-1.5 border-b border-dashed last:border-0">
                          <span className="text-primary font-semibold min-w-[2rem]">
                            {index + 1}.
                          </span>
                          <span className="flex-1">{line}</span>
                        </div>
                      ) : (
                        <div key={index} className="h-2"></div>
                      )
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Logistics Card */}
          {(gigPack.dress_code || gigPack.backline_notes || gigPack.parking_notes || gigPack.payment_notes) && (
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider font-bold text-muted-foreground mb-4">
                  <Package className="h-4 w-4" />
                  <span>Logistics</span>
                </div>
                <div className="space-y-4">
                  {gigPack.dress_code && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                        <Shirt className="h-3.5 w-3.5" />
                        Dress Code
                      </div>
                      <p className="text-sm">{gigPack.dress_code}</p>
                    </div>
                  )}
                  {gigPack.backline_notes && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                        <Package className="h-3.5 w-3.5" />
                        Backline / Gear
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{gigPack.backline_notes}</p>
                    </div>
                  )}
                  {gigPack.parking_notes && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                        <ParkingCircle className="h-3.5 w-3.5" />
                        Parking / Load-in
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{gigPack.parking_notes}</p>
                    </div>
                  )}
                  {gigPack.payment_notes && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                        <DollarSign className="h-3.5 w-3.5" />
                        Payment
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{gigPack.payment_notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground/60">
          <p>
            Powered by <span className="font-semibold text-primary">GigPack</span>
          </p>
        </div>
      </div>
    </div>
  );
}

