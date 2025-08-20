import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { ImageUploader } from "./ImageUploader";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X } from "lucide-react";

interface AddClothingDialogProps {
  onItemAdded: () => void;
  trigger?: React.ReactNode;
}

interface ClothingFormData {
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  color_primary: string;
  color_secondary: string;
  pattern: string;
  material: string;
  size: string;
  purchase_price: string;
  purchase_date: string;
  notes: string;
  season: string[];
  occasions: string[];
  style_tags: string[];
}

const categories = [
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "dresses", label: "Dresses" },
  { value: "outerwear", label: "Outerwear" },
  { value: "shoes", label: "Shoes" },
  { value: "accessories", label: "Accessories" },
];

const seasons = ["Spring", "Summer", "Fall", "Winter"];
const occasions = ["Casual", "Business", "Formal", "Sport", "Party"];

export const AddClothingDialog = ({ onItemAdded, trigger }: AddClothingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [frontImageUrl, setFrontImageUrl] = useState<string>("");
  const [backImageUrl, setBackImageUrl] = useState<string>("");
  const [formData, setFormData] = useState<ClothingFormData>({
    name: "",
    category: "",
    subcategory: "",
    brand: "",
    color_primary: "",
    color_secondary: "",
    pattern: "",
    material: "",
    size: "",
    purchase_price: "",
    purchase_date: "",
    notes: "",
    season: [],
    occasions: [],
    style_tags: [],
  });

  const handleInputChange = (field: keyof ClothingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (field: 'season' | 'occasions' | 'style_tags', value: string) => {
    if (value && !formData[field].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
    }
  };

  const removeTag = (field: 'season' | 'occasions' | 'style_tags', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the name and category.",
        variant: "destructive",
      });
      return;
    }

    if (!frontImageUrl) {
      toast({
        title: "Image required",
        description: "Please upload at least a front image of the clothing item.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from('clothing_items')
        .insert({
          user_id: user.id,
          name: formData.name,
          category: formData.category,
          subcategory: formData.subcategory || null,
          brand: formData.brand || null,
          color_primary: formData.color_primary || null,
          color_secondary: formData.color_secondary || null,
          pattern: formData.pattern || null,
          material: formData.material || null,
          size: formData.size || null,
          purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
          purchase_date: formData.purchase_date || null,
          notes: formData.notes || null,
          season: formData.season,
          occasions: formData.occasions,
          style_tags: formData.style_tags,
          front_image_url: frontImageUrl,
          back_image_url: backImageUrl || null,
        });

      if (error) throw error;

      toast({
        title: "Item added successfully!",
        description: "Your clothing item has been added to your wardrobe.",
      });

      // Reset form
      setFormData({
        name: "",
        category: "",
        subcategory: "",
        brand: "",
        color_primary: "",
        color_secondary: "",
        pattern: "",
        material: "",
        size: "",
        purchase_price: "",
        purchase_date: "",
        notes: "",
        season: [],
        occasions: [],
        style_tags: [],
      });
      setFrontImageUrl("");
      setBackImageUrl("");
      setOpen(false);
      onItemAdded();
    } catch (error) {
      console.error('Error adding clothing item:', error);
      toast({
        title: "Failed to add item",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Clothing Item</DialogTitle>
          <DialogDescription>
            Add a new item to your wardrobe. Upload photos and fill in the details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Photos</Label>
            <ImageUploader
              onImagesUploaded={(front, back) => {
                setFrontImageUrl(front);
                setBackImageUrl(back || "");
              }}
              maxFiles={2}
            />
            <p className="text-xs text-muted-foreground">
              Upload front and back photos of your clothing item
            </p>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Blue Cotton T-Shirt"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                placeholder="e.g., T-Shirt, Jeans, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="e.g., Nike, Zara, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color_primary">Primary Color</Label>
              <Input
                id="color_primary"
                value={formData.color_primary}
                onChange={(e) => handleInputChange('color_primary', e.target.value)}
                placeholder="e.g., Blue, Red, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color_secondary">Secondary Color</Label>
              <Input
                id="color_secondary"
                value={formData.color_secondary}
                onChange={(e) => handleInputChange('color_secondary', e.target.value)}
                placeholder="e.g., White, Black, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                value={formData.material}
                onChange={(e) => handleInputChange('material', e.target.value)}
                placeholder="e.g., Cotton, Polyester, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                placeholder="e.g., M, L, 32, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                value={formData.purchase_price}
                onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => handleInputChange('purchase_date', e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            {/* Seasons */}
            <div className="space-y-2">
              <Label>Seasons</Label>
              <div className="flex flex-wrap gap-2">
                {seasons.map(season => (
                  <Badge
                    key={season}
                    variant={formData.season.includes(season) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (formData.season.includes(season)) {
                        removeTag('season', season);
                      } else {
                        addTag('season', season);
                      }
                    }}
                  >
                    {season}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Occasions */}
            <div className="space-y-2">
              <Label>Occasions</Label>
              <div className="flex flex-wrap gap-2">
                {occasions.map(occasion => (
                  <Badge
                    key={occasion}
                    variant={formData.occasions.includes(occasion) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (formData.occasions.includes(occasion)) {
                        removeTag('occasions', occasion);
                      } else {
                        addTag('occasions', occasion);
                      }
                    }}
                  >
                    {occasion}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Style Tags */}
            <div className="space-y-2">
              <Label>Style Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.style_tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag('style_tags', tag)}
                    />
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add style tags (press Enter)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      addTag('style_tags', value);
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes about this item..."
              className="min-h-[80px]"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};