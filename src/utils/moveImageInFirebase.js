import { ref, getBlob, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";

export async function moveImageInFirebase(oldPath, userId) {
  try {
    const fileRef = ref(storage, oldPath);
    
    // Step 1: Download the file from old location
    const blob = await getBlob(fileRef);
    
    // Step 2: Upload to new 'images/' folder
    const newPath = oldPath.replace('temp/', 'images/');
    const newFileRef = ref(storage, newPath);
    await uploadBytes(newFileRef, blob);
    
    // Get new URL after upload
    const newUrl = await getDownloadURL(newFileRef);
    
    // Step 3: Delete original file from temp location
    await deleteObject(fileRef);
    
    // Return new image details
    return { url: newUrl, path: newPath };
  } catch (error) {
    console.error("Error moving image:", error);
    throw error;
  }
}