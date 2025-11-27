"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { GigPack, LineupMember, SetlistSection, PackingChecklistItem } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/lib/utils";
import { Plus, X, ExternalLink, Link as LinkIcon, Check, Trash2, Palette, Upload, Image as ImageIcon, Info, Users, Music, Package, CheckSquare } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GigPackTheme, PosterSkin } from "@/lib/types";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { uploadImage, deleteImage, getPathFromUrl } from "@/lib/image-upload";
import { SetlistEditor } from "@/components/setlist-editor";
import { PackingChecklistEditor } from "@/components/packing-checklist-editor";
import { GIG_MOOD_PRESETS, CUSTOM_MOOD_ID, findMoodPreset, isCustomMood } from "@/lib/gigMoods";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface GigPackFormInitialValues {
  title?: string;
  bandName?: string;
  date?: string;
  callTime?: string;
  onStageTime?: string;
  venueName?: string;
  venueAddress?: string;
  venueMapsUrl?: string;
  lineup?: LineupMember[];
  setlistStructured?: SetlistSection[];
  dressCode?: string;
  backlineNotes?: string;
  parkingNotes?: string;
  paymentNotes?: string;
  internalNotes?: string;
  theme?: GigPackTheme;
  accentColor?: string;
  posterSkin?: PosterSkin;
  bandLogoUrl?: string;
  heroImageUrl?: string;
  packingChecklist?: PackingChecklistItem[];
  gigMood?: string;
}

interface GigPackFormProps {
  gigPack?: GigPack;
  initialValues?: GigPackFormInitialValues;
  onCancel?: () => void;
  onCreateSuccess?: (gigPack: GigPack) => void;
  onUpdateSuccess?: (gigPack: GigPack) => void;
  onDelete?: (gigPackId: string) => void;
}

