import { Heart, Eye, Plus, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  colors: string[];
  imageUrl: string;
  wearCount: number;
  favorite: boolean;
  occasions: string[];
  lastWorn?: Date;
}

interface ClothingCardProps {
  item: ClothingItem;
  onToggleFavorite: (id: string) => void;
  onAddToOutfit: (id: string) => void;
  onView: (id: string) => void;
}

export function ClothingCard({ item, onToggleFavorite, onAddToOutfit, onView }: ClothingCardProps) {
  return (
    <Card className="card-clothing hover-lift group">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Action overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onView(item.id)}
              className="bg-white/90 hover:bg-white text-primary shadow-medium"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => onAddToOutfit(item.id)}
              className="btn-hero"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Favorite button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onToggleFavorite(item.id)}
          className={`absolute top-3 right-3 rounded-full p-2 transition-colors duration-300 ${
            item.favorite 
              ? "bg-fashion-rose/90 text-white hover:bg-fashion-rose" 
              : "bg-white/90 text-muted-foreground hover:bg-white hover:text-fashion-rose"
          }`}
        >
          <Heart className={`h-4 w-4 ${item.favorite ? "fill-current" : ""}`} />
        </Button>

        {/* Category badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-3 left-3 bg-white/90 text-primary shadow-soft"
        >
          {item.category}
        </Badge>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{item.name}</h3>
            {item.brand && (
              <p className="text-muted-foreground text-sm">{item.brand}</p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem>Edit Item</DropdownMenuItem>
              <DropdownMenuItem>Add to Outfit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Color indicators */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Colors:</span>
          <div className="flex gap-1">
            {item.colors.slice(0, 3).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-border shadow-soft"
                style={{ backgroundColor: color }}
              />
            ))}
            {item.colors.length > 3 && (
              <span className="text-xs text-muted-foreground ml-1">
                +{item.colors.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Occasions */}
        <div className="flex flex-wrap gap-1">
          {item.occasions.slice(0, 2).map((occasion) => (
            <Badge
              key={occasion}
              variant="outline"
              className="text-xs bg-accent/50 border-accent"
            >
              {occasion}
            </Badge>
          ))}
          {item.occasions.length > 2 && (
            <Badge variant="outline" className="text-xs bg-muted/50">
              +{item.occasions.length - 2}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t border-border">
          <span>Worn {item.wearCount}x</span>
          {item.lastWorn && (
            <span>Last: {item.lastWorn.toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </Card>
  );
}