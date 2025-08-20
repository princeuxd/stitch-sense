import { useState, useMemo } from "react";
import { ClothingCard } from "./ClothingCard";
import { AddClothingDialog } from "./AddClothingDialog";
import { EditClothingDialog } from "./EditClothingDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Plus, Grid, List, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useClothingItems } from "@/hooks/useClothingItems";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Category mapping for display
const categoryDisplayMap: Record<string, string> = {
  tops: "Tops",
  bottoms: "Bottoms", 
  dresses: "Dresses",
  outerwear: "Outerwear",
  shoes: "Shoes",
  accessories: "Accessories"
};

const categories = ["All", "Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];
const sortOptions = [
  { value: "recent", label: "Recently Added" },
  { value: "worn-most", label: "Most Worn" },
  { value: "worn-least", label: "Least Worn" },
  { value: "name", label: "Alphabetical" },
];

export function WardrobeGrid() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingItem, setEditingItem] = useState<any>(null);
  const { items, loading, error, fetchItems, toggleFavorite, incrementWearCount, deleteItem } = useClothingItems();

  const handleAddToOutfit = (id: string) => {
    console.log("Add to outfit:", id);
  };

  const handleView = (id: string) => {
    console.log("View item:", id);
  };

  const handleEdit = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      setEditingItem(item);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteItem(id);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || categoryDisplayMap[item.category] === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort items based on selected sort option
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "worn-most":
        return b.wear_count - a.wear_count;
      case "worn-least":
        return a.wear_count - b.wear_count;
      case "name":
        return a.name.localeCompare(b.name);
      case "recent":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">My Wardrobe</h1>
          <p className="text-muted-foreground">
            {loading ? "Loading..." : `${sortedItems.length} items • ${items.filter(i => i.favorite).length} favorites`}
          </p>
        </div>
        <AddClothingDialog onItemAdded={fetchItems} />
      </div>

      {/* Search and Filters */}
      <Card className="card-fashion p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your wardrobe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  selectedCategory === category 
                    ? "bg-gradient-accent text-white shadow-medium" 
                    : "hover:bg-accent"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Sort and View Controls */}
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center border border-border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading your wardrobe...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Your wardrobe is empty</h3>
          <p className="text-muted-foreground mb-4">
            Start building your digital wardrobe by adding your first clothing item.
          </p>
          <AddClothingDialog onItemAdded={fetchItems} />
        </div>
      )}

      {/* Items Grid */}
      {!loading && !error && sortedItems.length > 0 && (
        <div 
          className={
            viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
          }
        >
          {sortedItems.map((item, index) => (
            <div
              key={item.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ClothingCard
                item={{
                  id: item.id,
                  name: item.name,
                  category: categoryDisplayMap[item.category] || item.category,
                  brand: item.brand,
                  colors: [item.color_primary, item.color_secondary].filter(Boolean),
                  imageUrl: item.front_image_url || '/placeholder-clothing.svg',
                  wearCount: item.wear_count,
                  favorite: item.favorite,
                  occasions: item.occasions,
                  lastWorn: item.last_worn ? new Date(item.last_worn) : undefined,
                }}
                onToggleFavorite={toggleFavorite}
                onAddToOutfit={handleAddToOutfit}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && items.length > 0 && sortedItems.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Edit Dialog */}
       {editingItem && (
         <EditClothingDialog
           item={editingItem}
           isOpen={!!editingItem}
           onOpenChange={(open) => {
             if (!open) {
               setEditingItem(null);
             }
           }}
           onItemUpdated={() => {
             fetchItems();
             setEditingItem(null);
           }}
         />
       )}
    </div>
  );
}