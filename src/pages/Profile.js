import React, { useEffect, useState, useRef } from "react";
import { auth, db, storage } from "../firebase";
import {
  collection,
  query,
  where,
  doc,
  getDocs,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import DarkModeToggle from "../components/DarkModeToggle";
import { useNavigate } from "react-router-dom";
import { useBackground } from "../context/Background";

const BACKGROUND_PRESETS = [
  { id: "BackgroundBeach", label: "Beach", url: "/BackgroundBeach.jpg" },
  { id: "BackgroundBooks", label: "Books", url: "/BackgroundBooks.jpg" },
  { id: "BackgroundConcrete", label: "Concrete", url: "/BackgroundConcrete.jpg" },
  { id: "BackgroundDark", label: "Dark", url: "/BackgroundDark.jpg" },
  { id: "BackgroundGreen", label: "Green", url: "/BackgroundGreen.jpg" },
  { id: "BackgroundWood", label: "Wood", url: "/BackgroundWood.jpg" },
];

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({ displayName: "", photoURL: "" });
  const [backgroundChoice, setBackgroundChoice] = useState("");
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { refreshBackground } = useBackground();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData({
          displayName: data.displayName || user.displayName || "",
          photoURL: data.photoURL || user.photoURL || "",
        });
        setEditName(data.displayName || user.displayName || "");
        setBackgroundChoice(data.settings?.background || "");
      }
      setLoading(false);
    })();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    const trimmedName = editName.trim();
    if (!trimmedName) {
      alert("Display name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("displayName", "==", trimmedName));
      const querySnapshot = await getDocs(q);
      const isTaken = querySnapshot.docs.some((doc) => doc.id !== user.uid);
      if (isTaken) {
        alert("Display name is already taken. Please choose another.");
        setSaving(false);
        return;
      }
      const docRef = doc(db, "users", user.uid);
      await setDoc(
        docRef,
        {
          displayName: trimmedName,
          photoURL: profileData.photoURL,
          settings: { background: backgroundChoice },
        },
        { merge: true }
      );
      await updateProfile(user, {
        displayName: trimmedName,
        photoURL: profileData.photoURL,
      });
      await refreshBackground();
      setProfileData((prev) => ({ ...prev, displayName: trimmedName }));
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

  if (loading)
    return <div style={{ flex: 1, padding: "2rem" }}>Loading profile...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="mb-4 text-xl">You are not logged in.</div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-800 transition"
          onClick={() => navigate("/")}
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <main className="flex-1 flex justify-center min-h-screen">
      <div
        className=" bg-white/60 dark:bg-gray-900/70
    shadow-xl rounded-2xl p-10 max-w-xl w-full
    backdrop-blur-lg border border-white/20 dark:border-gray-700 mx-auto mt-12"
        style={{
          boxShadow: "0 8px 32px 0 rgba(0,0,0,0.20)",
          borderRadius: "1.5rem",           
          padding: "2.5rem 2rem",
          maxWidth: 100000,
          width: "100%",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          margin: "3rem 0"
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Profile</h2>
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
                loading="lazy"
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
            className="border p-2 rounded w-full mb-4 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
          />

          
          <div className="mb-4">
            <h3 className="mb-2 font-semibold">Choose Background</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {BACKGROUND_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => setBackgroundChoice(preset.id)}
                  className={`cursor-pointer border-4 rounded overflow-hidden transition duration-200 ${
                    backgroundChoice === preset.id
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-20 object-cover"
                  />
                  <div className="text-center text-sm bg-gray-100 dark:bg-gray-800 py-1">
                    {preset.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
      </div>
    </main>
  );
};

export default Profile;