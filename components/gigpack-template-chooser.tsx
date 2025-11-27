"use client";

import { GIGPACK_TEMPLATES, GigPackTemplate } from "@/lib/gigpackTemplates";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { HandDrawnSquiggle } from "./hand-drawn/accents";

interface GigPackTemplateChooserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBlank: () => void;
  onSelectTemplate: (template: GigPackTemplate) => void;
}

export function GigPackTemplateChooser({
  open,
  onOpenChange,
  onSelectBlank,
  onSelectTemplate,
}: GigPackTemplateChooserProps) {
  const t = useTranslations("templates");
  const tCommon = useTranslations("common");
  
  console.log('GigPackTemplateChooser rendered, open:', open);

  return (
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

          {/* Template Options */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>{t("orStartFromTemplate")}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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

          {/* Footer Actions */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {tCommon("cancel")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

