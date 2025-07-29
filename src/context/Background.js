import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const Background = createContext();

export const BackgroundProvider = ({ children }) => {
  const [backgroundUrl, setBackgroundUrl] = useState("");

  const fetchBackground = async () => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      const bgId = docSnap.data()?.settings?.background;
      if (bgId) setBackgroundUrl(`/${bgId}.jpg`);
    }
  };

  useEffect(() => {
    fetchBackground();
  }, []);

  return (
    <Background.Provider value={{ backgroundUrl, fetchBackground }}>
      {children}
    </Background.Provider>
  );
};

export const useBackground = () => useContext(Background);