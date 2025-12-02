"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { format, parse } from "date-fns";
import { he } from "date-fns/locale";
import { GigPack, LineupMember, SetlistSection, PackingChecklistItem } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/lib/utils";
import { Plus, X, ExternalLink, Link as LinkIcon, Check, Trash2, Upload, Image as ImageIcon, Users, Music, Package, Bookmark, CalendarIcon } from "lucide-react";
import { SaveAsTemplateDialog } from "@/components/save-as-template-dialog";
import { GigPackTheme, PosterSkin } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { uploadImage, deleteImage, getPathFromUrl } from "@/lib/image-upload";
import { SetlistEditor } from "@/components/setlist-editor";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { VenueAutocomplete } from "@/components/ui/venue-autocomplete";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  gigMood?: string;
  bandLogoUrl?: string;
  heroImageUrl?: string;
  packingChecklist?: PackingChecklistItem[];
}

interface GigPackFormProps {
  gigPack?: GigPack;
  initialValues?: GigPackFormInitialValues;
  onCancel?: () => void;
  onCreateSuccess?: (gigPack: GigPack) => void;
  onUpdateSuccess?: (gigPack: GigPack) => void;
  onDelete?: (gigPackId: string) => void;
  onTemplateSaved?: () => void; // Called when a template is saved from this GigPack
}

