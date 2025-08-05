
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { BackgroundProvider, useBackground } from "./context/Background";
import FloatingAddButton from "./components/FloatingAddButton";
import GroupImagesModal from "./components/GroupImagesModal";
import AddItemsModal from "./components/AddItemsModal";

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
  const { backgroundUrl } = useBackground();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const noSidebar = ["/login", "/signup", "/"].includes(location.pathname.toLowerCase());

  // --- MODAL LOGIC MOVED HERE ---
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allImages, setAllImages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);

  // Group modal logic
  const handleOpenGroupModal = () => setShowGroupModal(true);
  const handleGroupsReady = ({ images, groups }) => {
    setAllImages(images);
    setGroups(groups);
    setCurrentGroupIdx(0);
    setShowAddModal(true);
    setShowGroupModal(false);
  };
  const handleAddItem = (itemData) => {
    if (currentGroupIdx < groups.length - 1) {
      setCurrentGroupIdx(currentGroupIdx + 1);
      setShowAddModal(true);
    } else {
      setShowAddModal(false);
      setCurrentGroupIdx(0);
      setGroups([]);
      setAllImages([]);
    }
  };
  const imagesForModal =
    groups.length > 0 && allImages.length > 0
      ? groups[currentGroupIdx].map(idx => allImages[idx])
      : [];

  // Only show FAB on MyCloset
  const showFAB = location.pathname.toLowerCase() === "/mycloset";

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
          !noSidebar ? " pt-24 md:pt-8" : ""
        }`}
        style={{
          backgroundColor: "transparent",
          backdropFilter: "blur(2px)",
        }}
      >
        <Routes>
          
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<SignUp />} />
  <Route path="/MyCloset" element={<MyCloset />} />
  <Route path="/Closet/:userId" element={<Closet />} />
  <Route path="/explore" element={<Explore />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/post/:id" element={<PostDetail />} />

        </Routes>
      </main>

      {showFAB && (
        <>
          <FloatingAddButton onClick={handleOpenGroupModal} />
          <GroupImagesModal
            show={showGroupModal}
            onClose={() => setShowGroupModal(false)}
            onGroupsReady={handleGroupsReady}
          />
          <AddItemsModal
            show={showAddModal}
            images={imagesForModal}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddItem}
          />
        </>
      )}
    </div>
  );
}
function App() {
  return (
    <BackgroundProvider>
      <Router>
        <AppShell />
      </Router>
    </BackgroundProvider>
  );
}

export default App;