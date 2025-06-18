import { createClient } from '@supabase/supabase-js';

// Create the Supabase client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Uploads a user avatar to Supabase Storage
 * @param {File} file - The file object to upload (should come from an <input type="file">)
 * @param {string|number} userId - A unique identifier to associate the file with the user
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
export async function uploadAvatar(file, userId) {
  // Check for valid file
  if (!file || !file.name || file.size === 0) {
    console.error('Invalid file:', file);
    throw new Error('Invalid file selected.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  console.log('Uploading file to:', filePath);

  const { data: uploadData, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true,
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return publicData.publicUrl;
}
