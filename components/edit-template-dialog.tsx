"use client";

import { useState, useEffect } from "react";
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
import { updateUserTemplate } from "@/lib/userTemplates";
import { UserTemplate, GigPackTemplateDefaultValues, SetlistSection, PackingChecklistItem, GigPackTheme, PosterSkin } from "@/lib/types";
import { Loader2, Pencil, ChevronDown, ChevronRight } from "lucide-react";
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

interface EditTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: UserTemplate | null;
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

export function EditTemplateDialog({
  open,
  onOpenChange,
  template,
  onSuccess,
}: EditTemplateDialogProps) {
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
  // Theme is now always minimal for unified design
  const [accentColor, setAccentColor] = useState("");
  const [posterSkin, setPosterSkin] = useState<PosterSkin>("paper");
  const [setlistStructured, setSetlistStructured] = useState<SetlistSection[]>([]);
  const [packingChecklist, setPackingChecklist] = useState<PackingChecklistItem[]>([]);

  const [isSaving, setIsSaving] = useState(false);

  // Populate form when template changes
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || "");
      setIcon(template.icon || "📋");
      
      const dv = template.default_values;
      setTitle(dv.title || "");
      setDressCode(dv.dressCode || "");
      setBacklineNotes(dv.backlineNotes || "");
      setParkingNotes(dv.parkingNotes || "");
      setPaymentNotes(dv.paymentNotes || "");
      // Theme is now always minimal for unified design
      setAccentColor(dv.accentColor || "");
      setPosterSkin(dv.posterSkin || "paper");
      setSetlistStructured(dv.setlistStructured || []);
      setPackingChecklist(dv.packingChecklist || []);
    }
  }, [template]);

  const handleSave = async () => {
    if (!template) return;
    
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
      // Always use minimal theme for unified design
      defaultValues.theme = "minimal";
      if (accentColor.trim()) defaultValues.accentColor = accentColor.trim();
      if (posterSkin) defaultValues.posterSkin = posterSkin;
      if (setlistStructured.length > 0) defaultValues.setlistStructured = setlistStructured;
      if (packingChecklist.length > 0) defaultValues.packingChecklist = packingChecklist;

      const { error } = await updateUserTemplate(template.id, {
        name: name.trim(),
        description: description.trim() || null,
        icon,
        default_values: defaultValues,
      });

      if (error) {
        throw error;
      }

      toast({
        title: t("templateUpdated"),
        description: t("templateUpdatedDescription"),
        duration: 3000,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating template:", error);
      toast({
        title: tCommon("error"),
        description: t("templateUpdateError"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onOpenChange(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            {t("editTemplate")}
          </DialogTitle>
          <DialogDescription>
            {t("editTemplateDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Metadata */}
          <Card className="border-2">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTemplateName">{t("templateName")} *</Label>
                <Input
                  id="editTemplateName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("templateNamePlaceholder")}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editTemplateDescription">{t("templateDescription")}</Label>
                <Textarea
                  id="editTemplateDescription"
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
                <Label htmlFor="editDefaultTitle">{t("defaultTitle")}</Label>
                <Input
                  id="editDefaultTitle"
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
                  <Label htmlFor="editDefaultDressCode">{tGigpack("dressCode")}</Label>
                  <Input
                    id="editDefaultDressCode"
                    value={dressCode}
                    onChange={(e) => setDressCode(e.target.value)}
                    placeholder={tGigpack("dressCodePlaceholder")}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editDefaultBackline">{tGigpack("backlineNotes")}</Label>
                  <Textarea
                    id="editDefaultBackline"
                    value={backlineNotes}
                    onChange={(e) => setBacklineNotes(e.target.value)}
                    placeholder={tGigpack("backlineNotesPlaceholder")}
                    rows={2}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editDefaultParking">{tGigpack("parkingNotes")}</Label>
                  <Textarea
                    id="editDefaultParking"
                    value={parkingNotes}
                    onChange={(e) => setParkingNotes(e.target.value)}
                    placeholder={tGigpack("parkingNotesPlaceholder")}
                    rows={2}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editDefaultPayment">{tGigpack("paymentNotes")}</Label>
                  <Textarea
                    id="editDefaultPayment"
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
                  <Label>{tGigpack("theme")}</Label>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>Modern minimal design (all templates use this unified layout)</span>
                    </div>
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
              tCommon("save")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

