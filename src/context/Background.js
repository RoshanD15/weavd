import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const BackgroundContext = createContext();

const DEFAULT_LIGHT_BG = "/BackgroundBeach.jpg";
const DEFAULT_DARK_BG = "/BackgroundDark.jpg";

export const BackgroundProvider = ({ children }) => {
  const [backgroundUrl, setBackgroundUrl] = useState("");

  // Utility: get system theme
  function getSystemTheme() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  // Set default background based on system theme
  function setDefaultBackground() {
    const theme = getSystemTheme();
    setBackgroundUrl(theme === "dark" ? DEFAULT_DARK_BG : DEFAULT_LIGHT_BG);
  }

  // Try loading the user's background setting, fallback to default
  const fetchBackground = async () => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      const bgId = docSnap.data()?.settings?.background;
      if (bgId) {
        setBackgroundUrl(`/${bgId}.jpg`);
        return;
      }
    }
    setDefaultBackground();
  };

  // Watch for system theme changes
  useEffect(() => {
    fetchBackground();
    // Listen for system theme change
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setDefaultBackground();
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
    // eslint-disable-next-line
  }, []);

  return (
    <BackgroundContext.Provider value={{
      backgroundUrl,
      refreshBackground: fetchBackground
    }}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error("useBackground must be used within a BackgroundProvider");
  }
  return context;
};