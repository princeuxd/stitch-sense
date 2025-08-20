import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Camera, Brain, Palette } from "lucide-react";
import wardrobeHero from "@/assets/wardrobe-hero.jpg";

const features = [
  {
    icon: Camera,
    title: "Smart Upload",
    description: "Take photos of your clothes and let AI identify everything automatically",
  },
  {
    icon: Brain,
    title: "AI Styling",
    description: "Get personalized outfit recommendations based on weather, occasion, and style",
  },
  {
    icon: Palette,
    title: "Color Coordination",
    description: "Never wonder what goes together - smart color matching for perfect outfits",
  },
];

export function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-up">
            <div className="space-y-4">
              <Badge className="bg-gradient-accent text-white shadow-medium border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Wardrobe
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Your Smart
                <span className="text-gradient block">Fashion Assistant</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg">
                Upload photos of your clothes, get AI-powered outfit suggestions, and never wonder "what to wear" again. Your personal stylist in your pocket.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="btn-hero text-lg px-8 py-3">
                Start Building Your Wardrobe
              </Button>
              <Button size="lg" variant="outline" className="btn-secondary text-lg px-8 py-3">
                See How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gradient">10K+</div>
                <div className="text-sm text-muted-foreground">Items Catalogued</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gradient">95%</div>
                <div className="text-sm text-muted-foreground">AI Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gradient">2.5x</div>
                <div className="text-sm text-muted-foreground">More Outfits</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-scale-in">
            <div className="relative rounded-2xl overflow-hidden shadow-strong">
              <img
                src={wardrobeHero}
                alt="Modern organized wardrobe"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating cards */}
            <Card className="absolute -bottom-6 -left-6 p-4 card-fashion animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">AI Analysis</div>
                  <div className="text-xs text-muted-foreground">3 items analyzed</div>
                </div>
              </div>
            </Card>

            <Card className="absolute -top-6 -right-6 p-4 card-fashion animate-fade-up" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-fashion-sage flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">New Outfit</div>
                  <div className="text-xs text-muted-foreground">Perfect for today</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="card-fashion p-6 text-center hover-lift animate-fade-up"
              style={{ animationDelay: `${0.7 + index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-accent mx-auto mb-4 flex items-center justify-center">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}