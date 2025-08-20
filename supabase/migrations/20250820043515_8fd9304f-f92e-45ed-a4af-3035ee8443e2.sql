-- Create core tables for wardrobe management app

-- Clothing items table
CREATE TABLE public.clothing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories')),
    subcategory TEXT,
    brand TEXT,
    color_primary TEXT,
    color_secondary TEXT,
    pattern TEXT,
    material TEXT,
    season TEXT[] DEFAULT '{}',
    occasions TEXT[] DEFAULT '{}',
    size TEXT,
    purchase_price DECIMAL,
    purchase_date DATE,
    wear_count INT DEFAULT 0,
    last_worn DATE,
    favorite BOOLEAN DEFAULT false,
    notes TEXT,
    front_image_url TEXT,
    back_image_url TEXT,
    ai_description TEXT,
    ai_attributes JSONB,
    style_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for clothing_items
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;

-- Create policies for clothing_items
CREATE POLICY "Users can view their own clothing items" 
ON public.clothing_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clothing items" 
ON public.clothing_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clothing items" 
ON public.clothing_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clothing items" 
ON public.clothing_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Outfits table
CREATE TABLE public.outfits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    occasion TEXT,
    season TEXT[] DEFAULT '{}',
    weather_temp_range INT[2],
    notes TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    times_worn INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for outfits
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;

-- Create policies for outfits
CREATE POLICY "Users can view their own outfits" 
ON public.outfits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outfits" 
ON public.outfits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfits" 
ON public.outfits 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfits" 
ON public.outfits 
FOR DELETE 
USING (auth.uid() = user_id);

-- Outfit items junction table
CREATE TABLE public.outfit_items (
    outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.clothing_items(id) ON DELETE CASCADE,
    PRIMARY KEY (outfit_id, item_id)
);

-- Enable RLS for outfit_items
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;

-- Create policies for outfit_items (inherit from parent tables)
CREATE POLICY "Users can manage outfit items for their own outfits" 
ON public.outfit_items 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.outfits 
    WHERE outfits.id = outfit_items.outfit_id 
    AND outfits.user_id = auth.uid()
  )
);

-- User preferences table
CREATE TABLE public.user_preferences (
    user_id UUID PRIMARY KEY,
    style_profile TEXT[] DEFAULT '{}',
    favorite_colors TEXT[] DEFAULT '{}',
    avoided_colors TEXT[] DEFAULT '{}',
    body_type TEXT,
    lifestyle TEXT[] DEFAULT '{}',
    budget_range TEXT,
    weather_location TEXT,
    notification_preferences JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Profiles table for additional user info
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_clothing_items_updated_at
BEFORE UPDATE ON public.clothing_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, display_name)
  VALUES (NEW.id, NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('clothing-images', 'clothing-images', false);

-- Create storage policies for clothing images
CREATE POLICY "Users can upload their own clothing images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'clothing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own clothing images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'clothing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own clothing images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'clothing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own clothing images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'clothing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes for better performance
CREATE INDEX idx_clothing_items_user_id ON public.clothing_items(user_id);
CREATE INDEX idx_clothing_items_category ON public.clothing_items(category);
CREATE INDEX idx_clothing_items_created_at ON public.clothing_items(created_at);
CREATE INDEX idx_outfits_user_id ON public.outfits(user_id);
CREATE INDEX idx_outfit_items_outfit_id ON public.outfit_items(outfit_id);
CREATE INDEX idx_outfit_items_item_id ON public.outfit_items(item_id);