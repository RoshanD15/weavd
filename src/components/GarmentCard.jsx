import React from "react";
import { useNavigate } from "react-router-dom";

export default function GarmentCard({ id, name, Description, image, colorTags }) {
  console.log("GarmentCard props:", { id, name, Description, image, colorTags });
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/post/${id}`);
  };
console.log("GarmentCard id:", id);
  return (
    <div
      onClick={handleClick}
      className="
        mb-6
        break-inside-avoid
        rounded-xl
        bg-white/20 dark:bg-gray-900/30
        backdrop-blur-md
        border border-white/30 dark:border-gray-700/40
        shadow-lg
        flex flex-col w-full relative overflow-hidden group p-0 cursor-pointer
        transition-colors duration-300
      "
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      <div className="relative w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden p-0 m-0 rounded-t-xl">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-auto object-contain rounded-t-xl"
            style={{ display: "block" }}
          />
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-400">No Image</span>
        )}

        {colorTags.length > 0 && (
          <div className="absolute top-4 right-4 flex flex-col gap-1 items-end z-10">
            {colorTags.map((color, i) => (
              <span
                key={i}
                className="w-5 h-5 rounded-full border border-white dark:border-gray-700 shadow"
                style={{ background: color, display: "inline-block" }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 text-left w-full m-0 text-gray-900 dark:text-gray-100 transition-colors duration-300 rounded-b-xl">
        <div className="font-medium">{name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{Description}</div>
      </div>
    </div>
  );
}