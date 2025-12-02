"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createUserTemplate } from "@/lib/userTemplates";
import { GigPackTemplateDefaultValues, SetlistSection, PackingChecklistItem, GigPackTheme, PosterSkin } from "@/lib/types";
import { Loader2, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { SetlistEditor } from "@/components/setlist-editor";
import { PackingChecklistEditor } from "@/components/packing-checklist-editor";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";

// Common emoji icons for templates
const TEMPLATE_ICONS = [
  "📋", "🎵", "🎸", "🎹", "🥁", "🎤", "🎺", "🎻",
  "🎭", "💍", "🎪", "✨", "🔥", "🍺", "🎙️", "🏢",
  "🌟", "🎉", "🎊", "💫", "🎯", "🚀", "⚡", "🌙",
];

interface TemplateBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface CollapsibleFieldGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleFieldGroup({ title, children, defaultOpen = false }: CollapsibleFieldGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-sm">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function TemplateBuilderDialog({
  open,
  onOpenChange,
  onSuccess,
}: TemplateBuilderDialogProps) {
  const t = useTranslations("templates");
  const tGigpack = useTranslations("gigpack");
  const tCommon = useTranslations("common");
  const { toast } = useToast();

  // Template metadata
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📋");

  // Template default values
  const [title, setTitle] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [backlineNotes, setBacklineNotes] = useState("");
  const [parkingNotes, setParkingNotes] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [theme, setTheme] = useState<GigPackTheme>("minimal");
  const [accentColor, setAccentColor] = useState("");
  const [posterSkin, setPosterSkin] = useState<PosterSkin>("paper");
  const [setlistStructured, setSetlistStructured] = useState<SetlistSection[]>([]);
  const [packingChecklist, setPackingChecklist] = useState<PackingChecklistItem[]>([]);

  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setIcon("📋");
    setTitle("");
    setDressCode("");
    setBacklineNotes("");
    setParkingNotes("");
    setPaymentNotes("");
    setTheme("minimal");
    setAccentColor("");
    setPosterSkin("paper");
    setSetlistStructured([]);
    setPackingChecklist([]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: tCommon("error"),
        description: t("templateNameRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const defaultValues: GigPackTemplateDefaultValues = {};

      // Only include non-empty values
      if (title.trim()) defaultValues.title = title.trim();
      if (dressCode.trim()) defaultValues.dressCode = dressCode.trim();
      if (backlineNotes.trim()) defaultValues.backlineNotes = backlineNotes.trim();
      if (parkingNotes.trim()) defaultValues.parkingNotes = parkingNotes.trim();
      if (paymentNotes.trim()) defaultValues.paymentNotes = paymentNotes.trim();
      if (theme) defaultValues.theme = theme;
      if (accentColor.trim()) defaultValues.accentColor = accentColor.trim();
      if (posterSkin) defaultValues.posterSkin = posterSkin;
      if (setlistStructured.length > 0) defaultValues.setlistStructured = setlistStructured;
      if (packingChecklist.length > 0) defaultValues.packingChecklist = packingChecklist;

      const { data, error } = await createUserTemplate(
        name.trim(),
        defaultValues,
        description.trim() || undefined,
        icon
      );

      if (error) {
        throw error;
      }

      toast({
        title: t("templateSaved"),
        description: t("templateSavedDescription", { name: data?.name ?? "" }),
        duration: 3000,
      });

      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: tCommon("error"),
        description: t("templateSaveError"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t("createTemplate")}
          </DialogTitle>
          <DialogDescription>
            {t("createTemplateDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Metadata */}
          <Card className="border-2">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">{t("templateName")} *</Label>
                <Input
                  id="templateName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("templateNamePlaceholder")}
                  disabled={isSaving}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="templateDescription">{t("templateDescription")}</Label>
                <Textarea
                  id="templateDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("templateDescriptionPlaceholder")}
                  rows={2}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("templateIcon")}</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30">
                  {TEMPLATE_ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      disabled={isSaving}
                      className={`
                        w-9 h-9 flex items-center justify-center text-lg rounded-lg 
                        transition-all hover:scale-110
                        ${icon === emoji 
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2" 
                          : "bg-background hover:bg-accent"
                        }
                      `}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Default Values */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              {t("defaultValues")}
            </p>

            {/* Core Info */}
            <CollapsibleFieldGroup title={t("titleAndBasics")} defaultOpen={true}>
              <div className="space-y-2">
                <Label htmlFor="defaultTitle">{t("defaultTitle")}</Label>
                <Input
                  id="defaultTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("defaultTitlePlaceholder")}
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground">
                  {t("defaultTitleHint")}
                </p>
              </div>
            </CollapsibleFieldGroup>

            {/* Logistics */}
            <CollapsibleFieldGroup title={tGigpack("logistics")}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultDressCode">{tGigpack("dressCode")}</Label>
                  <Input
                    id="defaultDressCode"
                    value={dressCode}
                    onChange={(e) => setDressCode(e.target.value)}
                    placeholder={tGigpack("dressCodePlaceholder")}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultBackline">{tGigpack("backlineNotes")}</Label>
                  <Textarea
                    id="defaultBackline"
                    value={backlineNotes}
                    onChange={(e) => setBacklineNotes(e.target.value)}
                    placeholder={tGigpack("backlineNotesPlaceholder")}
                    rows={2}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultParking">{tGigpack("parkingNotes")}</Label>
                  <Textarea
                    id="defaultParking"
                    value={parkingNotes}
                    onChange={(e) => setParkingNotes(e.target.value)}
                    placeholder={tGigpack("parkingNotesPlaceholder")}
                    rows={2}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultPayment">{tGigpack("paymentNotes")}</Label>
                  <Textarea
                    id="defaultPayment"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder={tGigpack("paymentNotesPlaceholder")}
                    rows={2}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </CollapsibleFieldGroup>

            {/* Design */}
            <CollapsibleFieldGroup title={tGigpack("design")}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{tGigpack("themeMinimal")}</Label>
                  <RadioGroup value={theme} onValueChange={(value) => setTheme(value as GigPackTheme)}>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="minimal" id="builder-theme-minimal" />
                        <Label htmlFor="builder-theme-minimal" className="cursor-pointer">
                          {tGigpack("themeMinimal")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="vintage_poster" id="builder-theme-vintage" />
                        <Label htmlFor="builder-theme-vintage" className="cursor-pointer">
                          {tGigpack("themeVintagePoster")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="social_card" id="builder-theme-social" />
                        <Label htmlFor="builder-theme-social" className="cursor-pointer">
                          {tGigpack("themeSocialCard")}
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>{tGigpack("accentColor")}</Label>
                  <div className="flex gap-3 items-center">
                    <div className="flex gap-2">
                      {["#F97316", "#EF4444", "#8B5CF6", "#10B981", "#3B82F6", "#F59E0B"].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setAccentColor(color)}
                          disabled={isSaving}
                          className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                          style={{
                            backgroundColor: color,
                            borderColor: accentColor === color ? "hsl(var(--primary))" : "transparent",
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                    <Input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="#F97316"
                      className="max-w-[120px]"
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>
            </CollapsibleFieldGroup>

            {/* Setlist Sections */}
            <CollapsibleFieldGroup title={tGigpack("musicSetlist")}>
              <SetlistEditor
                value={setlistStructured}
                onChange={setSetlistStructured}
                disabled={isSaving}
              />
            </CollapsibleFieldGroup>

            {/* Packing Checklist */}
            <CollapsibleFieldGroup title={tGigpack("packingChecklist")}>
              <PackingChecklistEditor
                value={packingChecklist}
                onChange={setPackingChecklist}
                disabled={isSaving}
              />
            </CollapsibleFieldGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tCommon("saving")}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {t("createTemplate")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

