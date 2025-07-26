
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

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
  const location = useLocation();

  const noSidebar = ["/login", "/signup", "/"].includes(location.pathname.toLowerCase());

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {!noSidebar && <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />}
      <main className={`flex-1 p-8 transition-all duration-300 ${!noSidebar ? "pt-24 md:pt-8" : ""}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/Closet" element={<MyCloset />} />
          <Route path="/Closet/:userId" element={<Closet />} /> {/* <-- Add this */}
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