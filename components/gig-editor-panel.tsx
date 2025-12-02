"use client";

import * as React from "react";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { format, parse } from "date-fns";
import { he } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Maximize2,
  MoreHorizontal,
  Clock3,
  X,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Music,
  Package,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  Check,
  ExternalLink,
  Link as LinkIcon,
  Bookmark,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";
import { GigPack, LineupMember, SetlistSection, PackingChecklistItem, GigPackTheme, PosterSkin } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/lib/utils";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SaveAsTemplateDialog } from "@/components/save-as-template-dialog";
import { GIGPACK_TEMPLATES, GigPackTemplate, applyTemplateToFormDefaults, userTemplateToGigPackTemplate } from "@/lib/gigpackTemplates";
import type { UserTemplate } from "@/lib/types";

// ============================================================================
// Types
// ============================================================================

export interface GigEditorPanelInitialValues {
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
  gigMood?: string;
  theme?: GigPackTheme;
  accentColor?: string;
  posterSkin?: PosterSkin;
  bandLogoUrl?: string;
  heroImageUrl?: string;
  packingChecklist?: PackingChecklistItem[];
}

export interface GigEditorPanelProps {
  /** Whether the panel is open */
  open: boolean;
  /** Callback when panel should close */
  onOpenChange: (open: boolean) => void;
  /** Existing gig for editing (if undefined, we're creating) */
  gigPack?: GigPack;
  /** Callback on successful create */
  onCreateSuccess?: (gigPack: GigPack) => void;
  /** Callback on successful update */
  onUpdateSuccess?: (gigPack: GigPack) => void;
  /** Callback on delete */
  onDelete?: (gigPackId: string) => void;
  /** Callback when template saved */
  onTemplateSaved?: () => void;
  /** User templates for the menu */
  userTemplates?: UserTemplate[];
  /** Callback to reload user templates */
  onUserTemplatesChange?: () => void;
  /** Whether user templates are loading */
  isLoadingUserTemplates?: boolean;
}

// ============================================================================
// Custom Tabs Component (styled for panel)
// ============================================================================

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface PanelTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

function PanelTabs({ tabs, activeTab, onTabChange }: PanelTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
              "flex items-center gap-2",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Metadata Row Component
// ============================================================================

interface MetadataRowProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

function MetadataRow({ label, children, className }: MetadataRowProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="w-24 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex-1 flex items-center gap-2">{children}</div>
    </div>
  );
}

// ============================================================================
// Inline Input - looks like text but is editable
// ============================================================================

interface InlineInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  displayClassName?: string;
}

const InlineInput = React.forwardRef<HTMLInputElement, InlineInputProps>(
  ({ className, displayClassName, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "bg-transparent border-none outline-none w-full",
          "text-foreground placeholder:text-muted-foreground",
          "focus:ring-0 focus-visible:ring-0",
          "hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors",
          displayClassName,
          className
        )}
        {...props}
      />
    );
  }
);
InlineInput.displayName = "InlineInput";

// ============================================================================
// Inline Textarea - looks like text but is editable
// ============================================================================

type InlineTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const InlineTextarea = React.forwardRef<HTMLTextAreaElement, InlineTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "bg-transparent border-none outline-none w-full resize-none",
          "text-foreground placeholder:text-muted-foreground",
          "focus:ring-0 focus-visible:ring-0",
          "hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);
InlineTextarea.displayName = "InlineTextarea";

// ============================================================================
// Main Component
// ============================================================================

