"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { GigPackQr } from "@/components/gigpack-qr";
import { getPublicGigPackUrl, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface GigPackShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gigPack: {
    title: string;
    band_name: string | null;
    date: string | null;
    venue_name: string | null;
    public_slug: string;
  };
  locale?: string;
}

export function GigPackShareDialog({
  open,
  onOpenChange,
  gigPack,
  locale = "en",
}: GigPackShareDialogProps) {
  const { toast } = useToast();
  const t = useTranslations("share");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage1, setCopiedMessage1] = useState(false);
  const [copiedMessage2, setCopiedMessage2] = useState(false);

  const publicUrl = getPublicGigPackUrl(gigPack.public_slug);

  const copyToClipboard = async (
    text: string,
    setCopied: (value: boolean) => void,
    successMessage: string
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: t("copied"),
        description: successMessage,
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: t("copyError"),
        description: t("copyErrorDescription"),
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Generate prewritten messages
  const dateStr = gigPack.date ? formatDate(gigPack.date, locale) : t("upcoming");
  const venueStr = gigPack.venue_name || t("theVenue");

  const message1 = t("message1", {
    title: gigPack.title,
    url: publicUrl,
  });

  const message2 = t("message2", {
    title: gigPack.title,
    date: dateStr,
    venue: venueStr,
    url: publicUrl,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t("title")}</DialogTitle>
          <DialogDescription className="text-base">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Public Link Section */}
          <div className="space-y-3">
            <Label htmlFor="public-link" className="text-base font-semibold">
              {t("publicLink")}
            </Label>
            <div className="flex gap-2">
              <Input
                id="public-link"
                value={publicUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={() =>
                  copyToClipboard(publicUrl, setCopiedLink, t("linkCopied"))
                }
                variant="outline"
                className="flex-shrink-0"
              >
                {copiedLink ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copiedLink ? t("copiedButton") : t("copyButton")}
              </Button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t("qrCode")}</Label>
            <p className="text-sm text-muted-foreground">{t("qrCodeHint")}</p>
            <div className="flex justify-center">
              <GigPackQr url={publicUrl} size={200} />
            </div>
          </div>

          {/* Prewritten Messages Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">
                {t("prewrittenMessages")}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t("prewrittenMessagesHint")}
              </p>
            </div>

            {/* Message 1 - Band Chat Style */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {t("message1Label")}
                </Label>
                <Button
                  onClick={() =>
                    copyToClipboard(
                      message1,
                      setCopiedMessage1,
                      t("messageCopied")
                    )
                  }
                  variant="ghost"
                  size="sm"
                >
                  {copiedMessage1 ? (
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {copiedMessage1 ? t("copiedButton") : t("copyMessage")}
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg border text-sm whitespace-pre-wrap select-all">
                {message1}
              </div>
            </div>

            {/* Message 2 - Email Style */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {t("message2Label")}
                </Label>
                <Button
                  onClick={() =>
                    copyToClipboard(
                      message2,
                      setCopiedMessage2,
                      t("messageCopied")
                    )
                  }
                  variant="ghost"
                  size="sm"
                >
                  {copiedMessage2 ? (
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {copiedMessage2 ? t("copiedButton") : t("copyMessage")}
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg border text-sm whitespace-pre-wrap select-all">
                {message2}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

