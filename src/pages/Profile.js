import React, { useEffect, useState, useRef } from "react";
import { auth, db, storage } from "../firebase";
import { collection, query, where, doc, getDocs,getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import DarkModeToggle from "../components/DarkModeToggle";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({ displayName: "", photoURL: "" });
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            displayName: data.displayName || currentUser.displayName || "",
            photoURL: data.photoURL || currentUser.photoURL || "",
          });
          setEditName(data.displayName || currentUser.displayName || "");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveProfile = async () => {
  if (!user) return;

  // Trim display name to avoid whitespace issues
  const trimmedName = editName.trim();
  if (!trimmedName) {
    alert("Display name cannot be empty.");
    return;
  }

  setSaving(true);

  try {
    // Query Firestore for users with the same displayName
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("displayName", "==", trimmedName));
    const querySnapshot = await getDocs(q);

    // Check if any other user has this displayName
    const isTaken = querySnapshot.docs.some(doc => doc.id !== user.uid);

    if (isTaken) {
      alert("Display name is already taken. Please choose another.");
      setSaving(false);
      return;
    }

    // Save displayName and photoURL if unique
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { displayName: trimmedName, photoURL: profileData.photoURL }, { merge: true });
    await updateProfile(user, { displayName: trimmedName, photoURL: profileData.photoURL });

    setProfileData(prev => ({ ...prev, displayName: trimmedName }));
    setEditName(trimmedName);

  } catch (err) {
    console.error("Error saving profile:", err);
    alert("Failed to save profile.");
  }

  setSaving(false);
};
  const handleFileChange = async (e) => {
    if (!user) return;
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `profileImages/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProfileData((prev) => ({ ...prev, photoURL: url }));
    } catch (err) {
      console.error("Error uploading file:", err);
    }
    setUploading(false);
  };

  if (loading) return <div style={{ flex: 1, padding: "2rem" }}>Loading profile...</div>;
  if (!user) return <div>You are not logged in.</div>;

  return (
    <main className="flex-1 p-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2>Profile</h2>
        <DarkModeToggle />
      </div>

      <div className="mb-6">
        <div
  className="rounded-full w-24 h-24 mb-4 cursor-pointer border border-gray-400 dark:border-gray-700 overflow-hidden"
  onClick={() => fileInputRef.current.click()}
  aria-label="Upload Profile Picture"
  title="Click to upload profile picture"
>
  {profileData.photoURL ? (
    <img
      src={profileData.photoURL}
      alt="Profile"
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="flex items-center justify-center w-full h-full bg-gray-300 dark:bg-gray-700 text-gray-600">
      No Image
    </div>
  )}
</div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          aria-hidden="true"
        />

        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="Display Name"
          className="border p-2 rounded w-full mb-4
             bg-white text-gray-900
             dark:bg-gray-800 dark:text-gray-100"
        />

        <button
  onClick={saveProfile}
  disabled={saving || uploading}
  className="bg-gray-700 dark:bg-gray-300 text-white dark:text-gray-900 py-2 px-4 rounded-lg disabled:opacity-50"
>
  {saving ? "Saving..." : uploading ? "Uploading..." : "Save Profile"}
</button>
      </div>

      <p>
        <strong>Email:</strong> {user.email || "No email available"}
      </p>
    </main>
  );
};

export default Profile;