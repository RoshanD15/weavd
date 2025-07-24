import React, { useState } from "react";
import { uploadImage } from "../utils/uploadImage";
import { useSession } from '@supabase/auth-helpers-react';

const GROUP_PALETTE = [
  "#00aaff", "#4caf50", "#f9a825", "#e040fb", "#ff5252", "#ff9800"
];

async function fetchVisionLabels(imageUrls) {
  const response = await fetch("http://localhost:4000/vision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrls }),
  });
  const data = await response.json();
  return data.results;
}

export default function AddItemsModal({ show, onClose, onAdd }) {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [colorTags, setColorTags] = useState([]);
  const [itemTags, setItemTags] = useState([]);
  const [colorInput, setColorInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [showGrid, setShowGrid] = useState(false);

  // UX State
  const [loadingAI, setLoadingAI] = useState(false);

  // Grouping
  const [selectedImages, setSelectedImages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupColors, setGroupColors] = useState([]);

  const session = useSession();

  if (!show) return null;

  // Helpers
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setGroups(prevGroups =>
      prevGroups
        .map(group =>
          group.filter(i => i !== idx).map(i => (i > idx ? i - 1 : i))
        )
        .filter(group => group.length > 0)
    );
    setSelectedImages(prevSelected =>
      prevSelected.filter(i => i !== idx).map(i => (i > idx ? i - 1 : i))
    );
  };

  const addColorTag = () => {
    if (colorInput && !colorTags.includes(colorInput)) {
      setColorTags([...colorTags, colorInput]);
      setColorInput("");
    }
  };
  const removeColorTag = (tag) => setColorTags(colorTags.filter((t) => t !== tag));
  const addItemTag = () => {
    if (tagInput && !itemTags.includes(tagInput)) {
      setItemTags([...itemTags, tagInput]);
      setTagInput("");
    }
  };
  const removeItemTag = (tag) => setItemTags(itemTags.filter((t) => t !== tag));

  // Grouping helpers
  const handleSelectGrid = idx => {
    if (selectedImages.includes(idx)) {
      setSelectedImages(selectedImages.filter(i => i !== idx));
    } else if (selectedImages.length < 5) {
      setSelectedImages([...selectedImages, idx]);
    }
  };
  const handleGroupImages = () => {
    if (selectedImages.length === 0) return;
    setGroups(prev => [...prev, [...selectedImages]]);
    setGroupColors(prev => [...prev, GROUP_PALETTE[prev.length % GROUP_PALETTE.length]]);
    setSelectedImages([]);
  };
  const findGroupIdx = (imgIdx) => groups.findIndex(group => group.includes(imgIdx));
  const selectedGroupIdx = groups.findIndex(
    g => g.length === selectedImages.length && selectedImages.every(idx => g.includes(idx))
  );

  //   NEW: Vision on grouping done  
  const handleDoneGrouping = async () => {
    setLoadingAI(true);
    try {
      const userId = session?.user?.id || "anonymous";
      const groupedImageFiles = groups.map(g => g.map(idx => images[idx]));
      const mainGroup = groupedImageFiles[0] || (images.length ? images : []);
      let uploadedUrls = [];
      for (let file of mainGroup) {
        const url = await uploadImage(file, userId);
        uploadedUrls.push(url);
      }
      console.log("Uploading images to Supabase and sending these URLs to Vision:", uploadedUrls);
      const visionResults = await fetchVisionLabels(uploadedUrls);

      // Autofill tags and description using Vision labels (first image) 
      if (visionResults && visionResults.length) {
  // Labels
  if (visionResults[0].labels) {
    setItemTags(prev => Array.from(new Set([...prev, ...visionResults[0].labels])));
    setDescription(prev => prev ? prev : `AI: ${visionResults[0].labels.join(", ")}`);
  }
  // Brands
  if (visionResults[0].brands && visionResults[0].brands.length) {
    setItemTags(prev => Array.from(new Set([...prev, ...visionResults[0].brands, ...prev])));
  }
  // Colors
  if (visionResults[0].colors && visionResults[0].colors.length) {
    setColorTags(visionResults[0].colors);
  }
}
setImages(uploadedUrls);
    } catch (err) {
      alert("Image upload or Vision failed: " + err.message);
    }
    setLoadingAI(false);
    setShowGrid(false);
  };

  //   Submit after AI suggestions  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Everything is already uploaded/AI'd, just call onAdd
    const userId = session?.user?.id || "anonymous";
    const groupedImageFiles = groups.map(g => g.map(idx => images[idx]));
    const mainGroup = groupedImageFiles[0] || (images.length ? images : []);
    let uploadedUrls = [];
    for (let file of mainGroup) {
      // If file is a string, it's already a URL; if File, needs upload
      if (typeof file === "string") uploadedUrls.push(file);
    }
    onAdd({
      itemName,
      description,
      images: uploadedUrls,
      colorTags,
      itemTags,
      allGroups: groupedImageFiles,
    });
    // Reset
    setItemName(""); setDescription(""); setImages([]);
    setColorTags([]); setItemTags([]); setGroups([]); setGroupColors([]);
  };

  // Render helper for images
  const renderImage = (img) => {
    if (img instanceof File || img instanceof Blob) {
      return URL.createObjectURL(img);
    } else if (typeof img === "string") {
      return img;
    }
    return "";
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {/* Loading overlay */}
      {loadingAI && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-8"></div>
          <div className="text-xl font-bold text-gray-700">Analyzing images with AI…</div>
        </div>
      )}

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
        style={{
          WebkitBackdropFilter: "blur(20px)",
          filter: loadingAI ? "blur(3px)" : "none",
          pointerEvents: loadingAI ? "none" : "auto",
        }}
      >
        {/*   Select/Group Overlay Grid   */}
        {showGrid && (
          <div
            className="absolute inset-0 bg-white/95 flex flex-col justify-between items-center rounded-2xl z-50 p-6"
            style={{
              height: "70vh",
              animation: "fadeIn 0.15s"
            }}
          >
            {/* Grid of images */}
            <div className="w-full grid grid-cols-4 gap-6 mb-8 max-h-[340px] overflow-y-auto">
              {images.map((img, idx) => {
                const groupIdx = findGroupIdx(idx);
                const borderColor = groupIdx !== -1
                  ? groupColors[groupIdx]
                  : selectedImages.includes(idx)
                    ? "#1976d2"
                    : "transparent";
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectGrid(idx)}
                    style={{
                      width: "100px",
                      height: "100px",
                      border: `4px solid ${borderColor}`,
                      borderRadius: "18px",
                      overflow: "hidden",
                      boxShadow: selectedImages.includes(idx)
                        ? "0 0 0 2px #1976d2"
                        : groupIdx !== -1
                          ? `0 0 0 4px ${borderColor}99`
                          : "",
                      cursor: "pointer",
                      margin: "0 auto"
                    }}
                  >
                    <img
                      src={renderImage(img)}
                      alt={`grid-img-${idx}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block"
                      }}
                    />
                  </div>
                );
              })}
            </div>
            {/* Group and Done Buttons */}
            <div
              className="w-full flex gap-6 justify-center"
              style={{
                position: "absolute",
                left: 0,
                bottom: 120,
                padding: "0 2vw",
                zIndex: 102,
                background: "rgba(247, 247, 247, 0.95)",
                borderRadius: "0 0 1.2rem 1.2rem",
                boxShadow: "0 -4px 24px #0001"
              }}
            >
              {selectedGroupIdx !== -1 ? (
                <button
                  className="flex-1 py-3 rounded-full bg-black hover:bg-red-800 text-white shadow transition font-bold"
                  onClick={() => {
                    setGroups(groups.filter((_, i) => i !== selectedGroupIdx));
                    setGroupColors(groupColors.filter((_, i) => i !== selectedGroupIdx));
                    setSelectedImages([]);
                  }}
                >
                  Ungroup
                </button>
              ) : (
                <button
                  className="flex-1 py-3 rounded-full bg-black hover:bg-blue-800 text-white shadow transition font-bold"
                  disabled={selectedImages.length === 0}
                  onClick={handleGroupImages}
                >
                  Group ({selectedImages.length || "0"} / 5)
                </button>
              )}
              <button
                className="flex-1 py-3 rounded-full bg-red-700 hover:bg-red-900 text-white shadow transition font-bold"
                onClick={handleDoneGrouping}
              >
                Done
              </button>
            </div>
            {/* Close grid button */}
            <button
              onClick={() => { setShowGrid(false); setSelectedImages([]); }}
              className="absolute top-4 right-4 text-2xl text-black"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        )}

        {/*   Main Modal Content (fades/disables under overlay)   */}
        <div style={{
          opacity: showGrid ? 0.18 : 1,
          pointerEvents: showGrid ? "none" : "auto",
          transition: "opacity 0.18s"
        }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-2xl"
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-6 text-center">Add Clothing Item</h2>
          <form onSubmit={handleSubmit}>
            {/*   Fan Layout   */}
            <div
              className="mb-0"
              style={{
                height: "240px",
                overflow: "hidden",
                position: "relative",
                marginBottom: "60px",
                width: "100vw",
                maxWidth: "100%",
              }}
            >
              <div
                className="flex items-end weavd-scroll"
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
                {/* Plus Card */}
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
                    zIndex: 200,
                  }}
                >
                  +
                </label>
                {(groups.length > 0
                  ? groups[0]
                  : images.map((_, idx) => idx)
                ).map(idx => {
                  const img = images[idx];
                  const isHovered = hoveredIdx === idx;
                  const groupIdx = findGroupIdx(idx);
                  return (
                    <div
                      key={idx}
                      className="relative"
                      style={{
                        zIndex: isHovered ? 9999 : 100 - idx,
                        minWidth: "112px",
                        width: "112px",
                        height: "160px",
                        marginLeft: idx === 0 ? "-28px" : "-28px",
                        overflow: "visible",
                        alignSelf: "flex-end",
                        pointerEvents: "auto",
                      }}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      <img
                        src={renderImage(img)}
                        alt="preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          border: groupIdx !== -1
                            ? `4px solid ${groupColors[groupIdx]}`
                            : "4px solid transparent",
                          borderRadius: "18px",
                          background: "#eee",
                          boxShadow: isHovered ? "0 8px 36px #0003" : "",
                          pointerEvents: "auto",
                        }}
                        draggable={false}
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
                  );
                })}
              </div>
            </div>
            {/* Select / Group Photos button */}
            {images.length > 0 && !showGrid && (
              <button
                type="button"
                className="mt-2 mb-3 w-full py-2 rounded-full bg-gray-400 hover:bg-gray-500 text-white font-semibold shadow transition"
                onClick={() => setShowGrid(true)}
              >
                Select / Group Photos
              </button>
            )}
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
    </div>
  );
}