export function GigPackForm({ gigPack, initialValues, onCancel, onCreateSuccess, onUpdateSuccess, onDelete }: GigPackFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("gigpack");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");
  const [, startTransition] = useTransition();
  const isEditing = !!gigPack;

  // Prefetch dashboard for instant back navigation
  useEffect(() => {
    router.prefetch("/gigpacks");
  }, [router]);

  // Form state - prioritize gigPack (editing), then initialValues (template), then empty defaults
  const [title, setTitle] = useState(gigPack?.title || initialValues?.title || "");
  const [bandName, setBandName] = useState(gigPack?.band_name || initialValues?.bandName || "");
  const [date, setDate] = useState(gigPack?.date || initialValues?.date || "");
  const [callTime, setCallTime] = useState(gigPack?.call_time || initialValues?.callTime || "");
  const [onStageTime, setOnStageTime] = useState(gigPack?.on_stage_time || initialValues?.onStageTime || "");
  const [venueName, setVenueName] = useState(gigPack?.venue_name || initialValues?.venueName || "");
  const [venueAddress, setVenueAddress] = useState(gigPack?.venue_address || initialValues?.venueAddress || "");
  const [venueMapsUrl, setVenueMapsUrl] = useState(gigPack?.venue_maps_url || initialValues?.venueMapsUrl || "");
  const [lineup, setLineup] = useState<LineupMember[]>(
    gigPack?.lineup || initialValues?.lineup || [{ role: "", name: "", notes: "" }]
  );
  // Legacy text setlist field (kept for backward compat, but not editable)
  const setlist = gigPack?.setlist || "";
  const [setlistStructured, setSetlistStructured] = useState<SetlistSection[]>(
    gigPack?.setlist_structured || initialValues?.setlistStructured || []
  );
  const [dressCode, setDressCode] = useState(gigPack?.dress_code || initialValues?.dressCode || "");
  const [backlineNotes, setBacklineNotes] = useState(gigPack?.backline_notes || initialValues?.backlineNotes || "");
  const [parkingNotes, setParkingNotes] = useState(gigPack?.parking_notes || initialValues?.parkingNotes || "");
  const [paymentNotes, setPaymentNotes] = useState(gigPack?.payment_notes || initialValues?.paymentNotes || "");
  const [internalNotes, setInternalNotes] = useState(gigPack?.internal_notes || initialValues?.internalNotes || "");
  const [theme, setTheme] = useState<GigPackTheme>((gigPack?.theme || initialValues?.theme || "minimal") as GigPackTheme);
  const [isLoading, setIsLoading] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Branding state
  const [bandLogoUrl, setBandLogoUrl] = useState(gigPack?.band_logo_url || initialValues?.bandLogoUrl || "");
  const [heroImageUrl, setHeroImageUrl] = useState(gigPack?.hero_image_url || initialValues?.heroImageUrl || "");
  const [accentColor, setAccentColor] = useState(gigPack?.accent_color || initialValues?.accentColor || "");
  const [posterSkin, setPosterSkin] = useState<PosterSkin>((gigPack?.poster_skin || initialValues?.posterSkin || "clean") as PosterSkin);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  // Packing checklist state
  const [packingChecklist, setPackingChecklist] = useState<PackingChecklistItem[]>(
    gigPack?.packing_checklist || initialValues?.packingChecklist || []
  );

  // Gig mood state
  const [gigMood, setGigMood] = useState(gigPack?.gig_mood || initialValues?.gigMood || "");
  const [isCustomMoodSelected, setIsCustomMoodSelected] = useState(() => {
    const currentMood = gigPack?.gig_mood || initialValues?.gigMood || "";
    return currentMood ? isCustomMood(currentMood) : false;
  });
  const [customMoodText, setCustomMoodText] = useState(() => {
    const currentMood = gigPack?.gig_mood || initialValues?.gigMood || "";
    return isCustomMood(currentMood) ? currentMood : "";
  });

  // Handle mood selection change
  const handleMoodChange = (value: string) => {
    if (value === CUSTOM_MOOD_ID) {
      setIsCustomMoodSelected(true);
      setGigMood(customMoodText);
    } else {
      setIsCustomMoodSelected(false);
      setCustomMoodText("");
      const preset = GIG_MOOD_PRESETS.find(p => p.id === value);
      setGigMood(preset?.label || "");
    }
  };

  // Handle custom mood text change
  const handleCustomMoodChange = (value: string) => {
    setCustomMoodText(value);
    setGigMood(value);
  };

  // Get current select value for controlled component
  const getCurrentMoodSelectValue = () => {
    if (isCustomMoodSelected) return CUSTOM_MOOD_ID;
    if (!gigMood) return "";
    const preset = findMoodPreset(gigMood);
    return preset?.id || CUSTOM_MOOD_ID;
  };

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

  // Image upload handlers
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: tCommon("error"),
          description: tAuth("mustBeLoggedIn"),
          variant: "destructive",
        });
        return;
      }

      const oldPath = bandLogoUrl ? getPathFromUrl(bandLogoUrl) : undefined;
      const result = await uploadImage(file, user.id, oldPath || undefined);

      if ("error" in result) {
        toast({
          title: tCommon("error"),
          description: result.error,
          variant: "destructive",
        });
      } else {
        setBandLogoUrl(result.url);
        toast({
          title: t("uploadImage"),
          description: "Logo uploaded successfully",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: tCommon("error"),
        description: t("imageUploadError"),
        variant: "destructive",
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingHero(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: tCommon("error"),
          description: tAuth("mustBeLoggedIn"),
          variant: "destructive",
        });
        return;
      }

      const oldPath = heroImageUrl ? getPathFromUrl(heroImageUrl) : undefined;
      const result = await uploadImage(file, user.id, oldPath || undefined);

      if ("error" in result) {
        toast({
          title: tCommon("error"),
          description: result.error,
          variant: "destructive",
        });
      } else {
        setHeroImageUrl(result.url);
        toast({
          title: t("uploadImage"),
          description: "Hero image uploaded successfully",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error uploading hero image:", error);
      toast({
        title: tCommon("error"),
        description: t("imageUploadError"),
        variant: "destructive",
      });
    } finally {
      setIsUploadingHero(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (bandLogoUrl) {
      const path = getPathFromUrl(bandLogoUrl);
      if (path) {
        await deleteImage(path);
      }
      setBandLogoUrl("");
    }
  };

  const handleRemoveHero = async () => {
    if (heroImageUrl) {
      const path = getPathFromUrl(heroImageUrl);
      if (path) {
        await deleteImage(path);
      }
      setHeroImageUrl("");
    }
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
          title: tCommon("error"),
          description: tAuth("mustBeLoggedIn"),
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
        setlist_structured: setlistStructured.length > 0 ? setlistStructured : null,
        dress_code: dressCode || null,
        backline_notes: backlineNotes || null,
        parking_notes: parkingNotes || null,
        payment_notes: paymentNotes || null,
        internal_notes: internalNotes || null,
        theme: theme || "minimal",
        // Branding fields
        band_logo_url: bandLogoUrl || null,
        hero_image_url: heroImageUrl || null,
        accent_color: accentColor || null,
        poster_skin: posterSkin || "clean",
        // Packing checklist
        packing_checklist: packingChecklist.filter(item => item.label.trim()).length > 0 
          ? packingChecklist.filter(item => item.label.trim()) 
          : null,
        // Gig mood
        gig_mood: gigMood || null,
      };

      if (isEditing) {
        toast({
          title: tCommon("saved"),
          description: t("savedDescription"),
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
          title: t("created"),
          description: t("createdDescription"),
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
        title: tCommon("error"),
        description: t("failedToSave"),
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
      title: tCommon("copied"),
      description: tCommon("readyToShare"),
      duration: 2000,
    });
  };

  const openPublicView = () => {
    if (!gigPack) return;
    window.open(`/g/${gigPack.public_slug}`, "_blank");
  };

  const handleDelete = async () => {
    if (!gigPack || !onDelete) return;
    
    if (!window.confirm(t("deleteConfirm", { title: gigPack.title }))) {
      return;
    }

    onDelete(gigPack.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Core Info */}
      <CollapsibleSection 
        title={t("coreInformation")} 
        icon={<Info className="h-4 w-4" />}
        defaultOpen={true}
      >
        <Card className="border-2">
          <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("gigTitleRequired")}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("gigTitlePlaceholder")}
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bandName">{t("bandName")}</Label>
            <Input
              id="bandName"
              value={bandName}
              onChange={(e) => setBandName(e.target.value)}
              placeholder={t("bandNamePlaceholder")}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">{t("date")}</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="callTime">{t("callTime")}</Label>
              <Input
                id="callTime"
                type="time"
                value={callTime}
                onChange={(e) => setCallTime(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="onStageTime">{t("onStageTime")}</Label>
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
            <Label htmlFor="venueName">{t("venueName")}</Label>
            <Input
              id="venueName"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder={t("venueNamePlaceholder")}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venueAddress">{t("venueAddress")}</Label>
            <Input
              id="venueAddress"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder={t("venueAddressPlaceholder")}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venueMapsUrl">{t("venueMapsUrl")}</Label>
            <Input
              id="venueMapsUrl"
              type="url"
              value={venueMapsUrl}
              onChange={(e) => setVenueMapsUrl(e.target.value)}
              placeholder={t("venueMapsUrlPlaceholder")}
              disabled={isLoading}
            />
          </div>

          {/* Gig Mood */}
          <div className="space-y-2 pt-4 border-t border-dashed">
            <Label htmlFor="gigMood">{t("gigMood")}</Label>
            <p className="text-xs text-muted-foreground mb-2">
              {t("gigMoodDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={getCurrentMoodSelectValue()}
                onValueChange={handleMoodChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder={t("selectMood")} />
                </SelectTrigger>
                <SelectContent>
                  {GIG_MOOD_PRESETS.map((mood) => (
                    <SelectItem key={mood.id} value={mood.id}>
                      {mood.label}
                    </SelectItem>
                  ))}
                  <SelectItem value={CUSTOM_MOOD_ID}>
                    {t("customMood")}
                  </SelectItem>
                </SelectContent>
              </Select>
              {isCustomMoodSelected && (
                <Input
                  value={customMoodText}
                  onChange={(e) => handleCustomMoodChange(e.target.value)}
                  placeholder={t("customMoodPlaceholder")}
                  className="flex-1"
                  disabled={isLoading}
                  maxLength={50}
                />
              )}
            </div>
          </div>
        </CardContent>
        </Card>
      </CollapsibleSection>

      <div className="section-divider"></div>

      {/* Lineup */}
      <CollapsibleSection 
        title={t("lineup")} 
        icon={<Users className="h-4 w-4" />}
        defaultOpen={false}
      >
        <Card className="border-2">
          <CardContent className="pt-6 space-y-4">
          {lineup.map((member, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder={t("rolePlaceholder")}
                  value={member.role}
                  onChange={(e) => updateLineupMember(index, "role", e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  placeholder={t("namePlaceholder")}
                  value={member.name || ""}
                  onChange={(e) => updateLineupMember(index, "name", e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  placeholder={t("notesPlaceholder")}
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
            {t("addMember")}
          </Button>
        </CardContent>
        </Card>
      </CollapsibleSection>

      <div className="section-divider"></div>

      {/* Music / Setlist */}
      <CollapsibleSection 
        title={t("musicSetlist")} 
        icon={<Music className="h-4 w-4" />}
        defaultOpen={false}
      >
        <Card className="border-2">
          <CardContent className="pt-6">
          <SetlistEditor
            value={setlistStructured}
            onChange={setSetlistStructured}
            disabled={isLoading}
          />
        </CardContent>
        </Card>
      </CollapsibleSection>

      <div className="section-divider"></div>

      {/* Design / Style */}
      <CollapsibleSection 
        title={t("design")} 
        icon={<Palette className="h-4 w-4" />}
        defaultOpen={false}
      >
        <Card className="border-2">
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              {t("designDescription")}
            </p>
            <RadioGroup name="theme" value={theme} onValueChange={(value) => setTheme(value as GigPackTheme)}>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-transparent hover:border-primary/20 transition-colors">
                  <RadioGroupItem value="minimal" id="theme-minimal" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="theme-minimal" className="text-base font-semibold cursor-pointer">
                      {t("themeMinimal")}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("themeMinimalDescription")}
                    </p>
                  </div>
                </div>
                {/* TODO: Re-enable vintage_poster when ready */}
                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-transparent opacity-50 cursor-not-allowed">
                  <RadioGroupItem value="vintage_poster" id="theme-vintage" className="mt-0.5" disabled />
                  <div className="flex-1">
                    <Label htmlFor="theme-vintage" className="text-base font-semibold cursor-not-allowed text-muted-foreground">
                      {t("themeVintagePoster")}
                      <span className="ml-2 text-xs font-normal">(coming soon)</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("themeVintagePosterDescription")}
                    </p>
                  </div>
                </div>
                {/* TODO: Re-enable social_card when ready */}
                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-transparent opacity-50 cursor-not-allowed">
                  <RadioGroupItem value="social_card" id="theme-social" className="mt-0.5" disabled />
                  <div className="flex-1">
                    <Label htmlFor="theme-social" className="text-base font-semibold cursor-not-allowed text-muted-foreground">
                      {t("themeSocialCard")}
                      <span className="ml-2 text-xs font-normal">(coming soon)</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("themeSocialCardDescription")}
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </CollapsibleSection>

      <div className="section-divider"></div>

      {/* Branding */}
      <CollapsibleSection 
        title={t("branding")} 
        icon={<ImageIcon className="h-4 w-4" />}
        defaultOpen={false}
      >
        <Card className="border-2">
          <CardContent className="pt-6 space-y-6">
            <p className="text-sm text-muted-foreground">
              {t("brandingDescription")}
            </p>

            {/* Band Logo */}
            <div className="space-y-3">
              <Label>{t("bandLogo")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("bandLogoDescription")}
              </p>
              {bandLogoUrl ? (
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 border-2 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={bandLogoUrl}
                      alt="Band logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("logo-upload")?.click()}
                      disabled={isLoading || isUploadingLogo}
                    >
                      {isUploadingLogo ? t("uploadingImage") : t("changeImage")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveLogo}
                      disabled={isLoading || isUploadingLogo}
                    >
                      {t("removeImage")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("logo-upload")?.click()}
                    disabled={isLoading || isUploadingLogo}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploadingLogo ? t("uploadingImage") : t("uploadImage")}
                  </Button>
                </div>
              )}
              <input
                id="logo-upload"
                name="bandLogo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={isLoading || isUploadingLogo}
              />
      </div>

            {/* Hero Image */}
            <div className="space-y-3">
              <Label>{t("heroImage")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("heroImageDescription")}
              </p>
              {heroImageUrl ? (
                <div className="flex items-start gap-4">
                  <div className="relative w-48 h-32 border-2 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={heroImageUrl}
                      alt="Hero image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("hero-upload")?.click()}
                      disabled={isLoading || isUploadingHero}
                    >
                      {isUploadingHero ? t("uploadingImage") : t("changeImage")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveHero}
                      disabled={isLoading || isUploadingHero}
                    >
                      {t("removeImage")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("hero-upload")?.click()}
                    disabled={isLoading || isUploadingHero}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploadingHero ? t("uploadingImage") : t("uploadImage")}
                  </Button>
                </div>
              )}
              <input
                id="hero-upload"
                name="heroImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleHeroUpload}
                disabled={isLoading || isUploadingHero}
              />
            </div>

            {/* Accent Color */}
            <div className="space-y-3">
              <Label htmlFor="accentColor">{t("accentColor")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("accentColorDescription")}
              </p>
              <div className="flex gap-3 items-center">
                {/* Color swatches for quick selection */}
                <div className="flex gap-2">
                  {["#F97316", "#EF4444", "#8B5CF6", "#10B981", "#3B82F6", "#F59E0B"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAccentColor(color)}
                      className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                      style={{
                        backgroundColor: color,
                        borderColor: accentColor === color ? "hsl(var(--primary))" : "transparent",
                      }}
                      title={color}
                    />
                  ))}
                </div>
                {/* Custom color input */}
                <Input
                  id="accentColor"
                  name="accentColor"
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#F97316"
                  className="max-w-[150px]"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Poster Skin */}
            <div className="space-y-3">
              <Label>{t("posterSkin")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("posterSkinDescription")}
              </p>
              <RadioGroup name="posterSkin" value={posterSkin} onValueChange={(value) => setPosterSkin(value as PosterSkin)}>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 rounded-lg border-2 border-transparent hover:border-primary/20 transition-colors">
                    <RadioGroupItem value="clean" id="skin-clean" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="skin-clean" className="font-semibold cursor-pointer">
                        {t("posterSkinClean")}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("posterSkinCleanDescription")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg border-2 border-transparent hover:border-primary/20 transition-colors">
                    <RadioGroupItem value="paper" id="skin-paper" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="skin-paper" className="font-semibold cursor-pointer">
                        {t("posterSkinPaper")}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("posterSkinPaperDescription")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg border-2 border-transparent hover:border-primary/20 transition-colors">
                    <RadioGroupItem value="grain" id="skin-grain" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="skin-grain" className="font-semibold cursor-pointer">
                        {t("posterSkinGrain")}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("posterSkinGrainDescription")}
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </CollapsibleSection>

      <div className="section-divider"></div>

      {/* Logistics */}
      <CollapsibleSection 
        title={t("logistics")} 
        icon={<Package className="h-4 w-4" />}
        defaultOpen={false}
      >
        <Card className="border-2">
          <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dressCode">{t("dressCode")}</Label>
            <Input
              id="dressCode"
              value={dressCode}
              onChange={(e) => setDressCode(e.target.value)}
              placeholder={t("dressCodePlaceholder")}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="backlineNotes">{t("backlineNotes")}</Label>
            <Textarea
              id="backlineNotes"
              value={backlineNotes}
              onChange={(e) => setBacklineNotes(e.target.value)}
              placeholder={t("backlineNotesPlaceholder")}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parkingNotes">{t("parkingNotes")}</Label>
            <Textarea
              id="parkingNotes"
              value={parkingNotes}
              onChange={(e) => setParkingNotes(e.target.value)}
              placeholder={t("parkingNotesPlaceholder")}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentNotes">{t("paymentNotes")}</Label>
            <Textarea
              id="paymentNotes"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder={t("paymentNotesPlaceholder")}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="internalNotes">{t("internalNotes")}</Label>
            <Textarea
              id="internalNotes"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder={t("internalNotesPlaceholder")}
              rows={3}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              {t("internalNotesDescription")}
            </p>
          </div>
        </CardContent>
        </Card>
      </CollapsibleSection>

      <div className="section-divider"></div>

      {/* Packing Checklist */}
      <CollapsibleSection 
        title={t("packingChecklist")} 
        icon={<CheckSquare className="h-4 w-4" />}
        defaultOpen={false}
      >
        <Card className="border-2">
          <CardContent className="pt-6">
            <PackingChecklistEditor
              value={packingChecklist}
              onChange={setPackingChecklist}
              disabled={isLoading}
            />
          </CardContent>
        </Card>
      </CollapsibleSection>

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
                {tCommon("saved")}
              </>
            ) : isLoading ? (
              <>
                <span className="animate-pulse">
                  {isEditing ? tCommon("saving") : tCommon("creating")}
                </span>
              </>
            ) : isEditing ? (
              tCommon("save")
            ) : (
              t("createGigPackButton")
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
            {isEditing ? tCommon("back") : tCommon("cancel")}
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
              {tCommon("copyLink")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openPublicView}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {tCommon("preview")}
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
                {tCommon("delete")}
              </Button>
            )}
          </div>
        )}
      </div>
    </form>
  );
}