export function GigPackForm({ gigPack, initialValues, onCancel, onCreateSuccess, onUpdateSuccess, onDelete, onTemplateSaved }: GigPackFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("gigpack");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");
  const tTemplates = useTranslations("templates");
  const locale = useLocale();
  const [, startTransition] = useTransition();
  const isEditing = !!gigPack;
  
  // Get date-fns locale for calendar
  const dateLocale = locale === "he" ? he : undefined;

  // Save as Template dialog state
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);

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
  const [gigMood, setGigMood] = useState(gigPack?.gig_mood || initialValues?.gigMood || "");
  const [isLoading, setIsLoading] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Branding state
  const [bandLogoUrl, setBandLogoUrl] = useState(gigPack?.band_logo_url || initialValues?.bandLogoUrl || "");
  const [heroImageUrl, setHeroImageUrl] = useState(gigPack?.hero_image_url || initialValues?.heroImageUrl || "");
  const [accentColor, setAccentColor] = useState(gigPack?.accent_color || initialValues?.accentColor || "");
  const [posterSkin, setPosterSkin] = useState<PosterSkin>((gigPack?.poster_skin || initialValues?.posterSkin || "paper") as PosterSkin);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  // Packing checklist state
  const [packingChecklist, setPackingChecklist] = useState<PackingChecklistItem[]>(
    gigPack?.packing_checklist || initialValues?.packingChecklist || []
  );

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
        gig_mood: gigMood || null,
        // Branding fields
        band_logo_url: bandLogoUrl || null,
        hero_image_url: heroImageUrl || null,
        accent_color: accentColor || null,
        poster_skin: posterSkin || "paper",
        // Packing checklist
        packing_checklist: packingChecklist.filter(item => item.label.trim()).length > 0 
          ? packingChecklist.filter(item => item.label.trim()) 
          : null,
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

  // State to track active tab
  const [activeTab, setActiveTab] = useState("lineup");

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Gig Basics - Always visible at top */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          {t("coreInformation")}
        </h2>
        <div className="pt-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-muted-foreground">{t("gigTitleRequired")}</Label>
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
              <Label htmlFor="bandName" className="text-muted-foreground">{t("bandName")}</Label>
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
                <Label className="text-muted-foreground">{t("date")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isLoading}
                      className={`w-full justify-start text-left font-normal ${!date ? "text-muted-foreground" : ""}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                      {date ? format(parse(date, "yyyy-MM-dd", new Date()), "PPP", { locale: dateLocale }) : t("pickDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date ? parse(date, "yyyy-MM-dd", new Date()) : undefined}
                      onSelect={(selectedDate) => {
                        setDate(selectedDate ? format(selectedDate, "yyyy-MM-dd") : "");
                      }}
                      locale={dateLocale}
                      weekStartsOn={0}
                      formatters={locale === "he" ? {
                        formatWeekdayName: (date) => {
                          const day = date.getDay();
                          const hebrewDays = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
                          return hebrewDays[day];
                        }
                      } : undefined}
                      dir={locale === "he" ? "rtl" : "ltr"}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">{t("callTime")}</Label>
                <TimePicker
                  value={callTime}
                  onChange={setCallTime}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">{t("onStageTime")}</Label>
                <TimePicker
                  value={onStageTime}
                  onChange={setOnStageTime}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">{t("venueName")}</Label>
              <VenueAutocomplete
                value={venueName}
                onChange={setVenueName}
                onPlaceSelect={(place) => {
                  if (place.address) {
                    setVenueAddress(place.address)
                  }
                  if (place.mapsUrl) {
                    setVenueMapsUrl(place.mapsUrl)
                  }
                }}
                placeholder={t("venueNamePlaceholder")}
                disabled={isLoading}
              />
              {venueAddress && (
                <p className="text-xs text-muted-foreground mt-1">
                  📍 {venueAddress}
                </p>
              )}
            </div>
        </div>
      </div>

      {/* Tabbed Sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 flex justify-center">
          <TabsList className="w-max flex-wrap sm:flex-nowrap">
            <TabsTrigger value="lineup" className="flex-shrink-0">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t("lineup")}</span>
            </TabsTrigger>
            <TabsTrigger value="setlist" className="flex-shrink-0">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">{t("musicSetlist")}</span>
            </TabsTrigger>
            <TabsTrigger value="logistics" className="flex-shrink-0">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">{t("logistics")}</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex-shrink-0">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t("branding")}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Lineup Tab */}
        <TabsContent value="lineup">
          <div className="pt-6 space-y-4">
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
          </div>
        </TabsContent>

        {/* Setlist Tab */}
        <TabsContent value="setlist">
          <div className="pt-6">
            <SetlistEditor
              value={setlistStructured}
              onChange={setSetlistStructured}
              disabled={isLoading}
            />
          </div>
        </TabsContent>

        {/* Logistics Tab */}
        <TabsContent value="logistics">
          <div className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dressCode" className="text-muted-foreground">{t("dressCode")}</Label>
              <Input
                id="dressCode"
                value={dressCode}
                onChange={(e) => setDressCode(e.target.value)}
                placeholder={t("dressCodePlaceholder")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backlineNotes" className="text-muted-foreground">{t("backlineNotes")}</Label>
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
              <Label htmlFor="parkingNotes" className="text-muted-foreground">{t("parkingNotes")}</Label>
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
              <Label htmlFor="paymentNotes" className="text-muted-foreground">{t("paymentNotes")}</Label>
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
              <Label htmlFor="internalNotes" className="text-muted-foreground">{t("internalNotes")}</Label>
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
          </div>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <div className="pt-6 space-y-6">
            <p className="text-sm text-muted-foreground">
              {t("brandingDescription")}
            </p>

            {/* Band Logo */}
            <div className="space-y-3">
              <Label className="text-muted-foreground">{t("bandLogo")}</Label>
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
              <Label className="text-muted-foreground">{t("heroImage")}</Label>
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
              <Label htmlFor="accentColor" className="text-muted-foreground">{t("accentColor")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("accentColorDescription")}
              </p>
                <div className="flex gap-3 items-center">
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

          </div>
        </TabsContent>
      </Tabs>

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
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSaveAsTemplateOpen(true)}
            >
              <Bookmark className="mr-2 h-4 w-4" />
              {tTemplates("saveAsTemplate")}
            </Button>
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

      {/* Save as Template Dialog */}
      <SaveAsTemplateDialog
        open={saveAsTemplateOpen}
        onOpenChange={setSaveAsTemplateOpen}
        formValues={{
          title,
          bandName,
          theme,
          accentColor,
          posterSkin,
          dressCode,
          backlineNotes,
          parkingNotes,
          paymentNotes,
          gigMood,
          setlistStructured,
          packingChecklist,
        }}
        onSuccess={onTemplateSaved}
      />
    </form>
  );
}

