"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GigPack, LineupMember } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/lib/utils";
import { Plus, X, ExternalLink, Link as LinkIcon, Check, Trash2, Palette } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GigPackTheme } from "@/lib/types";
import { HandDrawnSquiggle } from "@/components/hand-drawn/accents";

interface GigPackFormProps {
  gigPack?: GigPack;
  onCancel?: () => void;
  onCreateSuccess?: (gigPack: GigPack) => void;
  onUpdateSuccess?: (gigPack: GigPack) => void;
  onDelete?: (gigPackId: string) => void;
}

export function GigPackForm({ gigPack, onCancel, onCreateSuccess, onUpdateSuccess, onDelete }: GigPackFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const isEditing = !!gigPack;

  // Prefetch dashboard for instant back navigation
  useEffect(() => {
    router.prefetch("/gigpacks");
  }, [router]);

  // Form state
  const [title, setTitle] = useState(gigPack?.title || "");
  const [bandName, setBandName] = useState(gigPack?.band_name || "");
  const [date, setDate] = useState(gigPack?.date || "");
  const [callTime, setCallTime] = useState(gigPack?.call_time || "");
  const [onStageTime, setOnStageTime] = useState(gigPack?.on_stage_time || "");
  const [venueName, setVenueName] = useState(gigPack?.venue_name || "");
  const [venueAddress, setVenueAddress] = useState(gigPack?.venue_address || "");
  const [venueMapsUrl, setVenueMapsUrl] = useState(gigPack?.venue_maps_url || "");
  const [lineup, setLineup] = useState<LineupMember[]>(
    gigPack?.lineup || [{ role: "", name: "", notes: "" }]
  );
  const [setlist, setSetlist] = useState(gigPack?.setlist || "");
  const [dressCode, setDressCode] = useState(gigPack?.dress_code || "");
  const [backlineNotes, setBacklineNotes] = useState(gigPack?.backline_notes || "");
  const [parkingNotes, setParkingNotes] = useState(gigPack?.parking_notes || "");
  const [paymentNotes, setPaymentNotes] = useState(gigPack?.payment_notes || "");
  const [internalNotes, setInternalNotes] = useState(gigPack?.internal_notes || "");
  const [theme, setTheme] = useState<GigPackTheme>((gigPack?.theme || "minimal") as GigPackTheme);
  const [isLoading, setIsLoading] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const addLineupMember = () => {
    setLineup([...lineup, { role: "", name: "", notes: "" }]);
  };

  const removeLineupMember = (index: number) => {
    setLineup(lineup.filter((_, i) => i !== index));
  };

  const updateLineupMember = (index: number, field: keyof LineupMember, value: string) => {
    const newLineup = [...lineup];
    newLineup[index] = { ...newLineup[index], [field]: value };
    setLineup(newLineup);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isEditing) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        return;
      }

      const gigPackData = {
        title,
        band_name: bandName || null,
        date: date || null,
        call_time: callTime || null,
        on_stage_time: onStageTime || null,
        venue_name: venueName || null,
        venue_address: venueAddress || null,
        venue_maps_url: venueMapsUrl || null,
        lineup: lineup.filter((m) => m.role),
        setlist: setlist || null,
        dress_code: dressCode || null,
        backline_notes: backlineNotes || null,
        parking_notes: parkingNotes || null,
        payment_notes: paymentNotes || null,
        internal_notes: internalNotes || null,
        theme: theme || "minimal",
      };

      if (isEditing) {
        toast({
          title: "✓ Saved",
          description: "Changes are live",
          duration: 2000,
        });

        const { data, error } = await supabase
          .from("gig_packs")
          .update(gigPackData)
          .eq("id", gigPack.id)
          .select("*")
          .single();

        if (error) {
          throw error;
        }

        if (onUpdateSuccess) {
          onUpdateSuccess(data);
        } else {
          startTransition(() => {
            router.refresh();
          });
        }
      } else {
        const { data, error } = await supabase
          .from("gig_packs")
          .insert({
            ...gigPackData,
            owner_id: user.id,
            public_slug: generateSlug(title),
          })
          .select("*")
          .single();

        if (error) {
          throw error;
        }

        toast({
          title: "✓ Created",
          description: "Gig Pack ready",
          duration: 2000,
        });

        if (onCreateSuccess) {
          onCreateSuccess(data);
        } else {
          router.push("/gigpacks");
        }
      }
    } catch (error) {
      console.error("Error saving gig pack:", error);
      toast({
        title: "Error",
        description: "Failed to save",
        variant: "destructive",
      });
      setJustSaved(false);
    } finally {
      setIsLoading(false);
    }
  };

  const copyPublicLink = () => {
    if (!gigPack) return;
    const url = `${window.location.origin}/g/${gigPack.public_slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "✓ Copied",
      description: "Ready to share",
      duration: 2000,
    });
  };

  const openPublicView = () => {
    if (!gigPack) return;
    window.open(`/g/${gigPack.public_slug}`, "_blank");
  };

  const handleDelete = async () => {
    if (!gigPack || !onDelete) return;
    
    if (!window.confirm(`Are you sure you want to delete "${gigPack.title}"? This action cannot be undone.`)) {
      return;
    }

    onDelete(gigPack.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Core Info */}
      <div className="space-y-4">
        <div className="gig-section-header">
          <HandDrawnSquiggle className="text-primary" />
          <span>Core Information</span>
        </div>
        <Card className="border-2">
          <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Gig Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summer Festival Main Stage"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bandName">Band / Project Name</Label>
            <Input
              id="bandName"
              value={bandName}
              onChange={(e) => setBandName(e.target.value)}
              placeholder="The Jazz Quartet"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="callTime">Call Time</Label>
              <Input
                id="callTime"
                type="time"
                value={callTime}
                onChange={(e) => setCallTime(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="onStageTime">On Stage Time</Label>
              <Input
                id="onStageTime"
                type="time"
                value={onStageTime}
                onChange={(e) => setOnStageTime(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venueName">Venue Name</Label>
            <Input
              id="venueName"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="The Blue Note"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venueAddress">Venue Address</Label>
            <Input
              id="venueAddress"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="123 Music St, Jazz City, JC 12345"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venueMapsUrl">Venue Maps URL</Label>
            <Input
              id="venueMapsUrl"
              type="url"
              value={venueMapsUrl}
              onChange={(e) => setVenueMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              disabled={isLoading}
            />
          </div>
        </CardContent>
        </Card>
      </div>

      <div className="section-divider"></div>

      {/* Lineup */}
      <div className="space-y-4">
        <div className="gig-section-header">
          <HandDrawnSquiggle className="text-primary" />
          <span>Lineup</span>
        </div>
        <Card className="border-2">
          <CardContent className="pt-6 space-y-4">
          {lineup.map((member, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="Role (e.g., Vocals)"
                  value={member.role}
                  onChange={(e) => updateLineupMember(index, "role", e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  placeholder="Name (optional)"
                  value={member.name || ""}
                  onChange={(e) => updateLineupMember(index, "name", e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  placeholder="Notes (optional)"
                  value={member.notes || ""}
                  onChange={(e) => updateLineupMember(index, "notes", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {lineup.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLineupMember(index)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLineupMember}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </CardContent>
        </Card>
      </div>

      <div className="section-divider"></div>

      {/* Music / Setlist */}
      <div className="space-y-4">
        <div className="gig-section-header">
          <HandDrawnSquiggle className="text-primary" />
          <span>Music / Setlist</span>
        </div>
        <Card className="border-2">
          <CardContent className="pt-6">
          <Textarea
            placeholder="Song Name - Artist - Key&#10;Another Song - Artist - Key"
            value={setlist}
            onChange={(e) => setSetlist(e.target.value)}
            rows={10}
            disabled={isLoading}
          />
        </CardContent>
        </Card>
      </div>

      <div className="section-divider"></div>

      {/* Design / Style */}
      <div className="space-y-4">
        <div className="gig-section-header">
          <HandDrawnSquiggle className="text-primary" />
          <Palette className="h-4 w-4" />
          <span>Design</span>
        </div>
        <Card className="border-2">
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Choose how your public GigPack page will look
            </p>
            <RadioGroup value={theme} onValueChange={(value) => setTheme(value as GigPackTheme)}>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-transparent hover:border-primary/20 transition-colors">
                  <RadioGroupItem value="minimal" id="theme-minimal" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="theme-minimal" className="text-base font-semibold cursor-pointer">
                      Minimal
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Clean, modern design with lots of whitespace and subtle accents
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-transparent hover:border-primary/20 transition-colors">
                  <RadioGroupItem value="vintage_poster" id="theme-vintage" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="theme-vintage" className="text-base font-semibold cursor-pointer">
                      Vintage Poster
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Bold, poster-like layout with retro styling and strong visual hierarchy
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-transparent hover:border-primary/20 transition-colors">
                  <RadioGroupItem value="social_card" id="theme-social" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="theme-social" className="text-base font-semibold cursor-pointer">
                      Social Card
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Social media-inspired layout with hero banner and card-based sections
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      <div className="section-divider"></div>

      {/* Logistics */}
      <div className="space-y-4">
        <div className="gig-section-header">
          <HandDrawnSquiggle className="text-primary" />
          <span>Logistics</span>
        </div>
        <Card className="border-2">
          <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dressCode">Dress Code</Label>
            <Input
              id="dressCode"
              value={dressCode}
              onChange={(e) => setDressCode(e.target.value)}
              placeholder="All black, smart casual, etc."
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="backlineNotes">Backline / Gear Notes</Label>
            <Textarea
              id="backlineNotes"
              value={backlineNotes}
              onChange={(e) => setBacklineNotes(e.target.value)}
              placeholder="PA system provided, bring your own instrument..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parkingNotes">Parking / Load-in Notes</Label>
            <Textarea
              id="parkingNotes"
              value={parkingNotes}
              onChange={(e) => setParkingNotes(e.target.value)}
              placeholder="Street parking available, loading dock at rear..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentNotes">Payment Notes</Label>
            <Textarea
              id="paymentNotes"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="$500 split evenly, paid after the show..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="internalNotes">Internal Notes (Private)</Label>
            <Textarea
              id="internalNotes"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="These notes are only visible to you, not on the public page..."
              rows={3}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              These notes will NOT appear on the public gig pack page
            </p>
          </div>
        </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-t-2 border-primary/20 shadow-lg">
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px] relative"
          >
            {justSaved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saved
              </>
            ) : isLoading ? (
              <>
                <span className="animate-pulse">
                  {isEditing ? "Saving..." : "Creating..."}
                </span>
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create Gig Pack"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onCancel) {
                onCancel();
              } else {
                router.back();
              }
            }}
            disabled={isLoading}
          >
            {isEditing ? "← Back" : "Cancel"}
          </Button>
        </div>

        {isEditing && gigPack && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyPublicLink}
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openPublicView}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Preview
            </Button>
            {onDelete && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </form>
  );
}

