import { supabase } from '@/integrations/supabase/client';

/**
 * Get a signed URL for a private storage object
 * @param path - The path to the file in storage
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Promise<string | null> - The signed URL or null if error
 */
export async function getSignedUrl(path: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('clothing-images')
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error creating signed URL:', error);
    return null;
  }
}

/**
 * Get signed URLs for multiple paths
 * @param paths - Array of file paths
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Promise<(string | null)[]> - Array of signed URLs
 */
export async function getSignedUrls(paths: string[], expiresIn: number = 3600): Promise<(string | null)[]> {
  try {
    const { data, error } = await supabase.storage
      .from('clothing-images')
      .createSignedUrls(paths, expiresIn);

    if (error) {
      console.error('Error creating signed URLs:', error);
      return paths.map(() => null);
    }

    return data.map(item => item.signedUrl);
  } catch (error) {
    console.error('Error creating signed URLs:', error);
    return paths.map(() => null);
  }
}

/**
 * Extract the storage path from a full URL
 * @param url - The full storage URL
 * @returns string | null - The extracted path or null if invalid
 */
export function extractStoragePath(url: string): string | null {
  try {
    // Handle both public URLs and signed URLs
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/(public\/|sign\/)?clothing-images\/(.+)/);
    return pathMatch ? pathMatch[2] : null;
  } catch {
    return null;
  }
}