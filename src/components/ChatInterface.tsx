import { useState } from "react";
import { Send, Sparkles, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const initialMessages: Message[] = [
  {
    id: "1",
    type: "assistant",
    content: "Hi! I'm your AI stylist assistant. I can help you create outfits, suggest combinations, or answer questions about your wardrobe. What would you like to explore today?",
    timestamp: new Date(),
    suggestions: [
      "What should I wear to a business meeting?",
      "Create a casual weekend outfit",
      "Show me outfits for rainy weather",
      "What goes well with my white blouse?",
    ],
  },
];

const quickPrompts = [
  "Outfit for date night",
  "Business casual look",
  "Weekend vibes",
  "Seasonal suggestions",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: generateMockResponse(content),
        timestamp: new Date(),
        suggestions: generateSuggestions(content),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateMockResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes("business") || message.includes("meeting")) {
      return "For a business meeting, I'd recommend your Classic White Blouse paired with dark tailored pants or a blazer. This creates a professional, polished look that's perfect for important meetings. The white blouse is versatile and always looks crisp and confident.";
    }
    
    if (message.includes("casual") || message.includes("weekend")) {
      return "For a casual weekend look, try your Dark Wash Jeans with a comfortable top. You could layer with a cardigan or light jacket depending on the weather. This combination is both stylish and comfortable for errands, coffee dates, or relaxing at home.";
    }
    
    if (message.includes("rainy") || message.includes("weather")) {
      return "For rainy weather, choose darker colors that won't show water spots as easily. I'd suggest waterproof footwear and a light jacket that you can easily layer. Your darker pieces would work well - they're practical and still stylish for gloomy days.";
    }
    
    return "I'd be happy to help you create the perfect outfit! Based on your wardrobe, I can suggest several great combinations. Could you tell me more about the occasion or your style preferences for today?";
  };

  const generateSuggestions = (userMessage: string): string[] => {
    return [
      "Show me similar outfits",
      "What accessories would work?",
      "Suggest color combinations",
      "Create another option",
    ];
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      <Card className="card-fashion p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI Style Assistant</h2>
            <p className="text-sm text-muted-foreground">Your personal fashion consultant</p>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-muted-foreground mr-2">Quick ideas:</span>
          {quickPrompts.map((prompt) => (
            <Badge
              key={prompt}
              variant="outline"
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleSuggestionClick(prompt)}
            >
              {prompt}
            </Badge>
          ))}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] space-y-2 ${
                    message.type === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  {message.suggestions && (
                    <div className="flex flex-wrap gap-1">
                      {message.suggestions.map((suggestion, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer text-xs hover:bg-accent transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>

                {message.type === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about styling, outfits, or wardrobe advice..."
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputValue);
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="btn-hero"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}