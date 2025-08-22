import { useState, useRef, useEffect } from "react";
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
import { toast } from "@/components/ui/use-toast";
import { ImageUploader } from "./ImageUploader";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X } from "lucide-react";

interface AddClothingDialogProps {
  onItemAdded: () => void; // kept for backward compatibility (create mode)
  trigger?: React.ReactNode;
  // Edit-mode additions
  mode?: "create" | "edit";
  initialItem?: Partial<ClothingFormData> & {
    id?: string;
    front_image_url?: string;
    back_image_url?: string;
  };
  startOpen?: boolean;
  hideTrigger?: boolean;
  onSaved?: () => void; // preferred callback for create/edit completion
  onClosed?: () => void;
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

export const AddClothingDialog = ({
  onItemAdded,
  trigger,
  mode = "create",
  initialItem,
  startOpen,
  hideTrigger,
  onSaved,
  onClosed,
}: AddClothingDialogProps) => {
  const [open, setOpen] = useState(!!startOpen);
  const [loading, setLoading] = useState(false);
  const [frontImageUrl, setFrontImageUrl] = useState<string>("");
  const [backImageUrl, setBackImageUrl] = useState<string>("");
  const [picking, setPicking] = useState<"primary" | "secondary" | null>(null);
  const [hoverColor, setHoverColor] = useState<string>("");
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Prefill in edit mode
  useEffect(() => {
    if (mode === "edit" && initialItem) {
      setFormData((prev) => ({
        ...prev,
        name: initialItem.name ?? prev.name,
        category: (initialItem as any).category ?? prev.category,
        subcategory: (initialItem as any).subcategory ?? prev.subcategory,
        brand: (initialItem as any).brand ?? prev.brand,
        color_primary: (initialItem as any).color_primary ?? prev.color_primary,
        color_secondary:
          (initialItem as any).color_secondary ?? prev.color_secondary,
        pattern: (initialItem as any).pattern ?? prev.pattern,
        material: (initialItem as any).material ?? prev.material,
        size: (initialItem as any).size ?? prev.size,
        purchase_price:
          (initialItem as any).purchase_price?.toString?.() ??
          prev.purchase_price,
        purchase_date: (initialItem as any).purchase_date ?? prev.purchase_date,
        notes: (initialItem as any).notes ?? prev.notes,
        season: (initialItem as any).season ?? prev.season,
        occasions: (initialItem as any).occasions ?? prev.occasions,
        style_tags: (initialItem as any).style_tags ?? prev.style_tags,
      }));
      setFrontImageUrl((initialItem as any).front_image_url || "");
      setBackImageUrl((initialItem as any).back_image_url || "");
    }
  }, [mode, initialItem]);

  // Draw the front image to an offscreen canvas for pixel sampling
  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    if (!frontImageUrl) return;

    const handle = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    if (img.complete) {
      handle();
    } else {
      img.onload = handle;
    }
  }, [frontImageUrl]);

  const rgbaToHex = (r: number, g: number, b: number) => {
    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const handlePickMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!picking) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = Math.floor(x * scaleX);
    const cy = Math.floor(y * scaleY);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data = ctx.getImageData(cx, cy, 1, 1).data;
    const hex = rgbaToHex(data[0], data[1], data[2]);
    setHoverColor(hex);
  };

  const handlePickClick: React.MouseEventHandler<HTMLDivElement> = () => {
    if (!picking || !hoverColor) return;
    if (picking === "primary") {
      handleInputChange("color_primary", hoverColor);
    } else {
      handleInputChange("color_secondary", hoverColor);
    }
    setPicking(null);
    toast({ title: "Color selected", description: hoverColor });
  };

  const addTag = (
    field: "season" | "occasions" | "style_tags",
    value: string
  ) => {
    if (value && !formData[field].includes(value)) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
    }
  };

  const removeTag = (
    field: "season" | "occasions" | "style_tags",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item !== value),
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

    if (!frontImageUrl && mode === "create") {
      toast({
        title: "Image required",
        description:
          "Please upload at least a front image of the clothing item.",
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

      if (mode === "create") {
        const { error } = await supabase.from("clothing_items").insert({
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
          purchase_price: formData.purchase_price
            ? parseFloat(formData.purchase_price)
            : null,
          purchase_date: formData.purchase_date || null,
          notes: formData.notes || null,
          season: formData.season,
          occasions: formData.occasions,
          style_tags: formData.style_tags,
          front_image_url: frontImageUrl,
          back_image_url: backImageUrl || null,
        });
        if (error) throw error;
      } else {
        if (!initialItem?.id) throw new Error("Missing item id for edit");
        const { error } = await supabase
          .from("clothing_items")
          .update({
            name: formData.name,
            category: formData.category,
            subcategory: formData.subcategory || null,
            brand: formData.brand || null,
            color_primary: formData.color_primary || null,
            color_secondary: formData.color_secondary || null,
            pattern: formData.pattern || null,
            material: formData.material || null,
            size: formData.size || null,
            purchase_price: formData.purchase_price
              ? parseFloat(formData.purchase_price)
              : null,
            purchase_date: formData.purchase_date || null,
            notes: formData.notes || null,
            season: formData.season,
            occasions: formData.occasions,
            style_tags: formData.style_tags,
            front_image_url:
              frontImageUrl || (initialItem as any).front_image_url || null,
            back_image_url:
              backImageUrl || (initialItem as any).back_image_url || null,
          })
          .eq("id", initialItem.id);
        if (error) throw error;
      }

      toast({
        title: mode === "create" ? "Item added successfully!" : "Item updated",
        description:
          mode === "create"
            ? "Your clothing item has been added to your wardrobe."
            : "Your clothing item has been updated.",
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
      if (onSaved) onSaved();
      else onItemAdded();
      if (onClosed) onClosed();
    } catch (error) {
      console.error("Error adding clothing item:", error);
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
            Add a new item to your wardrobe. Upload photos and fill in the
            details.
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
            {frontImageUrl && (
              <div className="mt-2 space-y-2">
                <div className="text-xs text-muted-foreground">
                  Pick colors from image
                </div>
                <div className="relative inline-block border rounded overflow-hidden">
                  {/* Visible preview used for pointer mapping */}
                  <img
                    ref={imgRef}
                    src={frontImageUrl}
                    alt="preview"
                    className="max-h-64 object-contain block"
                  />
                  {/* Overlay for picking */}
                  <div
                    className={`absolute inset-0 ${
                      picking ? "cursor-crosshair" : "pointer-events-none"
                    }`}
                    onMouseMove={handlePickMove}
                    onClick={handlePickClick}
                    title={picking ? "Click to set color" : ""}
                  />
                  {/* Hover preview dot */}
                  {picking && hoverColor && (
                    <div
                      className="absolute right-2 bottom-2 h-6 w-6 rounded-full border"
                      style={{ backgroundColor: hoverColor }}
                    />
                  )}
                </div>
                {/* Offscreen canvas for sampling */}
                <canvas ref={canvasRef} style={{ display: "none" }} />
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Blue Cotton T-Shirt"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
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
                onChange={(e) =>
                  handleInputChange("subcategory", e.target.value)
                }
                placeholder="e.g., T-Shirt, Jeans, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                placeholder="e.g., Nike, Zara, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color_primary">Primary Color</Label>
              <Input
                id="color_primary"
                value={formData.color_primary}
                onChange={(e) =>
                  handleInputChange("color_primary", e.target.value)
                }
                placeholder="e.g., Blue, Red, etc."
              />
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color_primary || "#000000"}
                  onChange={(e) =>
                    handleInputChange("color_primary", e.target.value)
                  }
                  className="h-8 w-10 p-0 border rounded"
                  aria-label="Primary color picker"
                />
                {frontImageUrl && (
                  <Button
                    type="button"
                    variant={picking === "primary" ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setPicking(picking === "primary" ? null : "primary")
                    }
                  >
                    {" "}
                    {picking === "primary"
                      ? "Picking…"
                      : "Pick from image"}{" "}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color_secondary">Secondary Color</Label>
              <Input
                id="color_secondary"
                value={formData.color_secondary}
                onChange={(e) =>
                  handleInputChange("color_secondary", e.target.value)
                }
                placeholder="e.g., White, Black, etc."
              />
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color_secondary || "#000000"}
                  onChange={(e) =>
                    handleInputChange("color_secondary", e.target.value)
                  }
                  className="h-8 w-10 p-0 border rounded"
                  aria-label="Secondary color picker"
                />
                {frontImageUrl && (
                  <Button
                    type="button"
                    variant={picking === "secondary" ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setPicking(picking === "secondary" ? null : "secondary")
                    }
                  >
                    {" "}
                    {picking === "secondary"
                      ? "Picking…"
                      : "Pick from image"}{" "}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                value={formData.material}
                onChange={(e) => handleInputChange("material", e.target.value)}
                placeholder="e.g., Cotton, Polyester, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => handleInputChange("size", e.target.value)}
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
                onChange={(e) =>
                  handleInputChange("purchase_price", e.target.value)
                }
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) =>
                  handleInputChange("purchase_date", e.target.value)
                }
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            {/* Seasons */}
            <div className="space-y-2">
              <Label>Seasons</Label>
              <div className="flex flex-wrap gap-2">
                {seasons.map((season) => (
                  <Badge
                    key={season}
                    variant={
                      formData.season.includes(season) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => {
                      if (formData.season.includes(season)) {
                        removeTag("season", season);
                      } else {
                        addTag("season", season);
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
                {occasions.map((occasion) => (
                  <Badge
                    key={occasion}
                    variant={
                      formData.occasions.includes(occasion)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => {
                      if (formData.occasions.includes(occasion)) {
                        removeTag("occasions", occasion);
                      } else {
                        addTag("occasions", occasion);
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
                {formData.style_tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag("style_tags", tag)}
                    />
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add style tags (press Enter)"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      addTag("style_tags", value);
                      e.currentTarget.value = "";
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
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional notes about this item..."
              className="min-h-[80px]"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
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
