import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroSection } from "@/components/HeroSection";
import { WardrobeGrid } from "@/components/WardrobeGrid";
import { ChatInterface } from "@/components/ChatInterface";
import { Shirt, MessageSquare, Sparkles } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("wardrobe");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto bg-muted rounded-xl p-1">
            <TabsTrigger 
              value="wardrobe" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-soft"
            >
              <Shirt className="h-4 w-4" />
              Wardrobe
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-soft"
            >
              <MessageSquare className="h-4 w-4" />
              AI Stylist
            </TabsTrigger>
            <TabsTrigger 
              value="outfits" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-soft"
            >
              <Sparkles className="h-4 w-4" />
              Outfits
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="wardrobe" className="mt-0">
              <WardrobeGrid />
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <div className="flex flex-col items-center space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gradient mb-2">AI Style Assistant</h2>
                  <p className="text-muted-foreground">
                    Get personalized outfit recommendations and styling advice
                  </p>
                </div>
                <ChatInterface />
              </div>
            </TabsContent>

            <TabsContent value="outfits" className="mt-0">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✨</div>
                <h2 className="text-2xl font-bold mb-2">Saved Outfits</h2>
                <p className="text-muted-foreground mb-6">
                  Create and save outfit combinations for easy access
                </p>
                <div className="text-sm text-muted-foreground">
                  This feature will be available once you connect to Supabase for data storage
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
