import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";

interface ImageUploaderProps {
  onImagesUploaded: (frontImageUrl: string, backImageUrl?: string) => void;
  maxFiles?: number;
  className?: string;
}

interface UploadedImage {
  file: File;
  preview: string;
  url?: string;
  uploading: boolean;
  error?: string;
}

export const ImageUploader = ({ 
  onImagesUploaded, 
  maxFiles = 2, 
  className = "" 
}: ImageUploaderProps) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload only image files.",
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please upload images smaller than 10MB.",
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    const newImages = validFiles.slice(0, maxFiles - images.length).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      error: undefined,
    }));

    setImages(prev => [...prev, ...newImages]);
  }, [images.length, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: maxFiles > 1,
    maxFiles,
  });

  const uploadImages = async () => {
    if (images.length === 0) return;

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload images.",
        variant: "destructive",
      });
      return;
    }

    const uploadPromises = images.map(async (image, index) => {
      if (image.url) return image.url; // Already uploaded

      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, uploading: true, error: undefined } : img
      ));

      try {
        const fileExt = image.file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('clothing-images')
          .upload(fileName, image.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('clothing-images')
          .getPublicUrl(data.path);

        setImages(prev => prev.map((img, i) => 
          i === index ? { ...img, url: publicUrl, uploading: false } : img
        ));

        return publicUrl;
      } catch (error) {
        console.error('Upload error:', error);
        setImages(prev => prev.map((img, i) => 
          i === index ? { 
            ...img, 
            uploading: false, 
            error: error instanceof Error ? error.message : 'Upload failed' 
          } : img
        ));
        throw error;
      }
    });

    try {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const uploadedUrls = await Promise.all(uploadPromises);
      
      clearInterval(interval);
      setUploadProgress(100);

      const validUrls = uploadedUrls.filter(Boolean);
      if (validUrls.length > 0) {
        onImagesUploaded(validUrls[0], validUrls[1]);
        toast({
          title: "Upload successful!",
          description: `${validUrls.length} image(s) uploaded successfully.`,
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Some images failed to upload. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const hasUploading = images.some(img => img.uploading);
  const hasErrors = images.some(img => img.error);
  const canUpload = images.length > 0 && !hasUploading && !images.every(img => img.url);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer hover:border-primary/50 ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border'
        }`}
      >
        <CardContent className="p-8">
          <div {...getRootProps()} className="text-center space-y-4">
            <input {...getInputProps()} />
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive ? "Drop images here" : "Upload clothing photos"}
              </p>
              <p className="text-sm text-muted-foreground">
                Drag & drop up to {maxFiles} images, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPEG, PNG, WebP (max 10MB each)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <img
                    src={image.preview}
                    alt={`Upload preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Remove button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {/* Status overlay */}
                  {image.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <Upload className="w-6 h-6 mx-auto mb-2 animate-pulse" />
                        <p className="text-sm font-medium">Uploading...</p>
                      </div>
                    </div>
                  )}

                  {image.url && !image.uploading && (
                    <div className="absolute top-2 left-2">
                      <div className="bg-green-500 text-white rounded-full p-1">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  {image.error && (
                    <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-3 text-center max-w-[200px]">
                        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
                        <p className="text-sm font-medium text-red-700">Upload failed</p>
                        <p className="text-xs text-red-600">{image.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading images...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Upload Button */}
      {canUpload && (
        <Button 
          onClick={uploadImages} 
          className="w-full" 
          disabled={hasUploading}
        >
          {hasUploading ? "Uploading..." : `Upload ${images.length} Image${images.length > 1 ? 's' : ''}`}
        </Button>
      )}
    </div>
  );
};