export function GigEditorPanel({
  open,
  onOpenChange,
  gigPack,
  onCreateSuccess,
  onUpdateSuccess,
  onDelete,
  onTemplateSaved,
  userTemplates = [],
  isLoadingUserTemplates = false,
}: GigEditorPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("gigpack");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");
  const tTemplates = useTranslations("templates");
  const locale = useLocale();
  const [, startTransition] = useTransition();
  const isEditing = !!gigPack;
  const dateLocale = locale === "he" ? he : undefined;

  // Active tab
  const [activeTab, setActiveTab] = useState("lineup");

  // Save as Template dialog state
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);

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
  const setlist = gigPack?.setlist || "";
  const [setlistStructured, setSetlistStructured] = useState<SetlistSection[]>(
    gigPack?.setlist_structured || []
  );
  const [dressCode, setDressCode] = useState(gigPack?.dress_code || "");
  const [backlineNotes, setBacklineNotes] = useState(gigPack?.backline_notes || "");
  const [parkingNotes, setParkingNotes] = useState(gigPack?.parking_notes || "");
  const [paymentNotes, setPaymentNotes] = useState(gigPack?.payment_notes || "");
  const [internalNotes, setInternalNotes] = useState(gigPack?.internal_notes || "");
  const [gigMood, setGigMood] = useState(gigPack?.gig_mood || "");
  const [theme, setTheme] = useState<GigPackTheme>((gigPack?.theme || "minimal") as GigPackTheme);
  const [isLoading, setIsLoading] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Branding state
  const [bandLogoUrl, setBandLogoUrl] = useState(gigPack?.band_logo_url || "");
  const [heroImageUrl, setHeroImageUrl] = useState(gigPack?.hero_image_url || "");
  const [accentColor, setAccentColor] = useState(gigPack?.accent_color || "");
  const [posterSkin, setPosterSkin] = useState<PosterSkin>((gigPack?.poster_skin || "paper") as PosterSkin);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  // Packing checklist state
  const [packingChecklist, setPackingChecklist] = useState<PackingChecklistItem[]>(
    gigPack?.packing_checklist || []
  );

  // Apply a template to the form (resets fields with template values)
  const applyTemplate = (template: GigPackTemplate) => {
    const values = applyTemplateToFormDefaults(template);
    
    // Reset form with template values
    setTitle(values.title || "");
    setBandName(values.bandName || "");
    setTheme((values.theme || "minimal") as GigPackTheme);
    setAccentColor(values.accentColor || "");
    setPosterSkin((values.posterSkin || "paper") as PosterSkin);
    setDressCode(values.dressCode || "");
    setBacklineNotes(values.backlineNotes || "");
    setParkingNotes(values.parkingNotes || "");
    setPaymentNotes(values.paymentNotes || "");
    setGigMood(values.gigMood || "");
    setSetlistStructured(values.setlistStructured || []);
    setPackingChecklist(values.packingChecklist || []);
    
    // Apply date offset if present
    if (values.date) {
      setDate(values.date);
    }

    toast({
      title: tTemplates("templateApplied"),
      description: template.label,
      duration: 2000,
    });
  };

  const handleApplyUserTemplate = (template: UserTemplate) => {
    const gigPackTemplate = userTemplateToGigPackTemplate(template);
    applyTemplate(gigPackTemplate);
  };

  const handleStartBlank = () => {
    // Reset all fields to blank
    setTitle("");
    setBandName("");
    setDate("");
    setCallTime("");
    setOnStageTime("");
    setVenueName("");
    setVenueAddress("");
    setVenueMapsUrl("");
    setLineup([{ role: "", name: "", notes: "" }]);
    setSetlistStructured([]);
    setDressCode("");
    setBacklineNotes("");
    setParkingNotes("");
    setPaymentNotes("");
    setInternalNotes("");
    setGigMood("");
    setTheme("minimal");
    setAccentColor("");
    setPosterSkin("paper");
    setBandLogoUrl("");
    setHeroImageUrl("");
    setPackingChecklist([]);

    toast({
      title: tTemplates("startedBlank"),
      duration: 2000,
    });
  };

  // Reset form when gigPack changes (switching between edit targets)
  useEffect(() => {
    if (gigPack) {
      setTitle(gigPack.title || "");
      setBandName(gigPack.band_name || "");
      setDate(gigPack.date || "");
      setCallTime(gigPack.call_time || "");
      setOnStageTime(gigPack.on_stage_time || "");
      setVenueName(gigPack.venue_name || "");
      setVenueAddress(gigPack.venue_address || "");
      setVenueMapsUrl(gigPack.venue_maps_url || "");
      setLineup(gigPack.lineup || [{ role: "", name: "", notes: "" }]);
      setSetlistStructured(gigPack.setlist_structured || []);
      setDressCode(gigPack.dress_code || "");
      setBacklineNotes(gigPack.backline_notes || "");
      setParkingNotes(gigPack.parking_notes || "");
      setPaymentNotes(gigPack.payment_notes || "");
      setInternalNotes(gigPack.internal_notes || "");
      setGigMood(gigPack.gig_mood || "");
      setBandLogoUrl(gigPack.band_logo_url || "");
      setHeroImageUrl(gigPack.hero_image_url || "");
      setAccentColor(gigPack.accent_color || "");
      setPosterSkin((gigPack.poster_skin || "paper") as PosterSkin);
      setPackingChecklist(gigPack.packing_checklist || []);
    }
  }, [gigPack]);

  // Lineup handlers
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

  // Submit handler
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: tCommon("error"),
        description: t("titleRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    if (isEditing) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }

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
        gig_mood: gigMood || null,
        theme: theme || "minimal",
        band_logo_url: bandLogoUrl || null,
        hero_image_url: heroImageUrl || null,
        accent_color: accentColor || null,
        poster_skin: posterSkin || "paper",
        packing_checklist: packingChecklist.filter(item => item.label.trim()).length > 0 
          ? packingChecklist.filter(item => item.label.trim()) 
          : null,
      };

      if (isEditing && gigPack) {
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

        if (error) throw error;

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

        if (error) throw error;

        toast({
          title: t("created"),
          description: t("createdDescription"),
          duration: 2000,
        });

        if (onCreateSuccess) {
          onCreateSuccess(data);
        } else {
          onOpenChange(false);
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

  // Public link handlers
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
    onOpenChange(false);
  };

  // Tab configuration
  const tabs: TabItem[] = [
    { id: "lineup", label: t("lineup"), icon: <Users className="h-4 w-4" /> },
    { id: "setlist", label: t("musicSetlist"), icon: <Music className="h-4 w-4" /> },
    { id: "info", label: t("logistics"), icon: <Package className="h-4 w-4" /> },
    { id: "branding", label: t("branding"), icon: <ImageIcon className="h-4 w-4" /> },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className={cn(
            "w-full sm:max-w-2xl p-0 gap-0 overflow-hidden",
            "bg-background border-l border-border",
            "shadow-2xl",
            "[&>button]:hidden" // Hide default close button, we have our own
          )}
        >
          <SheetTitle className="sr-only">
            {isEditing ? t("editGigPackTitle") : t("createGigPackTitle")}
          </SheetTitle>

          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* ================================================================
                Top Icon Bar
                ================================================================ */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {isEditing && gigPack && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={openPublicView}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                      title={tCommon("preview")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={copyPublicLink}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                      title={tCommon("copyLink")}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                {/* More Options Menu with Templates */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {/* Templates section - only show in create mode */}
                    {!isEditing && (
                      <>
                        <DropdownMenuLabel>
                          {tTemplates("startFrom")}
                        </DropdownMenuLabel>
                        
                        {/* Start Blank */}
                        <DropdownMenuItem 
                          onClick={handleStartBlank}
                          className="cursor-pointer"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          {tTemplates("blankGigPack")}
                        </DropdownMenuItem>

                        {/* User Templates Submenu */}
                        {userTemplates.length > 0 && (
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="cursor-pointer">
                              <Bookmark className="mr-2 h-4 w-4" />
                              {tTemplates("myTemplates")}
                              {isLoadingUserTemplates && (
                                <Loader2 className="ml-auto h-3 w-3 animate-spin" />
                              )}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {userTemplates.map((template) => (
                                <DropdownMenuItem
                                  key={template.id}
                                  onClick={() => handleApplyUserTemplate(template)}
                                  className="cursor-pointer"
                                >
                                  <span className="mr-2">{template.icon || "📋"}</span>
                                  {template.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        )}

                        {/* Built-in Templates Submenu */}
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="cursor-pointer">
                            <Sparkles className="mr-2 h-4 w-4" />
                            {tTemplates("builtInTemplates")}
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {GIGPACK_TEMPLATES.map((template) => (
                              <DropdownMenuItem
                                key={template.id}
                                onClick={() => applyTemplate(template)}
                                className="cursor-pointer"
                              >
                                <span className="mr-2">{template.icon}</span>
                                {template.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* Edit mode actions */}
                    {isEditing && gigPack && (
                      <>
                        <DropdownMenuItem 
                          onClick={() => setSaveAsTemplateOpen(true)}
                          className="cursor-pointer"
                        >
                          <Bookmark className="mr-2 h-4 w-4" />
                          {tTemplates("saveAsTemplate")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={handleDelete}
                            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {tCommon("delete")}
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* ================================================================
                Scrollable Content Area
                ================================================================ */}
            <div className="flex-1 overflow-y-auto px-6 pb-4 min-h-0">
              {/* Title - Large inline editable */}
              <InlineInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("gigTitlePlaceholder")}
                required
                disabled={isLoading}
                autoFocus={!isEditing}
                displayClassName="text-2xl font-semibold leading-snug"
              />

              {/* Band Name - Subtitle style */}
              <div className="mt-1 mb-6">
                <InlineInput
                  value={bandName}
                  onChange={(e) => setBandName(e.target.value)}
                  placeholder={t("bandNamePlaceholder")}
                  disabled={isLoading}
                  displayClassName="text-base text-muted-foreground"
                />
              </div>

              {/* ============================================================
                  Metadata Section
                  ============================================================ */}
              <div className="space-y-3 mb-6">
                {/* Date */}
                <MetadataRow label={t("date")}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        disabled={isLoading}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1 -mx-2 rounded transition-colors",
                          "hover:bg-accent/50 text-sm",
                          date ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {date ? format(parse(date, "yyyy-MM-dd", new Date()), "PPP", { locale: dateLocale }) : t("pickDate")}
                      </button>
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
                          formatWeekdayName: (d) => {
                            const day = d.getDay();
                            const hebrewDays = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
                            return hebrewDays[day];
                          }
                        } : undefined}
                        dir={locale === "he" ? "rtl" : "ltr"}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </MetadataRow>

                {/* Call Time */}
                <MetadataRow label={t("callTime")}>
                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                  <div className="w-32">
                    <TimePicker
                      value={callTime}
                      onChange={setCallTime}
                      disabled={isLoading}
                    />
                  </div>
                </MetadataRow>

                {/* On Stage Time */}
                <MetadataRow label={t("onStageTime")}>
                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                  <div className="w-32">
                    <TimePicker
                      value={onStageTime}
                      onChange={setOnStageTime}
                      disabled={isLoading}
                    />
                  </div>
                </MetadataRow>

                {/* Venue */}
                <MetadataRow label={t("venueName")} className="items-start">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <VenueAutocomplete
                        value={venueName}
                        onChange={setVenueName}
                        onPlaceSelect={(place) => {
                          if (place.address) setVenueAddress(place.address);
                          if (place.mapsUrl) setVenueMapsUrl(place.mapsUrl);
                        }}
                        placeholder={t("venueNamePlaceholder")}
                        disabled={isLoading}
                      />
                    </div>
                    {venueAddress && (
                      <p className="text-xs text-muted-foreground ml-6">
                        {venueAddress}
                      </p>
                    )}
                  </div>
                </MetadataRow>

                {/* Gig Mood */}
                <MetadataRow label={t("gigMood")}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        disabled={isLoading}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1 -mx-2 rounded transition-colors",
                          "hover:bg-accent/50 text-sm",
                          gigMood ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                        {gigMood || t("selectMood")}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-1" align="start">
                      <div className="grid gap-1">
                        {["High energy", "Acoustic", "Jazz", "Party", "Lounge", "Club night", "Retro", "Outdoor"].map((vibe) => (
                          <button
                            key={vibe}
                            type="button"
                            onClick={() => setGigMood(vibe)}
                            className={cn(
                              "w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors",
                              gigMood === vibe && "bg-accent font-medium"
                            )}
                          >
                            {vibe}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </MetadataRow>
              </div>

              {/* ============================================================
                  Tabs Section
                  ============================================================ */}
              <PanelTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {/* Tab Content */}
              <div className="mt-4 min-h-[200px]">
                {/* Lineup Tab */}
                {activeTab === "lineup" && (
                  <div className="space-y-3">
                    {lineup.map((member, index) => (
                      <div key={index} className="flex gap-2 items-start group">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                          <InlineInput
                            placeholder={t("rolePlaceholder")}
                            value={member.role}
                            onChange={(e) => updateLineupMember(index, "role", e.target.value)}
                            disabled={isLoading}
                            displayClassName="text-sm"
                          />
                          <InlineInput
                            placeholder={t("namePlaceholder")}
                            value={member.name || ""}
                            onChange={(e) => updateLineupMember(index, "name", e.target.value)}
                            disabled={isLoading}
                            displayClassName="text-sm"
                          />
                          <InlineInput
                            placeholder={t("notesPlaceholder")}
                            value={member.notes || ""}
                            onChange={(e) => updateLineupMember(index, "notes", e.target.value)}
                            disabled={isLoading}
                            displayClassName="text-sm text-muted-foreground"
                          />
                        </div>
                        {lineup.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLineupMember(index)}
                            disabled={isLoading}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addLineupMember}
                      disabled={isLoading}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t("addMember")}
                    </Button>
                  </div>
                )}

                {/* Setlist Tab */}
                {activeTab === "setlist" && (
                  <div>
                    <SetlistEditor
                      value={setlistStructured}
                      onChange={setSetlistStructured}
                      disabled={isLoading}
                    />
                  </div>
                )}

                {/* Info/Logistics Tab */}
                {activeTab === "info" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("dressCode")}
                      </label>
                      <InlineInput
                        value={dressCode}
                        onChange={(e) => setDressCode(e.target.value)}
                        placeholder={t("dressCodePlaceholder")}
                        disabled={isLoading}
                        displayClassName="text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("backlineNotes")}
                      </label>
                      <InlineTextarea
                        value={backlineNotes}
                        onChange={(e) => setBacklineNotes(e.target.value)}
                        placeholder={t("backlineNotesPlaceholder")}
                        rows={2}
                        disabled={isLoading}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("parkingNotes")}
                      </label>
                      <InlineTextarea
                        value={parkingNotes}
                        onChange={(e) => setParkingNotes(e.target.value)}
                        placeholder={t("parkingNotesPlaceholder")}
                        rows={2}
                        disabled={isLoading}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("paymentNotes")}
                      </label>
                      <InlineTextarea
                        value={paymentNotes}
                        onChange={(e) => setPaymentNotes(e.target.value)}
                        placeholder={t("paymentNotesPlaceholder")}
                        rows={2}
                        disabled={isLoading}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("internalNotes")}
                      </label>
                      <InlineTextarea
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        placeholder={t("internalNotesPlaceholder")}
                        rows={3}
                        disabled={isLoading}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("internalNotesDescription")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Branding Tab */}
                {activeTab === "branding" && (
                  <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                      {t("brandingDescription")}
                    </p>

                    {/* Band Logo */}
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("bandLogo")}
                      </label>
                      {bandLogoUrl ? (
                        <div className="flex items-center gap-4">
                          <div className="relative w-20 h-20 border border-border rounded-lg overflow-hidden bg-muted">
                            <img
                              src={bandLogoUrl}
                              alt="Band logo"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => document.getElementById("logo-upload-panel")?.click()}
                              disabled={isLoading || isUploadingLogo}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {isUploadingLogo ? t("uploadingImage") : t("changeImage")}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveLogo}
                              disabled={isLoading || isUploadingLogo}
                              className="text-destructive hover:text-destructive/90"
                            >
                              {t("removeImage")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => document.getElementById("logo-upload-panel")?.click()}
                          disabled={isLoading || isUploadingLogo}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {isUploadingLogo ? t("uploadingImage") : t("uploadImage")}
                        </Button>
                      )}
                      <input
                        id="logo-upload-panel"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={isLoading || isUploadingLogo}
                      />
                    </div>

                    {/* Hero Image */}
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("heroImage")}
                      </label>
                      {heroImageUrl ? (
                        <div className="flex items-start gap-4">
                          <div className="relative w-40 h-24 border border-border rounded-lg overflow-hidden bg-muted">
                            <img
                              src={heroImageUrl}
                              alt="Hero image"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => document.getElementById("hero-upload-panel")?.click()}
                              disabled={isLoading || isUploadingHero}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {isUploadingHero ? t("uploadingImage") : t("changeImage")}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveHero}
                              disabled={isLoading || isUploadingHero}
                              className="text-destructive hover:text-destructive/90"
                            >
                              {t("removeImage")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => document.getElementById("hero-upload-panel")?.click()}
                          disabled={isLoading || isUploadingHero}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {isUploadingHero ? t("uploadingImage") : t("uploadImage")}
                        </Button>
                      )}
                      <input
                        id="hero-upload-panel"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleHeroUpload}
                        disabled={isLoading || isUploadingHero}
                      />
                    </div>

                    {/* Accent Color */}
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("accentColor")}
                      </label>
                      <div className="flex gap-3 items-center flex-wrap">
                        <div className="flex gap-2">
                          {["#F97316", "#EF4444", "#8B5CF6", "#10B981", "#3B82F6", "#F59E0B"].map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setAccentColor(color)}
                              className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                              style={{
                                backgroundColor: color,
                                borderColor: accentColor === color ? "hsl(var(--foreground))" : "transparent",
                              }}
                              title={color}
                            />
                          ))}
                        </div>
                        <InlineInput
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          placeholder="#F97316"
                          className="max-w-[100px]"
                          disabled={isLoading}
                          displayClassName="text-sm font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ================================================================
                Bottom Action Bar
                ================================================================ */}
            <div className="border-t border-border px-6 py-4 bg-background">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* Left side: Main actions */}
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "h-10 px-5 rounded-xl font-medium",
                      "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                  >
                    {justSaved ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        {tCommon("saved")}
                      </>
                    ) : isLoading ? (
                      <span className="animate-pulse">
                        {isEditing ? tCommon("saving") : tCommon("creating")}
                      </span>
                    ) : isEditing ? (
                      tCommon("save")
                    ) : (
                      t("createGigPackButton")
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {tCommon("cancel")}
                  </Button>
                </div>

              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

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
    </>
  );
}

export default GigEditorPanel;
