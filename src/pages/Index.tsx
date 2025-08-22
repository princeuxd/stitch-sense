import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProfileSettingsDialog } from "@/components/ProfileSettingsDialog";
import { WardrobeGrid } from "@/components/WardrobeGrid";
import { ChatInterface } from "@/components/ChatInterface";
import { OutfitGrid } from "@/components/OutfitGrid";
import { SupabaseConnectionTest } from "@/components/SupabaseConnectionTest";

import { useAuth } from "@/hooks/useAuth";
import {
  Shirt,
  MessageSquare,
  Sparkles,
  LogOut,
  User,
  Database,
  Menu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("wardrobe");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shirt className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gradient truncate">
                StyleSync
              </h1>
            </div>
            {/* Desktop actions */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-4">
              <ProfileSettingsDialog>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 max-w-[200px]"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm text-muted-foreground truncate">
                    {user?.email}
                  </span>
                </Button>
              </ProfileSettingsDialog>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="whitespace-nowrap"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            {/* Mobile menu */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    Account
                  </div>
                  <ProfileSettingsDialog>
                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <User className="h-4 w-4" />
                      <span className="truncate">
                        {user?.email || "Profile"}
                      </span>
                    </DropdownMenuItem>
                  </ProfileSettingsDialog>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 sm:pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop/Tablet tabs */}
          <TabsList className="hidden sm:grid w-full grid-cols-4 max-w-2xl mx-auto bg-muted rounded-xl p-1">
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
            <TabsTrigger
              value="connection"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-soft"
            >
              <Database className="h-4 w-4" />
              Connection
            </TabsTrigger>
          </TabsList>

          {/* Floating bottom tabs (mobile) */}
          <div className="sm:hidden">
            <div className="fixed inset-x-0 bottom-0 z-40">
              <div className="mx-auto max-w-7xl px-4 pb-[env(safe-area-inset-bottom)]">
                <div className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-t border-border rounded-t-xl shadow-strong">
                  <div className="grid grid-cols-4">
                    <button
                      className={`flex flex-col items-center justify-center py-3 text-xs ${
                        activeTab === "wardrobe"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setActiveTab("wardrobe")}
                      aria-label="Wardrobe"
                    >
                      <Shirt className="h-5 w-5" />
                      <span className="mt-1">Wardrobe</span>
                    </button>
                    <button
                      className={`flex flex-col items-center justify-center py-3 text-xs ${
                        activeTab === "chat"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setActiveTab("chat")}
                      aria-label="AI Stylist"
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span className="mt-1">Chat</span>
                    </button>
                    <button
                      className={`flex flex-col items-center justify-center py-3 text-xs ${
                        activeTab === "outfits"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setActiveTab("outfits")}
                      aria-label="Outfits"
                    >
                      <Sparkles className="h-5 w-5" />
                      <span className="mt-1">Outfits</span>
                    </button>
                    <button
                      className={`flex flex-col items-center justify-center py-3 text-xs ${
                        activeTab === "connection"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setActiveTab("connection")}
                      aria-label="Connection"
                    >
                      <Database className="h-5 w-5" />
                      <span className="mt-1">Status</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <TabsContent value="wardrobe" className="mt-0">
              <WardrobeGrid />
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <div className="flex flex-col items-center space-y-6">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-gradient mb-2">
                    AI Style Assistant
                  </h2>
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

            <TabsContent value="connection" className="mt-0">
              <div className="flex flex-col items-center space-y-6">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-gradient mb-2">
                    Supabase Connection Test
                  </h2>
                  <p className="text-muted-foreground">
                    Test and verify Supabase connection status
                  </p>
                </div>
                <SupabaseConnectionTest />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
