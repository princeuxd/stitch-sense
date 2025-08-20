import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { extractStoragePath, getSignedUrl } from '@/lib/storage';

export interface ClothingItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  color_primary?: string;
  color_secondary?: string;
  pattern?: string;
  material?: string;
  season: string[];
  occasions: string[];
  size?: string;
  purchase_price?: number;
  purchase_date?: string;
  wear_count: number;
  last_worn?: string;
  favorite: boolean;
  notes?: string;
  front_image_url?: string;
  back_image_url?: string;
  ai_description?: string;
  ai_attributes?: any;
  style_tags: string[];
  created_at: string;
  updated_at: string;
}

export const useClothingItems = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Generate signed URLs for images
      const itemsWithSignedUrls = await Promise.all(
        (data || []).map(async (item) => {
          const updatedItem = { ...item };
          
          // Generate signed URL for front image
          if (item.front_image_url) {
            const frontPath = extractStoragePath(item.front_image_url);
            if (frontPath) {
              const signedUrl = await getSignedUrl(frontPath);
              if (signedUrl) {
                updatedItem.front_image_url = signedUrl;
              }
            }
          }
          
          // Generate signed URL for back image
          if (item.back_image_url) {
            const backPath = extractStoragePath(item.back_image_url);
            if (backPath) {
              const signedUrl = await getSignedUrl(backPath);
              if (signedUrl) {
                updatedItem.back_image_url = signedUrl;
              }
            }
          }
          
          return updatedItem;
        })
      );
      
      setItems(itemsWithSignedUrls);
    } catch (err) {
      console.error('Error fetching clothing items:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load clothing items';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (itemId: string) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const { error } = await supabase
        .from('clothing_items')
        .update({ favorite: !item.favorite })
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, favorite: !item.favorite }
          : item
      ));

      toast({
        title: item.favorite ? "Removed from favorites" : "Added to favorites",
        description: `${item.name} has been ${item.favorite ? 'removed from' : 'added to'} your favorites.`,
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      });
    }
  };

  const incrementWearCount = async (itemId: string) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('clothing_items')
        .update({ 
          wear_count: item.wear_count + 1,
          last_worn: today
        })
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, wear_count: item.wear_count + 1, last_worn: today }
          : item
      ));

      toast({
        title: "Marked as worn!",
        description: `${item.name} wear count updated.`,
      });
    } catch (err) {
      console.error('Error updating wear count:', err);
      toast({
        title: "Error",
        description: "Failed to update wear count.",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('clothing_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== itemId));
      
      toast({
        title: "Item deleted",
        description: "The clothing item has been removed from your wardrobe.",
      });
    } catch (err) {
      console.error('Error deleting item:', err);
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  return {
    items,
    loading,
    error,
    fetchItems,
    toggleFavorite,
    incrementWearCount,
    deleteItem,
  };
};