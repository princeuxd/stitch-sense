import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { AddOutfitDialog } from "./AddOutfitDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Shirt, Calendar, Star, MoreVertical, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Outfit {
  id: string;
  name: string;
  occasion: string | null;
  season: string[];
  notes: string | null;
  rating: number | null;
  times_worn: number;
  created_at: string;
  outfit_items: {
    clothing_items: {
      id: string;
      name: string;
      front_image_url: string | null;
      category: string;
    };
  }[];
}

export const OutfitGrid = () => {
  const { user } = useAuth();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOutfits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('outfits')
        .select(`
          *,
          outfit_items (
            clothing_items (
              id,
              name,
              front_image_url,
              category
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOutfits(data || []);
    } catch (error) {
      console.error('Error fetching outfits:', error);
      toast({
        title: "Error",
        description: "Failed to load outfits.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, [user]);

  const deleteOutfit = async (outfitId: string) => {
    try {
      const { error } = await supabase
        .from('outfits')
        .delete()
        .eq('id', outfitId);

      if (error) throw error;

      setOutfits(prev => prev.filter(outfit => outfit.id !== outfitId));
      toast({
        title: "Outfit deleted",
        description: "The outfit has been removed from your collection.",
      });
    } catch (error) {
      console.error('Error deleting outfit:', error);
      toast({
        title: "Error",
        description: "Failed to delete outfit.",
        variant: "destructive",
      });
    }
  };

  const incrementWearCount = async (outfitId: string) => {
    try {
      const outfit = outfits.find(o => o.id === outfitId);
      if (!outfit) return;

      const { error } = await supabase
        .from('outfits')
        .update({ times_worn: outfit.times_worn + 1 })
        .eq('id', outfitId);

      if (error) throw error;

      setOutfits(prev => prev.map(outfit => 
        outfit.id === outfitId 
          ? { ...outfit, times_worn: outfit.times_worn + 1 }
          : outfit
      ));

      toast({
        title: "Marked as worn!",
        description: "Outfit wear count updated.",
      });
    } catch (error) {
      console.error('Error updating wear count:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (outfits.length === 0) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
          <Shirt className="w-12 h-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">No outfits yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Create your first outfit by combining clothing items from your wardrobe.
          </p>
        </div>
        <AddOutfitDialog onOutfitAdded={fetchOutfits} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Your Outfits</h2>
          <p className="text-muted-foreground">
            {outfits.length} outfit{outfits.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>
        <AddOutfitDialog onOutfitAdded={fetchOutfits} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outfits.map((outfit) => (
          <Card key={outfit.id} className="card-clothing hover:shadow-elegant transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg leading-tight">{outfit.name}</CardTitle>
                  {outfit.occasion && (
                    <Badge variant="secondary" className="text-xs">
                      {outfit.occasion}
                    </Badge>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => deleteOutfit(outfit.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Outfit Items Preview */}
              <div className="grid grid-cols-3 gap-2">
                {outfit.outfit_items.slice(0, 3).map((item, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    {item.clothing_items.front_image_url ? (
                      <img
                        src={item.clothing_items.front_image_url}
                        alt={item.clothing_items.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Shirt className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {outfit.outfit_items.length > 3 && (
                  <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      +{outfit.outfit_items.length - 3}
                    </span>
                  </div>
                )}
              </div>

              {/* Outfit Details */}
              <div className="space-y-2">
                {outfit.season.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {outfit.season.map(season => (
                      <Badge key={season} variant="outline" className="text-xs">
                        {season}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Worn {outfit.times_worn} times</span>
                  </div>
                  {outfit.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current text-yellow-500" />
                      <span>{outfit.rating}/5</span>
                    </div>
                  )}
                </div>

                {outfit.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {outfit.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => incrementWearCount(outfit.id)}
                >
                  Mark as Worn
                </Button>
                <Button size="sm" className="flex-1">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};