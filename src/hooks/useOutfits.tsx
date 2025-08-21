import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { extractStoragePath, getSignedUrl } from "@/lib/storage";

export interface OutfitItem {
  clothing_items: {
    id: string;
    name: string;
    front_image_url: string | null;
    back_image_url: string | null;
    category: string;
    color_primary: string | null;
    brand: string | null;
  };
}

export interface Outfit {
  id: string;
  name: string;
  occasion: string | null;
  season: string[];
  notes: string | null;
  rating: number | null;
  times_worn: number;
  created_at: string;
  outfit_items: OutfitItem[];
}

export const useOutfits = () => {
  const { user } = useAuth();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOutfits = useCallback(async () => {
    if (!user) {
      setOutfits([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Try a simpler approach - fetch outfits first, then items
      const { data: outfitsData, error: outfitsError } = await supabase
        .from("outfits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (outfitsError) {
        console.error("Outfits fetch error:", outfitsError);
        throw outfitsError;
      }

      if (!outfitsData || outfitsData.length === 0) {
        setOutfits([]);
        return;
      }

      // Now fetch outfit items for each outfit
      const outfitsWithItems = await Promise.all(
        outfitsData.map(async (outfit) => {
          const { data: outfitItemsData, error: itemsError } = await supabase
            .from("outfit_items")
            .select(
              `
              clothing_items (
                id,
                name,
                front_image_url,
                back_image_url,
                category,
                color_primary,
                brand
              )
            `
            )
            .eq("outfit_id", outfit.id);

          if (itemsError) {
            console.error(
              "Outfit items fetch error for outfit",
              outfit.id,
              ":",
              itemsError
            );
            return { ...outfit, outfit_items: [] };
          }

          // Process image URLs for clothing items
          const processedOutfitItems = await Promise.all(
            (outfitItemsData || []).map(async (outfitItem) => {
              const clothingItem = outfitItem.clothing_items;
              const updatedClothingItem = { ...clothingItem };

              // Generate signed URL for front image
              if (clothingItem.front_image_url) {
                const frontPath = extractStoragePath(
                  clothingItem.front_image_url
                );
                if (frontPath) {
                  const signedUrl = await getSignedUrl(frontPath);
                  if (signedUrl) {
                    updatedClothingItem.front_image_url = signedUrl;
                  }
                }
              }

              // Generate signed URL for back image
              if (clothingItem.back_image_url) {
                const backPath = extractStoragePath(
                  clothingItem.back_image_url
                );
                if (backPath) {
                  const signedUrl = await getSignedUrl(backPath);
                  if (signedUrl) {
                    updatedClothingItem.back_image_url = signedUrl;
                  }
                }
              }

              return {
                ...outfitItem,
                clothing_items: updatedClothingItem,
              };
            })
          );

          return {
            ...outfit,
            outfit_items: processedOutfitItems,
          };
        })
      );

      setOutfits(outfitsWithItems);
    } catch (err) {
      console.error("Error fetching outfits:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load outfits";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteOutfit = async (outfitId: string) => {
    try {
      const { error } = await supabase
        .from("outfits")
        .delete()
        .eq("id", outfitId);

      if (error) throw error;

      setOutfits((prev) => prev.filter((outfit) => outfit.id !== outfitId));
      toast({
        title: "Outfit deleted",
        description: "The outfit has been removed from your collection.",
      });
    } catch (error) {
      console.error("Error deleting outfit:", error);
      toast({
        title: "Error",
        description: "Failed to delete outfit.",
        variant: "destructive",
      });
    }
  };

  const incrementWearCount = async (outfitId: string) => {
    try {
      const outfit = outfits.find((o) => o.id === outfitId);
      if (!outfit) return;

      const { error } = await supabase
        .from("outfits")
        .update({ times_worn: outfit.times_worn + 1 })
        .eq("id", outfitId);

      if (error) throw error;

      setOutfits((prev) =>
        prev.map((outfit) =>
          outfit.id === outfitId
            ? { ...outfit, times_worn: outfit.times_worn + 1 }
            : outfit
        )
      );

      toast({
        title: "Marked as worn!",
        description: "Outfit wear count updated.",
      });
    } catch (error) {
      console.error("Error updating wear count:", error);
      toast({
        title: "Error",
        description: "Failed to update wear count.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, [user, fetchOutfits]);

  return {
    outfits,
    loading,
    error,
    fetchOutfits,
    deleteOutfit,
    incrementWearCount,
  };
};
