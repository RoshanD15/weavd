import { supabase } from './supabase';

export async function uploadImage(file, userId) {
  const filePath = `${userId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase
    .storage
    .from('post-photos')
    .upload(filePath, file);
  if (error) throw error;

  // Correct way to get the public URL
  const { data: urlData, error: urlError } = supabase
    .storage
    .from('post-photos')
    .getPublicUrl(filePath);
  if (urlError) throw urlError;
  console.log('getPublicUrl data:', urlData);
  return urlData.publicUrl;
}