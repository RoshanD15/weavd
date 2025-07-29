import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

// 1. Rename to BackgroundContext (clarity and convention)
const BackgroundContext = createContext();

export const BackgroundProvider = ({ children }) => {
  const [backgroundUrl, setBackgroundUrl] = useState("");

  const refreshBackground = async () => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      const bgId = docSnap.data()?.settings?.background;
      if (bgId) {
        setBackgroundUrl(`/${bgId}.jpg`);
      } else {
        setBackgroundUrl(""); // fallback
      }
    }
  };

  useEffect(() => {
    refreshBackground();
  }, []);

  return (
    <BackgroundContext.Provider value={{ backgroundUrl, refreshBackground: fetchBackground }}>
      {children}
    </BackgroundContext.Provider>
  );
};

// 2. Add safety check to avoid undefined usage
export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error("useBackground must be used within a BackgroundProvider");
  }
  return context;
};