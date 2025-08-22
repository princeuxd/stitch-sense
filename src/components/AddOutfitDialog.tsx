import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useClothingItems, ClothingItem } from "@/hooks/useClothingItems";
import {
  Plus,
  Shirt,
  X,
  Eye,
  EyeOff,
  Star,
  Calendar,
  Tag,
  Heart,
  MoreVertical,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OutfitForEditItemRef {
  clothing_items: { id: string };
}
interface OutfitForEdit {
  id: string;
  name: string;
  occasion: string | null;
  season: string[];
  notes: string | null;
  rating: number | null;
  outfit_items?: OutfitForEditItemRef[]; // when passed from list view
}

interface AddOutfitDialogProps {
  onOutfitAdded: () => void; // used for create (and kept for backward compat)
  preSelectedItems?: string[]; // used when creating from wardrobe
  // Edit-mode additions
  mode?: "create" | "edit";
  initialOutfit?: OutfitForEdit;
  startOpen?: boolean; // open immediately (useful for edit)
  hideTrigger?: boolean; // hide the built-in Create button
  onSaved?: () => void; // callback after successful save (edit or create)
  onClosed?: () => void; // notify parent when dialog is closed (cancel/save)
}

interface OutfitFormData {
  name: string;
  occasion: string;
  season: string[];
  notes: string;
  rating: string;
  selectedItems: string[];
}

const occasions = [
  "Casual",
  "Business",
  "Formal",
  "Sport",
  "Party",
  "Date",
  "Travel",
];
const seasons = ["Spring", "Summer", "Fall", "Winter"];

export const AddOutfitDialog = ({
  onOutfitAdded,
  preSelectedItems = [],
  mode = "create",
  initialOutfit,
  startOpen,
  hideTrigger,
  onSaved,
  onClosed,
}: AddOutfitDialogProps) => {
  const { user } = useAuth();
  const { items: clothingItems } = useClothingItems(); // Removed fetchItems since it's not needed
  const [open, setOpen] = useState(!!startOpen);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tops");
  const [showPreview, setShowPreview] = useState(true);
  const [previewItem, setPreviewItem] = useState<ClothingItem | null>(null);
  const [formData, setFormData] = useState<OutfitFormData>({
    name: "",
    occasion: "",
    season: [],
    notes: "",
    rating: "",
    selectedItems: [],
  });

  // Initialize for create-from-wardrobe (preSelectedItems)
  useEffect(() => {
    if (mode === "create" && preSelectedItems.length > 0) {
      setFormData((prev) => ({
        ...prev,
        selectedItems: preSelectedItems,
      }));
    }
  }, [preSelectedItems, mode]);

  // Initialize edit mode from initialOutfit
  useEffect(() => {
    if (mode === "edit" && initialOutfit) {
      setFormData({
        name: initialOutfit.name || "",
        occasion: initialOutfit.occasion || "",
        season: initialOutfit.season || [],
        notes: initialOutfit.notes || "",
        rating: initialOutfit.rating ? String(initialOutfit.rating) : "",
        selectedItems:
          (initialOutfit.outfit_items || []).map(
            (oi) => oi.clothing_items.id
          ) || [],
      });
    }
  }, [mode, initialOutfit]);

  const handleInputChange = (field: keyof OutfitFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSeason = (season: string) => {
    setFormData((prev) => ({
      ...prev,
      season: prev.season.includes(season)
        ? prev.season.filter((s) => s !== season)
        : [...prev.season, season],
    }));
  };

  const toggleItem = (itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(itemId)
        ? prev.selectedItems.filter((id) => id !== itemId)
        : [...prev.selectedItems, itemId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.selectedItems.length === 0) {
      toast({
        title: "Missing required fields",
        description:
          "Please provide a name and select at least one clothing item.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      if (mode === "create") {
        // Create the outfit
        const { data: outfit, error: outfitError } = await supabase
          .from("outfits")
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
        const outfitItems = formData.selectedItems.map((itemId) => ({
          outfit_id: outfit.id,
          item_id: itemId,
        }));

        const { error: itemsError } = await supabase
          .from("outfit_items")
          .insert(outfitItems);

        if (itemsError) throw itemsError;

        toast({
          title: "Outfit created successfully!",
          description: "Your new outfit has been added to your collection.",
        });
      } else {
        // Edit existing outfit
        if (!initialOutfit) throw new Error("Missing outfit to edit");

        // Update main outfit
        const { error: updateError } = await supabase
          .from("outfits")
          .update({
            name: formData.name,
            occasion: formData.occasion || null,
            season: formData.season,
            notes: formData.notes || null,
            rating: formData.rating ? parseInt(formData.rating) : null,
          })
          .eq("id", initialOutfit.id);

        if (updateError) throw updateError;

        // Diff outfit items
        const originalIds = new Set(
          (initialOutfit.outfit_items || []).map((oi) => oi.clothing_items.id)
        );
        const currentIds = new Set(formData.selectedItems);

        const toAdd: string[] = [];
        const toRemove: string[] = [];

        // items to add
        formData.selectedItems.forEach((id) => {
          if (!originalIds.has(id)) toAdd.push(id);
        });
        // items to remove
        (initialOutfit.outfit_items || []).forEach((oi) => {
          const id = oi.clothing_items.id;
          if (!currentIds.has(id)) toRemove.push(id);
        });

        if (toAdd.length > 0) {
          const addRows = toAdd.map((itemId) => ({
            outfit_id: initialOutfit.id,
            item_id: itemId,
          }));
          const { error: addErr } = await supabase
            .from("outfit_items")
            .insert(addRows);
          if (addErr) throw addErr;
        }

        if (toRemove.length > 0) {
          const { error: delErr } = await supabase
            .from("outfit_items")
            .delete()
            .eq("outfit_id", initialOutfit.id)
            .in("item_id", toRemove);
          if (delErr) throw delErr;
        }

        toast({ title: "Outfit updated" });
      }

      // Close and notify
      setOpen(false);
      if (onSaved) onSaved();
      else onOutfitAdded();
      if (onClosed) onClosed();
    } catch (error) {
      console.error("Error creating outfit:", error);
      toast({
        title:
          mode === "create"
            ? "Failed to create outfit"
            : "Failed to update outfit",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getItemsByCategory = (category: string) => {
    return clothingItems.filter((item) => item.category === category);
  };

  const getSelectedItems = () => {
    return clothingItems.filter((item) =>
      formData.selectedItems.includes(item.id)
    );
  };

  const categories = [
    { value: "tops", label: "Tops", icon: "👕" },
    { value: "bottoms", label: "Bottoms", icon: "👖" },
    { value: "dresses", label: "Dresses", icon: "👗" },
    { value: "outerwear", label: "Outerwear", icon: "🧥" },
    { value: "shoes", label: "Shoes", icon: "👠" },
    { value: "accessories", label: "Accessories", icon: "👜" },
  ];

  const selectedItems = getSelectedItems();

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v && onClosed) onClosed();
        }}
      >
        {!hideTrigger && mode === "create" && (
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Outfit
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create New Outfit" : "Edit Outfit"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Combine clothing items from your wardrobe to create a new outfit."
                : "Update clothing items and details for this outfit."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[60vh]">
            {/* Left Panel - Form and Item Selection */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Outfit Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="e.g., Business Meeting Look"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occasion">Occasion</Label>
                    <Select
                      value={formData.occasion}
                      onValueChange={(value) =>
                        handleInputChange("occasion", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select occasion" />
                      </SelectTrigger>
                      <SelectContent>
                        {occasions.map((occasion) => (
                          <SelectItem
                            key={occasion}
                            value={occasion.toLowerCase()}
                          >
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
                      onValueChange={(value) =>
                        handleInputChange("rating", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rate this outfit" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <SelectItem key={rating} value={rating.toString()}>
                            <div className="flex items-center gap-2">
                              <span>{rating}</span>
                              <div className="flex">
                                {[...Array(rating)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-3 h-3 fill-current text-yellow-500"
                                  />
                                ))}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Seasons</Label>
                    <div className="flex flex-wrap gap-2">
                      {seasons.map((season) => (
                        <Badge
                          key={season}
                          variant={
                            formData.season.includes(season)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer hover:bg-primary/10"
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
                      {formData.selectedItems.length} item
                      {formData.selectedItems.length !== 1 ? "s" : ""} selected
                    </div>
                  </div>

                  {clothingItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shirt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>
                        No clothing items found. Add items to your wardrobe
                        first.
                      </p>
                    </div>
                  ) : (
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                        {categories.map((category) => {
                          const categoryItems = getItemsByCategory(
                            category.value
                          );
                          if (categoryItems.length === 0) return null;

                          return (
                            <TabsTrigger
                              key={category.value}
                              value={category.value}
                              className="flex items-center gap-1 text-xs"
                            >
                              <span>{category.icon}</span>
                              <span className="hidden sm:inline">
                                {category.label}
                              </span>
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>

                      <ScrollArea className="h-[300px] mt-4">
                        {categories.map((category) => {
                          const categoryItems = getItemsByCategory(
                            category.value
                          );
                          if (categoryItems.length === 0) return null;

                          return (
                            <TabsContent
                              key={category.value}
                              value={category.value}
                              className="mt-0"
                            >
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {categoryItems.map((item) => (
                                  <div
                                    key={item.id}
                                    className={`relative rounded-lg border-2 cursor-pointer transition-all hover:shadow-md group min-w-0 ${
                                      formData.selectedItems.includes(item.id)
                                        ? "border-primary bg-primary/5 shadow-md"
                                        : "border-muted hover:border-border"
                                    }`}
                                  >
                                    {/* Item Image */}
                                    <div className="aspect-square rounded-md overflow-hidden relative bg-muted">
                                      <img
                                        src={
                                          item.front_image_url ||
                                          "/placeholder-clothing.svg"
                                        }
                                        alt={item.name}
                                        className="w-full h-full object-cover safari-img"
                                        onError={(e) => {
                                          // Fallback to placeholder if image fails to load
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.src =
                                            "/placeholder-clothing.svg";
                                        }}
                                      />

                                      {/* Fallback placeholder if no image URL */}
                                      {!item.front_image_url && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <Shirt className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                      )}

                                      {/* Hover Overlay */}
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setPreviewItem(item);
                                            }}
                                            className="bg-white/90 hover:bg-white text-primary shadow-medium"
                                          >
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleItem(item.id);
                                            }}
                                            className="btn-hero"
                                          >
                                            {formData.selectedItems.includes(
                                              item.id
                                            ) ? (
                                              <X className="h-4 w-4" />
                                            ) : (
                                              <Plus className="h-4 w-4" />
                                            )}
                                          </Button>
                                        </div>
                                      </div>

                                      {/* Favorite Badge */}
                                      {item.favorite && (
                                        <div className="absolute top-2 right-2 z-10">
                                          <Heart className="w-4 h-4 fill-current text-red-500" />
                                        </div>
                                      )}

                                      {/* Category Badge */}
                                      <Badge
                                        variant="secondary"
                                        className="absolute top-2 left-2 bg-white/90 text-primary shadow-soft text-xs z-10"
                                      >
                                        {item.category}
                                      </Badge>

                                      {/* Selection Checkbox */}
                                      <Checkbox
                                        checked={formData.selectedItems.includes(
                                          item.id
                                        )}
                                        className="absolute bottom-2 right-2 bg-white shadow-sm z-10"
                                        onCheckedChange={() => {}}
                                      />
                                    </div>

                                    {/* Item Info */}
                                    <div className="p-2 space-y-1">
                                      <p className="text-xs font-medium truncate">
                                        {item.name}
                                      </p>
                                      {item.brand && (
                                        <p className="text-xs text-muted-foreground truncate">
                                          {item.brand}
                                        </p>
                                      )}
                                      {item.color_primary && (
                                        <div className="flex items-center gap-1">
                                          <div
                                            className="w-3 h-3 rounded-full border border-border"
                                            style={{
                                              backgroundColor:
                                                item.color_primary,
                                            }}
                                          />
                                          <span className="text-xs text-muted-foreground">
                                            {item.color_primary}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TabsContent>
                          );
                        })}
                      </ScrollArea>
                    </Tabs>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any notes about this outfit, styling tips, occasions to wear it..."
                    className="min-h-[80px]"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      if (onClosed) onClosed();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || formData.selectedItems.length === 0}
                    className="min-w-[120px]"
                  >
                    {loading
                      ? mode === "create"
                        ? "Creating..."
                        : "Saving..."
                      : mode === "create"
                      ? "Create Outfit"
                      : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Panel - Outfit Preview */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Outfit Preview</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {showPreview && (
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                    {selectedItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
                        <Shirt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Select items to see preview</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Outfit Name Preview */}
                        {formData.name && (
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <h4 className="font-medium">{formData.name}</h4>
                          </div>
                        )}

                        {/* Selected Items Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          {selectedItems.map((item, index) => (
                            <div key={item.id} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden bg-muted border">
                                <img
                                  src={
                                    item.front_image_url ||
                                    "/placeholder-clothing.svg"
                                  }
                                  alt={item.name}
                                  className="w-full h-full object-cover safari-img"
                                  onError={(e) => {
                                    // Fallback to placeholder if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/placeholder-clothing.svg";
                                  }}
                                />
                              </div>
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => toggleItem(item.id)}
                                  className="text-xs"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Remove
                                </Button>
                              </div>
                              <div className="mt-1">
                                <p className="text-xs font-medium truncate">
                                  {item.name}
                                </p>
                                <Badge
                                  variant="outline"
                                  className="text-xs mt-1"
                                >
                                  {item.category}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Outfit Details Preview */}
                        <div className="space-y-2 text-sm">
                          {formData.occasion && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="capitalize">
                                {formData.occasion}
                              </span>
                            </div>
                          )}

                          {formData.season.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-muted-foreground" />
                              <div className="flex flex-wrap gap-1">
                                {formData.season.map((season) => (
                                  <Badge
                                    key={season}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {season}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {formData.rating && (
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{formData.rating}/5 stars</span>
                            </div>
                          )}
                        </div>

                        {formData.notes && (
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              {formData.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clothing Item Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-2xl">
          {previewItem && (
            <>
              <DialogHeader>
                <DialogTitle>{previewItem.name}</DialogTitle>
                <DialogDescription>
                  Preview clothing item details and add to outfit.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Item Images */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Front View</Label>
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={
                          previewItem.front_image_url ||
                          "/placeholder-clothing.svg"
                        }
                        alt={`${previewItem.name} - Front`}
                        className="w-full h-full object-cover safari-img"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-clothing.svg";
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Back View</Label>
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={
                          previewItem.back_image_url ||
                          "/placeholder-clothing.svg"
                        }
                        alt={`${previewItem.name} - Back`}
                        className="w-full h-full object-cover safari-img"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-clothing.svg";
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Item Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <p className="text-sm text-muted-foreground capitalize">
                        {previewItem.category}
                      </p>
                    </div>
                    {previewItem.brand && (
                      <div>
                        <Label className="text-sm font-medium">Brand</Label>
                        <p className="text-sm text-muted-foreground">
                          {previewItem.brand}
                        </p>
                      </div>
                    )}
                    {previewItem.color_primary && (
                      <div>
                        <Label className="text-sm font-medium">Color</Label>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-border"
                            style={{
                              backgroundColor: previewItem.color_primary,
                            }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {previewItem.color_primary}
                          </span>
                        </div>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium">Times Worn</Label>
                      <p className="text-sm text-muted-foreground">
                        {previewItem.wear_count}
                      </p>
                    </div>
                  </div>

                  {/* Occasions */}
                  {previewItem.occasions.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Occasions</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {previewItem.occasions.map((occasion) => (
                          <Badge
                            key={occasion}
                            variant="outline"
                            className="text-xs"
                          >
                            {occasion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Seasons */}
                  {previewItem.season.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Seasons</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {previewItem.season.map((season) => (
                          <Badge
                            key={season}
                            variant="outline"
                            className="text-xs"
                          >
                            {season}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {previewItem.notes && (
                    <div>
                      <Label className="text-sm font-medium">Notes</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {previewItem.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPreviewItem(null)}
                  >
                    Close
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      toggleItem(previewItem.id);
                      setPreviewItem(null);
                    }}
                  >
                    {formData.selectedItems.includes(previewItem.id)
                      ? "Remove from Outfit"
                      : "Add to Outfit"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
