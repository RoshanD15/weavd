
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Closet from "./pages/Closet";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Sidebar from "./components/Sidebar";

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Pages where sidebar and hamburger should NOT appear
  const noSidebar = ["/login", "/signup", "/"].includes(location.pathname.toLowerCase());

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar only if NOT on noSidebar pages */}
      {!noSidebar && (
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      )}

      {/* Main content with top padding only if sidebar exists */}
      <main className={`flex-1 p-8 transition-all duration-300 ${!noSidebar ? "pt-24 md:pt-8" : ""}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/Closet" element={<Closet />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile" element={<Profile />} />
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