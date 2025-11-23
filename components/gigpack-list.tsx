"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Edit, Link as LinkIcon, Music, Clock, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { HoverUnderline } from "@/components/hand-drawn/hover-underline";

interface GigPackListProps {
  gigPacks: {
    id: string;
    title: string;
    band_name: string | null;
    date: string | null;
    call_time: string | null;
    venue_name: string | null;
    public_slug: string;
  }[];
  onEdit?: (gigPackId: string) => void;
  onCreate?: () => void;
  onDelete?: (gigPackId: string) => void;
}

export function GigPackList({ gigPacks, onEdit, onCreate, onDelete }: GigPackListProps) {
  const { toast } = useToast();

  const copyPublicLink = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/g/${slug}`;
    
    // Copy immediately
    navigator.clipboard.writeText(url);
    
    // Instant toast without waiting
    toast({
      title: "✓ Copied",
      description: "Link ready to share",
      duration: 2000,
    });
  };

  const handleDelete = (packId: string, packTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete "${packTitle}"? This action cannot be undone.`)) {
      return;
    }

    if (onDelete) {
      onDelete(packId);
    }
  };

  if (gigPacks.length === 0) {
    return (
      <Card className="border-2 border-dashed bg-card/50">
        <CardContent className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="rounded-full bg-primary/10 p-6">
            <Music className="h-16 w-16 text-primary" />
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold">No gigs packed yet</h3>
            <p className="text-muted-foreground max-w-md text-lg">
              Create your first GigPack for your next show
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Share all the important details—setlist, times, venue, logistics—with your band in one clean page.
            </p>
          </div>
          {onCreate ? (
            <Button onClick={onCreate} size="lg" className="mt-4">
              <Music className="mr-2 h-5 w-5" />
              Create Your First GigPack
            </Button>
          ) : (
            <Button asChild size="lg" className="mt-4">
              <Link href="/gigpacks/new">
                <Music className="mr-2 h-5 w-5" />
                Create Your First GigPack
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {gigPacks.map((pack) => (
        <Card key={pack.id} className="gig-card group">
          <CardContent className="p-6 space-y-4">
            {/* Gig Title */}
            <div className="space-y-2">
              <Link 
                href={`/g/${pack.public_slug}`}
                className="block group/title"
              >
                <HoverUnderline color="hsl(var(--primary))">
                  <h3 className="text-2xl font-bold leading-tight line-clamp-2 group-hover:text-primary group-hover/title:text-primary transition-colors cursor-pointer">
                    {pack.title}
                  </h3>
                </HoverUnderline>
              </Link>
              {pack.band_name && (
                <p className="text-base text-muted-foreground font-medium">
                  {pack.band_name}
                </p>
              )}
            </div>

            {/* Date & Time Pill */}
            {(pack.date || pack.call_time) && (
              <div className="flex flex-wrap gap-2">
                {pack.date && (
                  <div className="date-pill">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(pack.date)}</span>
                  </div>
                )}
                {pack.call_time && (
                  <div className="inline-flex items-center rounded-lg bg-accent/10 px-3 py-1.5 text-sm font-semibold text-accent border border-accent/20">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    Call: {pack.call_time}
                  </div>
                )}
              </div>
            )}

            {/* Venue */}
            {pack.venue_name && (
              <div className="flex items-start gap-2 pt-2 border-t border-dashed">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium text-muted-foreground line-clamp-2">
                  {pack.venue_name}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-3">
              {onEdit ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 font-semibold"
                  onClick={() => onEdit(pack.id)}
                >
                  <Edit className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
              ) : (
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 font-semibold"
                >
                  <Link href={`/gigpacks/${pack.id}/edit`}>
                    <Edit className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 font-semibold"
                onClick={(e) => copyPublicLink(pack.public_slug, e)}
              >
                <LinkIcon className="mr-1.5 h-3.5 w-3.5" />
                Copy
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => handleDelete(pack.id, pack.title, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

