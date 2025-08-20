import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Shirt, X } from "lucide-react";

interface AddOutfitDialogProps {
  onOutfitAdded: () => void;
}

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  front_image_url: string | null;
  color_primary: string | null;
}

interface OutfitFormData {
  name: string;
  occasion: string;
  season: string[];
  notes: string;
  rating: string;
  selectedItems: string[];
}

const occasions = ["Casual", "Business", "Formal", "Sport", "Party", "Date", "Travel"];
const seasons = ["Spring", "Summer", "Fall", "Winter"];

export const AddOutfitDialog = ({ onOutfitAdded }: AddOutfitDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [formData, setFormData] = useState<OutfitFormData>({
    name: "",
    occasion: "",
    season: [],
    notes: "",
    rating: "",
    selectedItems: [],
  });

  useEffect(() => {
    if (open && user) {
      fetchClothingItems();
    }
  }, [open, user]);

  const fetchClothingItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .select('id, name, category, front_image_url, color_primary')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClothingItems(data || []);
    } catch (error) {
      console.error('Error fetching clothing items:', error);
      toast({
        title: "Error",
        description: "Failed to load clothing items.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof OutfitFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSeason = (season: string) => {
    setFormData(prev => ({
      ...prev,
      season: prev.season.includes(season)
        ? prev.season.filter(s => s !== season)
        : [...prev.season, season]
    }));
  };

  const toggleItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(itemId)
        ? prev.selectedItems.filter(id => id !== itemId)
        : [...prev.selectedItems, itemId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.selectedItems.length === 0) {
      toast({
        title: "Missing required fields",
        description: "Please provide a name and select at least one clothing item.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create the outfit
      const { data: outfit, error: outfitError } = await supabase
        .from('outfits')
        .insert({
          user_id: user.id,
          name: formData.name,
          occasion: formData.occasion || null,
          season: formData.season,
          notes: formData.notes || null,
          rating: formData.rating ? parseInt(formData.rating) : null,
        })
        .select()
        .single();

      if (outfitError) throw outfitError;

      // Add outfit items
      const outfitItems = formData.selectedItems.map(itemId => ({
        outfit_id: outfit.id,
        item_id: itemId,
      }));

      const { error: itemsError } = await supabase
        .from('outfit_items')
        .insert(outfitItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Outfit created successfully!",
        description: "Your new outfit has been added to your collection.",
      });

      // Reset form
      setFormData({
        name: "",
        occasion: "",
        season: [],
        notes: "",
        rating: "",
        selectedItems: [],
      });
      setOpen(false);
      onOutfitAdded();
    } catch (error) {
      console.error('Error creating outfit:', error);
      toast({
        title: "Failed to create outfit",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getItemsByCategory = (category: string) => {
    return clothingItems.filter(item => item.category === category);
  };

  const categories = ["tops", "bottoms", "dresses", "outerwear", "shoes", "accessories"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Outfit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Outfit</DialogTitle>
          <DialogDescription>
            Combine clothing items from your wardrobe to create a new outfit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Outfit Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Business Meeting Look"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occasion">Occasion</Label>
              <Select
                value={formData.occasion}
                onValueChange={(value) => handleInputChange('occasion', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  {occasions.map(occasion => (
                    <SelectItem key={occasion} value={occasion.toLowerCase()}>
                      {occasion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Select
                value={formData.rating}
                onValueChange={(value) => handleInputChange('rating', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rate this outfit" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} Star{rating !== 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Seasons</Label>
              <div className="flex flex-wrap gap-2">
                {seasons.map(season => (
                  <Badge
                    key={season}
                    variant={formData.season.includes(season) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleSeason(season)}
                  >
                    {season}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Clothing Items Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select Clothing Items *</Label>
              <div className="text-sm text-muted-foreground">
                {formData.selectedItems.length} item{formData.selectedItems.length !== 1 ? 's' : ''} selected
              </div>
            </div>

            {clothingItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shirt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No clothing items found. Add items to your wardrobe first.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {categories.map(category => {
                  const categoryItems = getItemsByCategory(category);
                  if (categoryItems.length === 0) return null;

                  return (
                    <div key={category} className="space-y-3">
                      <h4 className="font-medium capitalize">{category}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {categoryItems.map(item => (
                          <div
                            key={item.id}
                            className={`relative rounded-lg border-2 cursor-pointer transition-all ${
                              formData.selectedItems.includes(item.id)
                                ? 'border-primary bg-primary/5'
                                : 'border-muted hover:border-border'
                            }`}
                            onClick={() => toggleItem(item.id)}
                          >
                            <div className="aspect-square rounded-md overflow-hidden">
                              {item.front_image_url ? (
                                <img
                                  src={item.front_image_url}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <Shirt className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="p-2">
                              <p className="text-xs font-medium truncate">{item.name}</p>
                              {item.color_primary && (
                                <p className="text-xs text-muted-foreground">{item.color_primary}</p>
                              )}
                            </div>
                            <Checkbox
                              checked={formData.selectedItems.includes(item.id)}
                              className="absolute top-2 right-2 bg-white shadow-sm"
                              onCheckedChange={() => {}}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any notes about this outfit, styling tips, occasions to wear it..."
              className="min-h-[80px]"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || formData.selectedItems.length === 0}>
              {loading ? "Creating..." : "Create Outfit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};