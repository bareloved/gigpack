"use client";

import { GigPack } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Music, Users, Shirt, Package, ParkingCircle, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface MinimalLayoutProps {
  gigPack: Omit<GigPack, "internal_notes" | "owner_id">;
  openMaps: () => void;
}

/**
 * Minimal theme layout
 * Clean, modern design with lots of whitespace and subtle accents
 */
export function MinimalLayout({ gigPack, openMaps }: MinimalLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Main Card */}
        <Card className="border shadow-lg">
          <div className="p-8 md:p-12 space-y-10">
            {/* Header */}
            <div className="space-y-4 text-center border-b pb-8">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {gigPack.title}
              </h1>
              {gigPack.band_name && (
                <p className="text-xl text-muted-foreground">
                  {gigPack.band_name}
                </p>
              )}
            </div>

            {/* Date & Time */}
            {(gigPack.date || gigPack.call_time || gigPack.on_stage_time) && (
              <div className="space-y-4">
                {gigPack.date && (
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{formatDate(gigPack.date)}</span>
                  </div>
                )}
                {(gigPack.call_time || gigPack.on_stage_time) && (
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                    {gigPack.call_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Call: {gigPack.call_time}</span>
                      </div>
                    )}
                    {gigPack.on_stage_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>On Stage: {gigPack.on_stage_time}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Venue */}
            {(gigPack.venue_name || gigPack.venue_address) && (
              <div className="space-y-3 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider font-semibold text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Venue</span>
                </div>
                <div className="space-y-2">
                  {gigPack.venue_name && (
                    <div className="text-xl font-semibold">{gigPack.venue_name}</div>
                  )}
                  {gigPack.venue_address && (
                    <div className="text-muted-foreground">{gigPack.venue_address}</div>
                  )}
                  {gigPack.venue_maps_url && (
                    <Button onClick={openMaps} variant="outline" size="sm" className="mt-2">
                      <MapPin className="mr-2 h-4 w-4" />
                      Open in Maps
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Lineup */}
            {gigPack.lineup && gigPack.lineup.length > 0 && (
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider font-semibold text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Who's Playing</span>
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
            {gigPack.setlist && (
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider font-semibold text-muted-foreground">
                  <Music className="h-4 w-4" />
                  <span>Setlist</span>
                </div>
                <div className="bg-muted/30 border rounded-lg p-6">
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
              </div>
            )}

            {/* Logistics */}
            {(gigPack.dress_code || gigPack.backline_notes || gigPack.parking_notes || gigPack.payment_notes) && (
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider font-semibold text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>Logistics</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {gigPack.dress_code && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                        <Shirt className="h-3.5 w-3.5" />
                        Dress Code
                      </div>
                      <p className="text-sm">{gigPack.dress_code}</p>
                    </div>
                  )}
                  {gigPack.backline_notes && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                        <Package className="h-3.5 w-3.5" />
                        Backline / Gear
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{gigPack.backline_notes}</p>
                    </div>
                  )}
                  {gigPack.parking_notes && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                        <ParkingCircle className="h-3.5 w-3.5" />
                        Parking / Load-in
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{gigPack.parking_notes}</p>
                    </div>
                  )}
                  {gigPack.payment_notes && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                        <DollarSign className="h-3.5 w-3.5" />
                        Payment
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{gigPack.payment_notes}</p>
                    </div>
                  )}
                </div>
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

