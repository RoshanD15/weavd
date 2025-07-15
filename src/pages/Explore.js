import React, { useState } from "react";
import FragranceCard from "../components/FragranceCard";
import Sidebar from "../components/Sidebar";
import HamburgerMenu from "../components/HamburgerMenu";

export default function Explore() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fragrances = [
    { name: "Bleu de Chanel", house: "Chanel" },
    { name: "Dior Sauvage", house: "Dior" },
    { name: "Aventus", house: "Creed" },
    { name: "YSL Nuit", house: "YSL" },
    { name: "Light Blue", house: "Dolce & Gabbana" },
    { name: "Acqua di Gio", house: "Armani" },
    { name: "One Million", house: "Paco Rabanne" },
    { name: "CK One", house: "Calvin Klein" },
    { name: "Spicebomb", house: "Viktor&Rolf" },
    { name: "Le Male", house: "Jean Paul Gaultier" },
    { name: "L’Homme", house: "Prada" },
    { name: "Explorer", house: "Montblanc" },
    { name: "212 Men", house: "Carolina Herrera" },
    { name: "Luna Rossa", house: "Prada" },
    { name: "Intenso", house: "Dolce & Gabbana" },
    { name: "Boss Bottled", house: "Hugo Boss" }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Hamburger for mobile only with animation */}
      <HamburgerMenu onClick={() => setSidebarOpen(true)} show={!sidebarOpen} />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-2">Explore Fragrances</h1>
        <div className="text-sm mb-4 text-gray-500">Popular Now</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {fragrances.map((f, i) => (
            <FragranceCard key={i} name={f.name} house={f.house} />
          ))}
        </div>
      </main>
    </div>
  );
}

