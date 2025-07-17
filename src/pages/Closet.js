import React, { useState } from "react";
import GarmentCard from "../components/GarmentCard";
import FloatingAddButton from "../components/FloatingAddButton";
import AddItemsModal from "../components/AddItemsModal";

export default function Closet() {
  const [showModal, setShowModal] = useState(false);

  const handleAdd = () => {
    setShowModal(false);
    // Add logic to update Closet
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">My Closet</h1>
      <div className="text-sm mb-4 text-gray-500">Recently Viewed</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <GarmentCard key={i} />
        ))}
      </div>
      <FloatingAddButton onClick={() => setShowModal(true)} />
      <AddItemsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAdd}
      />
    </>
  );
}