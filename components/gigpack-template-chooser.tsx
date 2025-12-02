"use client";

import { useState } from "react";
import { GIGPACK_TEMPLATES, GigPackTemplate, userTemplateToGigPackTemplate } from "@/lib/gigpackTemplates";
import { UserTemplate } from "@/lib/types";
import { deleteUserTemplate } from "@/lib/userTemplates";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Sparkles, Plus, Pencil, Trash2, User, Loader2, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { HandDrawnSquiggle } from "./hand-drawn/accents";
import { TemplateBuilderDialog } from "./template-builder-dialog";
import { EditTemplateDialog } from "./edit-template-dialog";
import { useToast } from "@/hooks/use-toast";

interface GigPackTemplateChooserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBlank: () => void;
  onSelectTemplate: (template: GigPackTemplate) => void;
  userTemplates?: UserTemplate[];
  onUserTemplatesChange?: () => void;
  isLoadingUserTemplates?: boolean;
}

export function GigPackTemplateChooser({
  open,
  onOpenChange,
  onSelectBlank,
  onSelectTemplate,
  userTemplates = [],
  onUserTemplatesChange,
  isLoadingUserTemplates = false,
}: GigPackTemplateChooserProps) {
  const t = useTranslations("templates");
  const tCommon = useTranslations("common");
  const { toast } = useToast();

  // Dialog states
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<UserTemplate | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);
  const [builtInExpanded, setBuiltInExpanded] = useState(false);

  const handleCreateTemplate = () => {
    setBuilderOpen(true);
  };

  const handleEditTemplate = (template: UserTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTemplate(template);
    setEditDialogOpen(true);
  };

  const handleDeleteTemplate = async (template: UserTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.confirm(t("deleteTemplateConfirm", { name: template.name }))) {
      return;
    }

    setDeletingTemplateId(template.id);
    try {
      const { success, error } = await deleteUserTemplate(template.id);
      
      if (error || !success) {
        throw error || new Error("Failed to delete");
      }

      toast({
        title: t("templateDeleted"),
        description: t("templateDeletedDescription"),
        duration: 2000,
      });

      onUserTemplatesChange?.();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: tCommon("error"),
        description: t("templateDeleteError"),
        variant: "destructive",
      });
    } finally {
      setDeletingTemplateId(null);
    }
  };

  const handleSelectUserTemplate = (template: UserTemplate) => {
    const gigPackTemplate = userTemplateToGigPackTemplate(template);
    onSelectTemplate(gigPackTemplate);
  };

  const handleBuilderSuccess = () => {
    onUserTemplatesChange?.();
  };

  const handleEditSuccess = () => {
    setEditingTemplate(null);
    onUserTemplatesChange?.();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <HandDrawnSquiggle className="text-primary" />
              <DialogTitle className="text-3xl">
                {t("howToStart")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-base">
              {t("howToStartDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Blank Option */}
            <Card 
              className="border-2 hover:border-primary/40 transition-colors cursor-pointer group"
              onClick={onSelectBlank}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-2xl">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {t("blankGigPack")}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {t("blankGigPackDescription")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* User Templates Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <User className="h-4 w-4" />
                  <span>{t("myTemplates")}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateTemplate}
                  className="h-8"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  {t("createTemplate")}
                </Button>
              </div>

              {isLoadingUserTemplates ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tCommon("loading")}
                </div>
              ) : userTemplates.length === 0 ? (
                <Card className="border-2 border-dashed bg-muted/20">
                  <CardHeader className="py-8">
                    <div className="text-center text-muted-foreground">
                      <p className="text-sm">{t("noCustomTemplates")}</p>
                      <p className="text-xs mt-1">{t("noCustomTemplatesHint")}</p>
                    </div>
                  </CardHeader>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {userTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className="border-2 hover:border-primary/40 transition-colors cursor-pointer group relative"
                      onClick={() => handleSelectUserTemplate(template)}
                    >
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                            {template.icon || "📋"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                              {template.name}
                            </CardTitle>
                            {template.description && (
                              <CardDescription className="mt-1 text-sm line-clamp-2">
                                {template.description}
                              </CardDescription>
                            )}
                          </div>
                          {/* Action buttons */}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => handleEditTemplate(template, e)}
                              disabled={deletingTemplateId === template.id}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => handleDeleteTemplate(template, e)}
                              disabled={deletingTemplateId === template.id}
                            >
                              {deletingTemplateId === template.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Built-in Template Options - Collapsible */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setBuiltInExpanded(!builtInExpanded)}
                className="flex items-center justify-between w-full group"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                  <Sparkles className="h-4 w-4" />
                  <span>{t("builtInTemplates")}</span>
                  <span className="text-xs font-normal normal-case">({GIGPACK_TEMPLATES.length})</span>
                </div>
                <ChevronDown 
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                    builtInExpanded ? "rotate-180" : ""
                  }`} 
                />
              </button>

              <div
                className={`grid transition-all duration-200 ease-in-out ${
                  builtInExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="grid gap-4 sm:grid-cols-2 pt-1">
                    {GIGPACK_TEMPLATES.map((template) => (
                      <Card
                        key={template.id}
                        className="border-2 hover:border-primary/40 transition-colors cursor-pointer group"
                        onClick={() => onSelectTemplate(template)}
                      >
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                              {template.icon}
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {template.label}
                              </CardTitle>
                              <CardDescription className="mt-1 text-sm">
                                {template.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {tCommon("cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Builder Dialog */}
      <TemplateBuilderDialog
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        onSuccess={handleBuilderSuccess}
      />

      {/* Edit Template Dialog */}
      <EditTemplateDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        template={editingTemplate}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
