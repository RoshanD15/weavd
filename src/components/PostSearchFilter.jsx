import React, { useState, useRef, useEffect } from "react";
import { SketchPicker } from "react-color";

export default function PostSearchFilter({
  searchQuery, setSearchQuery,
  selectedColor, setSelectedColor
}) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerContainerRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClick(event) {
      if (
        pickerContainerRef.current &&
        !pickerContainerRef.current.contains(event.target)
      ) {
        setShowPicker(false);
      }
    }
    if (showPicker) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPicker]);

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
      <input
        type="text"
        className="border rounded-lg px-4 py-2 w-full md:w-96 text-black"
        placeholder="Search by name, tag, or description..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <div className="flex items-center gap-2" style={{ position: "relative" }}>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-8 h-8 rounded-full border border-gray-300"
          style={{
            background: selectedColor || "#fff",
            boxShadow: selectedColor ? "0 0 0 2px #000" : undefined,
          }}
          title="Pick a color"
        />
        {showPicker && (
          <div
            ref={pickerContainerRef}
            style={{
              position: "absolute",
              left: 0,
              top: "120%",
              zIndex: 20,
              borderRadius: "1.5rem",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.23)",
              background: "rgba(255,255,255,0.98)",
              border: "1px solid rgba(255,255,255,0.20)",
              padding: 8,
              minWidth: 220,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            {/* X Close Button */}
            <button
              onClick={() => setShowPicker(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 16,
                background: "transparent",
                border: "none",
                fontSize: 18,
                cursor: "pointer",
                zIndex: 10000,
                lineHeight: 1,
                color: "#222",
              }}
              aria-label="Close color picker"
            >
              ×
            </button>
            <SketchPicker
              color={selectedColor || "#fff"}
              onChange={color => setSelectedColor(color.hex)}
              disableAlpha // remove this line if you want transparency
            />
          </div>
        )}
        {selectedColor && (
          <button
            className="ml-2 text-xs underline"
            onClick={() => setSelectedColor("")}
          >Clear</button>
        )}
      </div>
    </div>
  );
}