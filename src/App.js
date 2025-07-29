
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import MyCloset from "./pages/MyCloset";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Sidebar from "./components/Sidebar";
import PostDetail from "./pages/PostDetail";
import Closet from "./pages/Closet";

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const location = useLocation();

  const noSidebar = ["/login", "/signup", "/"].includes(location.pathname.toLowerCase());

  useEffect(() => {
    const fetchBackground = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const bgId = docSnap.data()?.settings?.background;
        if (bgId) {
          setBackgroundUrl(`/${bgId}.jpg`);
        }
      }
    };

    fetchBackground();
  }, []);

  return (
    <div
      className="flex min-h-screen text-gray-900 dark:text-gray-100"
      style={{
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {!noSidebar && <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />}
      <main
        className={`flex-1 p-8 transition-all duration-300 ${
          !noSidebar ? "pt-24 md:pt-8" : ""
        }`}
        style={{
          backgroundColor: "rgba(255,255,255,0.85)", // optional blur effect
          backdropFilter: "blur(2px)", // optional: nice with transparent cards
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/Closet" element={<MyCloset />} />
          <Route path="/Closet/:userId" element={<Closet />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/post/:id" element={<PostDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}