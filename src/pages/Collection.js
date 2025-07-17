import React, { useState } from "react";
import FragranceCard from "../components/FragranceCard";
import FloatingAddButton from "../components/FloatingAddButton";
import AddFragranceModal from "../components/AddFragranceModal";

export default function Collection() {
  const [showModal, setShowModal] = useState(false);

  const handleAdd = () => {
    setShowModal(false);
    // Add logic to update collection
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">My Collection</h1>
      <div className="text-sm mb-4 text-gray-500">Recently Viewed</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <FragranceCard key={i} />
        ))}
      </div>
      <FloatingAddButton onClick={() => setShowModal(true)} />
      <AddFragranceModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAdd}
      />
    </>
  );
}