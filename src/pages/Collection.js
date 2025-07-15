import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import HamburgerMenu from "../components/HamburgerMenu";
import FragranceCard from "../components/FragranceCard";

export default function Collection() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <HamburgerMenu onClick={() => setSidebarOpen(true)} show={!sidebarOpen} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-2">My Collection</h1>
        <div className="text-sm mb-4 text-gray-500">Recently Viewed</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <FragranceCard key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
