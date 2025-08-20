import { useState } from "react";
import { ClothingCard } from "./ClothingCard";
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
import { Search, Filter, Plus, Grid, List } from "lucide-react";
import { Card } from "@/components/ui/card";

// Sample data
const sampleItems = [
  {
    id: "1",
    name: "Classic White Blouse",
    category: "Tops",
    brand: "Everlane",
    colors: ["#FFFFFF", "#F5F5F5"],
    imageUrl: "/src/assets/sample-blouse.jpg",
    wearCount: 12,
    favorite: true,
    occasions: ["Business", "Casual"],
    lastWorn: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Little Black Dress",
    category: "Dresses",
    brand: "Theory",
    colors: ["#000000"],
    imageUrl: "/src/assets/sample-dress.jpg",
    wearCount: 8,
    favorite: false,
    occasions: ["Formal", "Date Night"],
    lastWorn: new Date("2024-01-10"),
  },
  {
    id: "3",
    name: "Dark Wash Jeans",
    category: "Bottoms",
    brand: "Levi's",
    colors: ["#1a1a2e", "#16213e"],
    imageUrl: "/src/assets/sample-jeans.jpg",
    wearCount: 25,
    favorite: true,
    occasions: ["Casual", "Weekend"],
    lastWorn: new Date("2024-01-20"),
  },
];

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
  const [items, setItems] = useState(sampleItems);

  const handleToggleFavorite = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, favorite: !item.favorite } : item
    ));
  };

  const handleAddToOutfit = (id: string) => {
    console.log("Add to outfit:", id);
  };

  const handleView = (id: string) => {
    console.log("View item:", id);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">My Wardrobe</h1>
          <p className="text-muted-foreground">
            {filteredItems.length} items • {items.filter(i => i.favorite).length} favorites
          </p>
        </div>
        <Button className="btn-hero">
          <Plus className="h-4 w-4 mr-2" />
          Add New Item
        </Button>
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

      {/* Results */}
      {filteredItems.length === 0 ? (
        <Card className="card-fashion p-12 text-center">
          <div className="space-y-4">
            <div className="text-6xl">👗</div>
            <h3 className="text-xl font-semibold">No items found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters, or add some new items to your wardrobe.
            </p>
            <Button className="btn-hero">
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </div>
        </Card>
      ) : (
        <div 
          className={
            viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
          }
        >
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ClothingCard
                item={item}
                onToggleFavorite={handleToggleFavorite}
                onAddToOutfit={handleAddToOutfit}
                onView={handleView}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}