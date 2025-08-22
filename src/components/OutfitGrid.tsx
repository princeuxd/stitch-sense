import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddOutfitDialog } from "./AddOutfitDialog";
import { useOutfits, Outfit } from "@/hooks/useOutfits";
import {
  Shirt,
  Calendar,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Heart,
  TrendingUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// We reuse AddOutfitDialog in edit mode as a full-screen editor

export const OutfitGrid = () => {
  const { outfits, loading, fetchOutfits, deleteOutfit, incrementWearCount } =
    useOutfits();
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null);

  const getItemsByCategory = (outfit: Outfit, category: string) => {
    return outfit.outfit_items
      .map((item) => item.clothing_items)
      .filter((item) => item.category === category);
  };

  const getOutfitStats = (outfit: Outfit) => {
    const categories = outfit.outfit_items.map(
      (item) => item.clothing_items.category
    );
    const uniqueCategories = [...new Set(categories)];
    return {
      totalItems: outfit.outfit_items.length,
      categories: uniqueCategories,
      hasTops: categories.includes("tops"),
      hasBottoms: categories.includes("bottoms"),
      hasShoes: categories.includes("shoes"),
      hasAccessories: categories.includes("accessories"),
    };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
            Create your first outfit by combining clothing items from your
            wardrobe.
          </p>
        </div>
        <AddOutfitDialog onOutfitAdded={fetchOutfits} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gradient">
            Your Outfits
          </h2>
          <p className="text-muted-foreground">
            {outfits.length} outfit{outfits.length !== 1 ? "s" : ""} in your
            collection
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              List
            </Button>
          </div>
          <AddOutfitDialog onOutfitAdded={fetchOutfits} />
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {outfits.map((outfit) => {
            const stats = getOutfitStats(outfit);

            return (
              <Card
                key={outfit.id}
                className="card-clothing hover:shadow-elegant transition-all duration-300 group"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg leading-tight">
                        {outfit.name}
                      </CardTitle>
                      {outfit.occasion && (
                        <Badge variant="secondary" className="text-xs">
                          {outfit.occasion}
                        </Badge>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setSelectedOutfit(outfit)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditingOutfit(outfit)}
                        >
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
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden bg-muted relative group/item"
                      >
                        {item.clothing_items.front_image_url ? (
                          <img
                            src={item.clothing_items.front_image_url}
                            alt={item.clothing_items.name}
                            className="w-full h-full object-cover safari-img"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove(
                                "hidden"
                              );
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full flex items-center justify-center ${
                            item.clothing_items.front_image_url ? "hidden" : ""
                          }`}
                        >
                          <Shirt className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                          <Badge variant="secondary" className="text-xs">
                            {item.clothing_items.category}
                          </Badge>
                        </div>
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

                  {/* Outfit Stats */}
                  <div className="flex flex-wrap gap-1">
                    {stats.hasTops && (
                      <Badge variant="outline" className="text-xs">
                        👕
                      </Badge>
                    )}
                    {stats.hasBottoms && (
                      <Badge variant="outline" className="text-xs">
                        👖
                      </Badge>
                    )}
                    {stats.hasShoes && (
                      <Badge variant="outline" className="text-xs">
                        👠
                      </Badge>
                    )}
                    {stats.hasAccessories && (
                      <Badge variant="outline" className="text-xs">
                        👜
                      </Badge>
                    )}
                  </div>

                  {/* Outfit Details */}
                  <div className="space-y-2">
                    {outfit.season.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {outfit.season.map((season) => (
                          <Badge
                            key={season}
                            variant="outline"
                            className="text-xs"
                          >
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
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => incrementWearCount(outfit.id)}
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Mark as Worn
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedOutfit(outfit)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {outfits.map((outfit) => {
            const stats = getOutfitStats(outfit);

            return (
              <Card
                key={outfit.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    {/* Outfit Image */}
                    <div className="flex gap-2">
                      {outfit.outfit_items.slice(0, 2).map((item, index) => (
                        <div
                          key={index}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted"
                        >
                          {item.clothing_items.front_image_url ? (
                            <img
                              src={item.clothing_items.front_image_url}
                              alt={item.clothing_items.name}
                              className="w-full h-full object-cover safari-img"
                              onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                target.nextElementSibling?.classList.remove(
                                  "hidden"
                                );
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full flex items-center justify-center ${
                              item.clothing_items.front_image_url
                                ? "hidden"
                                : ""
                            }`}
                          >
                            <Shirt className="w-6 h-6 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                      {outfit.outfit_items.length > 2 && (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-muted flex items-center justify-center">
                          <span className="text-sm font-medium text-muted-foreground">
                            +{outfit.outfit_items.length - 2}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Outfit Info */}
                    <div className="flex-1 min-w-[180px]">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate max-w-[220px] sm:max-w-none">
                          {outfit.name}
                        </h3>
                        {outfit.occasion && (
                          <Badge variant="secondary" className="text-xs">
                            {outfit.occasion}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{stats.totalItems} items</span>
                        <span>Worn {outfit.times_worn} times</span>
                        {outfit.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current text-yellow-500" />
                            <span>{outfit.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => incrementWearCount(outfit.id)}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Worn
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setSelectedOutfit(outfit)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditingOutfit(outfit)}
                          >
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
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Outfit Details Dialog */}
      <Dialog
        open={!!selectedOutfit}
        onOpenChange={() => setSelectedOutfit(null)}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedOutfit && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedOutfit.name}</DialogTitle>
                <DialogDescription>
                  View details and manage items in this outfit.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Outfit Items by Category */}
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="all">All Items</TabsTrigger>
                    <TabsTrigger value="tops">Tops</TabsTrigger>
                    <TabsTrigger value="bottoms">Bottoms</TabsTrigger>
                    <TabsTrigger value="accessories">Accessories</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                      {selectedOutfit.outfit_items.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                            {item.clothing_items.front_image_url ? (
                              <img
                                src={item.clothing_items.front_image_url}
                                alt={item.clothing_items.name}
                                className="w-full h-full object-cover safari-img"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  target.nextElementSibling?.classList.remove(
                                    "hidden"
                                  );
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-full h-full flex items-center justify-center ${
                                item.clothing_items.front_image_url
                                  ? "hidden"
                                  : ""
                              }`}
                            >
                              <Shirt className="w-6 h-6 text-muted-foreground" />
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">
                              {item.clothing_items.name}
                            </p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {item.clothing_items.category}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="tops" className="mt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                      {getItemsByCategory(selectedOutfit, "tops").map(
                        (item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                              {item.front_image_url ? (
                                <img
                                  src={item.front_image_url}
                                  alt={item.name}
                                  className="w-full h-full object-cover safari-img"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    target.nextElementSibling?.classList.remove(
                                      "hidden"
                                    );
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-full h-full flex items-center justify-center ${
                                  item.front_image_url ? "hidden" : ""
                                }`}
                              >
                                <Shirt className="w-6 h-6 text-muted-foreground" />
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium">{item.name}</p>
                              {item.brand && (
                                <p className="text-xs text-muted-foreground">
                                  {item.brand}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="bottoms" className="mt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                      {getItemsByCategory(selectedOutfit, "bottoms").map(
                        (item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                              {item.front_image_url ? (
                                <img
                                  src={item.front_image_url}
                                  alt={item.name}
                                  className="w-full h-full object-cover safari-img"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    target.nextElementSibling?.classList.remove(
                                      "hidden"
                                    );
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-full h-full flex items-center justify-center ${
                                  item.front_image_url ? "hidden" : ""
                                }`}
                              >
                                <Shirt className="w-6 h-6 text-muted-foreground" />
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium">{item.name}</p>
                              {item.brand && (
                                <p className="text-xs text-muted-foreground">
                                  {item.brand}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="accessories" className="mt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                      {getItemsByCategory(selectedOutfit, "accessories").map(
                        (item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                              {item.front_image_url ? (
                                <img
                                  src={item.front_image_url}
                                  alt={item.name}
                                  className="w-full h-full object-cover safari-img"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    target.nextElementSibling?.classList.remove(
                                      "hidden"
                                    );
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-full h-full flex items-center justify-center ${
                                  item.front_image_url ? "hidden" : ""
                                }`}
                              >
                                <Shirt className="w-6 h-6 text-muted-foreground" />
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium">{item.name}</p>
                              {item.brand && (
                                <p className="text-xs text-muted-foreground">
                                  {item.brand}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Outfit Details */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedOutfit.season.map((season) => (
                      <Badge key={season} variant="outline">
                        {season}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Worn {selectedOutfit.times_worn} times</span>
                    </div>
                    {selectedOutfit.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current text-yellow-500" />
                        <span>{selectedOutfit.rating}/5 stars</span>
                      </div>
                    )}
                  </div>

                  {selectedOutfit.notes && (
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm">{selectedOutfit.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Outfit Dialog (full editor) */}
      {editingOutfit && (
        <AddOutfitDialog
          mode="edit"
          initialOutfit={editingOutfit as any}
          startOpen
          hideTrigger
          onSaved={() => {
            fetchOutfits();
            setEditingOutfit(null);
          }}
          onClosed={() => setEditingOutfit(null)}
          onOutfitAdded={fetchOutfits}
        />
      )}
    </div>
  );
};
