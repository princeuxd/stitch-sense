import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { WardrobeGrid } from "@/components/WardrobeGrid";
import { ChatInterface } from "@/components/ChatInterface";
import { OutfitGrid } from "@/components/OutfitGrid";
import { useAuth } from "@/hooks/useAuth";
import { Shirt, MessageSquare, Sparkles, LogOut, User } from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("wardrobe");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shirt className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gradient">StyleSync</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                {user?.email}
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

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
              <OutfitGrid />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
