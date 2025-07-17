import React from "react";
import GarmentCard from "../components/GarmentCard";

export default function Explore() {
  const Items = [
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
    <>
      <h1 className="text-3xl font-bold mb-2">Explore Fashion</h1>
      <div className="text-sm mb-4 text-gray-500">Popular Now</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {Items.map((f, i) => (
          <GarmentCard key={i} name={f.name} house={f.house} />
        ))}
      </div>
    </>
  );
}

