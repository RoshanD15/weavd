import React from "react";

export default function FragranceCard({ name = "Name", house = "House" }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center w-full h-full">
      {/* Image placeholder */}
      <div className="w-24 h-16 bg-gray-400 mb-3 rounded"></div>
      {/* Dots on the side */}
      <div className="flex flex-col justify-between h-14 absolute right-4 top-10">
        <div className="w-4 h-4 bg-gray-300 rounded-full mb-1"></div>
        <div className="w-4 h-4 bg-gray-300 rounded-full mb-1"></div>
        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
      </div>
      {/* Name and House */}
      <div className="mt-16 text-left w-full">
        <div className="font-medium">{name}</div>
        <div className="text-xs">{house}</div>
      </div>
    </div>
  );
}
