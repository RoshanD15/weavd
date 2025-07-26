import { ref, deleteObject } from "firebase/storage";
import { storage } from "../firebase";

/**
 * Deletes an image from Firebase Storage given its path.
 * @param {string} filePath - The storage path to the file (e.g., "images/userId/filename.jpg")
 * @returns {Promise<void>}
 */
export async function deleteImageFromFirebase(filePath) {
  if (!filePath) return;
  const fileRef = ref(storage, filePath);
  try {
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    // You can log or handle the error as needed
    console.error("Error deleting file from Firebase:", error);
    return false;
  }
}