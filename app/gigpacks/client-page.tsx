"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GigPackList } from "@/components/gigpack-list";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { HandDrawnSquiggle, HandDrawnStar } from "@/components/hand-drawn/accents";
import { GigPackForm } from "@/components/gigpack-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { GigPack } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

export type GigPackListItem = {
  id: string;
  title: string;
  band_name: string | null;
  date: string | null;
  call_time: string | null;
  venue_name: string | null;
  public_slug: string;
  updated_at: string;
  created_at: string;
};

export type GigPackSheetState =
  | { mode: "create" }
  | { mode: "edit"; gigPackId: string };

interface GigPacksClientPageProps {
  initialGigPacks: GigPackListItem[];
  initialSheetState?: GigPackSheetState | null;
  initialEditingGigPack?: GigPack | null;
}

const sortGigPacks = (packs: GigPackListItem[]) => {
  return [...packs].sort((a, b) => {
    if (a.date && b.date && a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

const toListItem = (pack: GigPack): GigPackListItem => ({
  id: pack.id,
  title: pack.title,
  band_name: pack.band_name,
  date: pack.date,
  call_time: pack.call_time,
  venue_name: pack.venue_name,
  public_slug: pack.public_slug,
  updated_at: pack.updated_at,
  created_at: pack.created_at,
});

export function GigPacksClientPage({
  initialGigPacks,
  initialSheetState = null,
  initialEditingGigPack = null,
}: GigPacksClientPageProps) {
  const { toast } = useToast();
  const [gigPacks, setGigPacks] = useState<GigPackListItem[]>(() =>
    sortGigPacks(initialGigPacks),
  );
  const [activeSheet, setActiveSheet] = useState<GigPackSheetState | null>(
    initialSheetState,
  );
  const [editingGigPack, setEditingGigPack] = useState<GigPack | null>(
    initialEditingGigPack,
  );
  const [isSheetLoading, setIsSheetLoading] = useState(
    initialSheetState?.mode === "edit" && !initialEditingGigPack,
  );

  const closeSheet = useCallback(() => {
    setActiveSheet(null);
    setEditingGigPack(null);
    setIsSheetLoading(false);
  }, []);

  const loadGigPack = useCallback(
    async (gigPackId: string) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("gig_packs")
        .select("*")
        .eq("id", gigPackId)
        .single();

      if (error || !data) {
        toast({
          title: "Unable to load Gig Pack",
          description: "Please try again",
          variant: "destructive",
        });
        closeSheet();
      } else {
        setEditingGigPack(data);
      }
      setIsSheetLoading(false);
    },
    [closeSheet, toast],
  );

  useEffect(() => {
    if (initialSheetState && typeof window !== "undefined") {
      window.history.replaceState(null, "", "/gigpacks");
    }
  }, [initialSheetState]);

  const openCreateSheet = () => {
    setEditingGigPack(null);
    setActiveSheet({ mode: "create" });
  };

  const openEditSheet = (gigPackId: string) => {
    setActiveSheet({ mode: "edit", gigPackId });
    if (editingGigPack?.id === gigPackId) {
      setIsSheetLoading(false);
      return;
    }
    setEditingGigPack(null);
    setIsSheetLoading(true);
    void loadGigPack(gigPackId);
  };

  const handleCreateSuccess = useCallback(
    (created: GigPack) => {
      setGigPacks((prev) => sortGigPacks([...prev, toListItem(created)]));
      closeSheet();
    },
    [closeSheet],
  );

  const handleUpdateSuccess = useCallback(
    (updated: GigPack) => {
      setGigPacks((prev) =>
        sortGigPacks(
          prev.map((pack) => (pack.id === updated.id ? toListItem(updated) : pack)),
        ),
      );
      closeSheet();
    },
    [closeSheet],
  );

  const handleDelete = useCallback(
    async (gigPackId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("gig_packs")
        .delete()
        .eq("id", gigPackId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete gig pack",
          variant: "destructive",
        });
        return;
      }

      setGigPacks((prev) => prev.filter((pack) => pack.id !== gigPackId));
      toast({
        title: "✓ Deleted",
        description: "Gig pack removed",
        duration: 2000,
      });
    },
    [toast],
  );

  const isEditMode = activeSheet?.mode === "edit";

  return (
    <>
      <div className="space-y-8">
        {/* Dashboard Header - Tour Book Vibe */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3 mb-2 relative">
              <HandDrawnSquiggle className="text-primary" />
              <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                Your Gigs
              </span>
              <HandDrawnStar className="text-primary/40 absolute -top-2 -right-6 w-4 h-4 hand-drawn-float" style={{ animationDelay: '0s' }} />
              <HandDrawnStar className="text-primary/30 absolute -bottom-1 -right-10 w-3 h-3 hand-drawn-float" style={{ animationDelay: '2s' }} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              GigPack Dashboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Create shareable gig pages for your bandmates—everything they need in one place.
            </p>
          </div>
          <Button 
            onClick={openCreateSheet} 
            size="lg"
            className="sm:w-auto shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create GigPack
          </Button>
        </div>

        <GigPackList
          gigPacks={gigPacks}
          onEdit={openEditSheet}
          onCreate={openCreateSheet}
          onDelete={handleDelete}
        />
      </div>

      <Sheet
        open={!!activeSheet}
        onOpenChange={(open) => {
          if (!open) {
            closeSheet();
          }
        }}
      >
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl border-l-4 border-primary/30">
          <SheetHeader className="space-y-3 pb-6 border-b-2 border-dashed">
            <div className="flex items-center gap-3">
              <HandDrawnSquiggle className="text-primary" />
              <SheetTitle className="text-3xl">
                {isEditMode ? "Edit GigPack" : "Create GigPack"}
              </SheetTitle>
            </div>
            {isEditMode && editingGigPack && (
              <div className="text-sm space-y-1 bg-muted/50 p-3 rounded-lg border">
                <p className="font-semibold text-foreground">{editingGigPack.title}</p>
                {editingGigPack.date && (
                  <p className="text-muted-foreground">
                    {formatDate(editingGigPack.date)}
                  </p>
                )}
              </div>
            )}
            <SheetDescription className="text-base">
              {isEditMode
                ? "Make updates and save without leaving the dashboard."
                : "Fill in the details to create a new gig pack for your band."}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 pb-10">
            {isEditMode ? (
              isSheetLoading || !editingGigPack ? (
                <SheetLoadingState />
              ) : (
                <GigPackForm
                  gigPack={editingGigPack}
                  onCancel={closeSheet}
                  onUpdateSuccess={handleUpdateSuccess}
                  onDelete={async (gigPackId) => {
                    await handleDelete(gigPackId);
                    closeSheet();
                  }}
                />
              )
            ) : (
              <GigPackForm
                onCancel={closeSheet}
                onCreateSuccess={handleCreateSuccess}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function SheetLoadingState() {
  return (
    <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
      <Loader2 className="mb-4 h-6 w-6 animate-spin" />
      Loading gig pack...
    </div>
  );
}

