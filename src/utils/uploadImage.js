import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { v4 as uuid } from "uuid";

export async function uploadImageToFirebase(file, userId, isTemporary = true) {
  const folder = isTemporary ? 'temp' : 'images';
  const filePath = `${folder}/${userId}/${uuid()}_${file.name}`;
  
  const storageRef = ref(storage, filePath);
  await uploadBytes(storageRef, file);

  const url = await getDownloadURL(storageRef);
  return { url, path: filePath };
}