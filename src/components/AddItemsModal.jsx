import React, { useState } from "react";

export default function AddItemsModal({ show, onClose, onAdd }) {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [colorTags, setColorTags] = useState([]);
  const [itemTags, setItemTags] = useState([]);
  const [colorInput, setColorInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  if (!show) return null;

  const IMG_WIDTH = 112; // px (w-28)
  const IMG_HEIGHT = 160; // px (h-40)
  const FAN_OVERLAP = 28; // px

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (idx) => setImages(images.filter((_, i) => i !== idx));
  const addColorTag = () => {
    if (colorInput && !colorTags.includes(colorInput)) {
      setColorTags([...colorTags, colorInput]);
      setColorInput("");
    }
  };
  const addItemTag = () => {
    if (tagInput && !itemTags.includes(tagInput)) {
      setItemTags([...itemTags, tagInput]);
      setTagInput("");
    }
  };
  const removeColorTag = (tag) => setColorTags(colorTags.filter((t) => t !== tag));
  const removeItemTag = (tag) => setItemTags(itemTags.filter((t) => t !== tag));

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      itemName,
      description,
      images,
      colorTags,
      itemTags,
    });
    setItemName("");
    setDescription("");
    setImages([]);
    setColorTags([]);
    setItemTags([]);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <style>
        {`
        .weavd-scroll::-webkit-scrollbar {
          height: 8px;
          background: transparent;
        }
        .weavd-scroll::-webkit-scrollbar-thumb {
          background: rgba(128,128,128,0.17);
          border-radius: 6px;
          transition: background 0.2s;
          backdrop-filter: blur(4px);
        }
        .weavd-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(80,80,80,0.33);
        }
        .weavd-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .weavd-scroll {
          scrollbar-color: rgba(128,128,128,0.17) transparent;
          scrollbar-width: thin;
        }
        `}
      </style>
      <div
  className="
    bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl
    w-full max-w-[96vw] sm:w-[34rem]
    relative p-3 sm:p-8 flex flex-col
    overflow-x-hidden overflow-y-hidden
  "
  style={{ WebkitBackdropFilter: "blur(20px)" }}
>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Add Clothing Item</h2>
        <form onSubmit={handleSubmit}>
          {/* --- Fan Layout --- */}
         <div
  className="mb-0"
    style={{
      height: "240px",        // at least as big as the "pop" effect needs
      overflow: "hidden",
      position: "relative",
      marginBottom: "-24px",
      width: "100vw",
      maxWidth: "100%",
  }}
>
  <div
    className="flex items-start weavd-scroll"
    style={{
      overflowX: "auto",
      overflowY: "hidden",
      minHeight: "200px",
      maxHeight: "500px",
      background: "transparent",
      padding: 0,
      position: "relative",
      width: "100vw",
      maxWidth: "100%",
    }}
  >
    {/* Plus Card (sticky left, always visible and above images if hovered) */}
    <input
      id="file-upload"
      type="file"
      multiple
      accept="image/*"
      onChange={handleImageChange}
      className="hidden"
    />
    <label
      htmlFor="file-upload"
      className="cursor-pointer flex items-center justify-center w-28 h-40 rounded-[18px] border-4 border-gray-500 bg-gray-400 text-6xl text-gray shadow transition hover:bg-gray-300 select-none"
      title="Add photos"
      style={{
        minWidth: "112px",
        minHeight: "160px",
        marginLeft: "0px",
        position: "sticky",
        left: 0,
        top: 0,
        zIndex: 200, // if first image is hovered, keep the plus under
        
      }}
    >
      +
    </label>
    {/* Image fan */}
    {images.map((img, idx) => {
      const isHovered = hoveredIdx === idx;
      return (
        <div
          key={idx}
          className="relative"
          style={{
            zIndex: isHovered ? 9999 : 100 - idx, // hovered image is always top!
            minWidth: "112px",
            width: "112px",
            height: "200px",
            marginLeft: idx === 0 ? "-28px" : "-28px", // overlap plus button for first
            overflow: "visible",
            alignSelf: "flex-end",
            pointerEvents: "auto",
          }}
          onMouseEnter={() => setHoveredIdx(idx)}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <div
            style={{
              width: "112px",
              height: "160px",
              position: "absolute",
              top: 0,
              left: 0,
              transform: isHovered ? "translateY(44px) scale(1.13)" : "none",
              transition: "transform 0.22s, box-shadow 0.22s",
              zIndex: isHovered ? 10000 : 100 - idx,
            }}
          >
            <img
              src={URL.createObjectURL(img)}
              alt="preview"
              className="w-28 h-40 rounded-[18px] border border-gray-300 object-cover bg-[#eee]"
              draggable={false}
              style={{
                objectFit: "cover",
                width: "100%",
                height: "100%",
                boxShadow: isHovered ? "0 8px 36px #0003" : "",
                background: "#eee",
                pointerEvents: "auto",
              }}
            />
            {/* X Button */}
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute"
              style={{
                top: "10px",
                right: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                fontSize: "1.3rem",
                color: "#222",
                background: "rgba(255,255,255,0.65)",
                borderRadius: "50%",
                border: "1.5px solid rgba(255,255,255,0.7)",
                boxShadow: "0 2px 8px #0001, 0 1.5px 4px #0002",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                zIndex: 10001,
                cursor: "pointer",
                transition: "background 0.18s, color 0.18s"
              }}
              tabIndex={-1}
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        </div>
      );
    })}
  </div>
</div>
          {/* Item Name */}
          <input
            className="border rounded-lg w-full mb-4 p-2 bg-white/70 placeholder-gray-400"
            type="text"
            placeholder="Item Name (e.g., 'Red Hoodie')"
            value={itemName}
            onChange={e => setItemName(e.target.value)}
            required
          />
          {/* Color Tags */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Colors</label>
            <div className="flex gap-2 mb-2">
              {colorTags.map((color, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-gray-300 text-gray-700 mr-2"
                  style={{ backgroundColor: color }}
                  onClick={() => removeColorTag(color)}
                  title="Remove color"
                >
                  {color}
                  <span className="ml-1 text-xs cursor-pointer">×</span>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add color (e.g. blue)"
                value={colorInput}
                onChange={e => setColorInput(e.target.value)}
                className="border rounded-lg p-1 w-28"
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addColorTag())}
              />
              <button
                type="button"
                onClick={addColorTag}
                className="ml-1 flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 hover:bg-blue-400 text-2xl font-bold text-white transition"
                style={{ minWidth: "2rem", minHeight: "2rem", padding: 0 }}
                aria-label="Add color"
              >
                +
              </button>
            </div>
          </div>
          {/* Item Tags */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Tags (Type, Brand, etc.)</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {itemTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-gray-300 text-gray-700 mr-2"
                  onClick={() => removeItemTag(tag)}
                  title="Remove tag"
                >
                  {tag}
                  <span className="ml-1 text-xs cursor-pointer">×</span>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add tag (e.g. Nike, hoodie)"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                className="border rounded-lg p-1 w-40"
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addItemTag())}
              />
              <button
                type="button"
                onClick={addItemTag}
                className="ml-1 flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 hover:bg-blue-400 text-2xl font-bold text-white transition"
                style={{ minWidth: "2rem", minHeight: "2rem", padding: 0 }}
                aria-label="Add tag"
              >
                +
              </button>
            </div>
          </div>
          {/* Description */}
          <textarea
            className="border rounded-lg w-full mb-4 p-2 bg-white/70 placeholder-gray-400"
            placeholder="Item Description"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          {/* Submit */}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
          >
            Add Item
          </button>
        </form>
      </div>
    </div>
  );
}