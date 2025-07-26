import React, { useState } from "react";
import { uploadImageToFirebase } from "../utils/uploadImage";
import { deleteImageFromFirebase } from "../utils/deleteImage";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { moveImageInFirebase } from "../utils/moveImageInFirebase";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; 

const GROUP_PALETTE = [
  "#00aaff", "#4caf50", "#f9a825", "#e040fb", "#ff5252", "#ff9800"
];

function timeoutPromise(promise, ms = 6000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Vision API timeout")), ms))
  ]);
}

async function fetchVisionLabels(imageUrls) {
  // Try Vision, but give up after 6s (adjust as you like)
  return timeoutPromise(
    fetch("http://localhost:4000/vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrls }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Vision API error");
        return res.json();
      })
      .then(data => data.results),
    6000
  );
}

export default function AddItemsModal({ show, onClose, onAdd }) {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); // [File or { url, path }]
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [colorTags, setColorTags] = useState([]);
  const [itemTags, setItemTags] = useState([]);
  const [colorInput, setColorInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [showGrid, setShowGrid] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupColors, setGroupColors] = useState([]);
  const [uploadedTempObjs, setUploadedTempObjs] = useState([]); // [{ url, path }]
  const MAX_COLOR_TAGS = 5;
  const MAX_ITEM_TAGS = 5;

  const [user] = useAuthState(auth);
  if (!show) return null;

  // Tag helpers (unchanged)
  const addColorTag = () => {
    if (
      colorInput &&
      !colorTags.includes(colorInput) &&
      colorTags.length < MAX_COLOR_TAGS
    ) {
      setColorTags([...colorTags, colorInput]);
      setColorInput("");
    }
  };
  const removeColorTag = (tag) => setColorTags(colorTags.filter((t) => t !== tag));
  const addItemTag = () => {
    if (
      tagInput &&
      !itemTags.includes(tagInput) &&
      itemTags.length < MAX_ITEM_TAGS
    ) {
      setItemTags([...itemTags, tagInput]);
      setTagInput("");
    }
  };
  const removeItemTag = (tag) => setItemTags(itemTags.filter((t) => t !== tag));

  // 1. Image upload handler (preview only)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]); // Just local File objects!
  };

  // Remove image (and cleanup)
  const removeImage = (idx) => {
    let imgObj;
    setImages(prev => {
      imgObj = prev[idx];
      return prev.filter((_, i) => i !== idx);
    });
    if (imgObj && typeof imgObj === "object" && imgObj.path) {
      deleteImageFromFirebase(imgObj.path);
      setUploadedTempObjs(urls => urls.filter(u => u.path !== imgObj.path));
    }
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

  // Group helpers
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

  // Vision (AI autofill) (unchanged)
  async function autofillFromAI(groupImageObjs) {
    setLoadingAI(true);
    try {
      const urls = groupImageObjs.map(obj => obj.url);
      const visionResults = await fetchVisionLabels(urls);
      if (visionResults && visionResults.length) {
        if (visionResults[0].labels) {
          setItemTags(
            Array.from(new Set(visionResults[0].labels)).slice(0, MAX_ITEM_TAGS)
          );
          setDescription(`AI: ${visionResults[0].labels.slice(0, MAX_ITEM_TAGS).join(", ")}`);
        }
        if (visionResults[0].brands && visionResults[0].brands.length) {
          setItemTags(prev =>
            Array.from(new Set([...prev, ...visionResults[0].brands])).slice(0, MAX_ITEM_TAGS)
          );
        }
        if (visionResults[0].colors && visionResults[0].colors.length) {
          setColorTags(
            Array.from(new Set(visionResults[0].colors)).slice(0, MAX_COLOR_TAGS)
          );
        }
      }
    } catch (err) {
      alert("Image upload or Vision failed: " + (err && err.message ? err.message : String(err)));
    }
    setLoadingAI(false);
  }

  // 2. Done Grouping: uploads the group images, runs AI, swaps in URLs
  const handleDoneGrouping = async () => {
    setLoadingAI(true);
    try {
      // Only process first group for autofill
      const groupedImageObjs = groups.map(g => g.map(idx => images[idx]));
      const mainGroup = groupedImageObjs[0] || (images.length ? images : []);
      // Upload any local Files
      const uploaded = await Promise.all(
        mainGroup.map(async (img) => {
          if (img instanceof File) {
            return await uploadImageToFirebase(img, user.uid);
          }
          return img;
        })
      );
      // Swap in URLs/paths for this group in the images array
      setImages(imgs =>
        imgs.map((img, idx) =>
          groups[0].includes(idx) && img instanceof File
            ? uploaded[groups[0].indexOf(idx)]
            : img
        )
      );
      setUploadedTempObjs(uploaded); // Only what you uploaded
      await autofillFromAI(uploaded);
    } catch (err) {
      alert("Image upload or Vision failed: " + err.message);
    }
    setLoadingAI(false);
    setShowGrid(false);
  };

  // Modal close: cleanup temp images (unchanged)
  const handleModalClose = async () => {
    await Promise.all(uploadedTempObjs.map(imgObj => imgObj.path && deleteImageFromFirebase(imgObj.path)));
    setUploadedTempObjs([]);
    setItemName(""); setDescription(""); setImages([]);
    setColorTags([]); setItemTags([]); setGroups([]); setGroupColors([]);
    setSelectedImages([]); setShowGrid(false);
    setColorInput(""); setTagInput("");
    if (onClose) onClose();
  };

  // Final submit: only keep used images, clean up the rest (unchanged)
  const handleSubmit = async (e) => {
  e.preventDefault();

  const groupedImageObjs = groups.map(g => g.map(idx => images[idx]));
  const mainGroup = groupedImageObjs[0] || (images.length ? images : []);

  const finalUploaded = await Promise.all(
    mainGroup.map(async (img) => {
      if (img instanceof File) {
        return await uploadImageToFirebase(img, user.uid, false);
      } else if (img.path && img.path.startsWith('temp/')) {
        return await moveImageInFirebase(img.path, user.uid);
      }
      return img;
    })
  );

  const usedPaths = new Set(finalUploaded.map(obj => obj.path));
  const unusedTempObjs = uploadedTempObjs.filter(obj => !usedPaths.has(obj.path));
  await Promise.all(
    unusedTempObjs.map(obj => obj.path && deleteImageFromFirebase(obj.path))
  );
  setUploadedTempObjs([]);

  const postData = {
    userId: user.uid,
    itemName,
    description,
    images: finalUploaded,
    colorTags,
    itemTags,
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "posts"), postData);
    if (onAdd) onAdd(postData);
  } catch (err) {
    alert("Failed to save post: " + err.message);
  }

  setItemName(""); setDescription(""); setImages([]);
  setColorTags([]); setItemTags([]); setGroups([]);
  setGroupColors([]); setSelectedImages([]); setShowGrid(false);
  setColorInput(""); setTagInput("");
};

  // Image rendering (unchanged)
  const renderImage = (img) => {
    if (!img) return "";
    if (img instanceof File || img instanceof Blob) return URL.createObjectURL(img);
    if (typeof img === "object" && img.url) return img.url;
    return "";
  };

  // --- RENDER ---
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
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
          w-[98vw] max-w-[480px] sm:max-w-[96vw] sm:w-[34rem]
          bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl
          relative p-2 sm:p-8 flex flex-col
          overflow-x-hidden overflow-y-auto
        "
        style={{
          WebkitBackdropFilter: "blur(20px)",
          minHeight: 'min(80vh, 540px)',
          maxHeight: '96vh',
          filter: loadingAI ? "blur(3px)" : "none",
          pointerEvents: loadingAI ? "none" : "auto",
        }}
      >
        {/* Select/Group Overlay Grid */}
        {showGrid && (
          <div
            className="absolute inset-0 bg-white/95 flex flex-col justify-between items-center rounded-2xl z-50 p-6"
            style={{ height: "70vh", animation: "fadeIn 0.15s" }}
          >
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
            <button
              onClick={() => { setShowGrid(false); setSelectedImages([]); }}
              className="absolute top-4 right-4 text-2xl text-black"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        )}

        {/* Main Modal Content */}
        <div style={{
          opacity: showGrid ? 0.18 : 1,
          pointerEvents: showGrid ? "none" : "auto",
          transition: "opacity 0.18s"
        }}>
          <button
            onClick={handleModalClose}
            className="absolute top-4 right-4 text-2xl"
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-6 text-center">Add Clothing Item</h2>
          <form onSubmit={handleSubmit}>
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
                {(images.length > 0 
  ? (groups.length > 0 && Array.isArray(groups[0]) ? groups[0] : images.map((_, idx) => idx))
  : []
).map((idx) => {
                  const img = images[idx];
                  const isHovered = hoveredIdx === idx;
                  const groupIdx = findGroupIdx(idx);

                   const inGroup = Array.isArray(groups[0]) && groups[0].includes(idx);
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
              className="border p-2 rounded w-full mb-4
             bg-white text-gray-900
             dark:bg-gray-800 dark:text-gray-100"
              type="text"
              placeholder="Item Name (e.g., 'Red Hoodie')"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              required
            />
            {/* Colors Section */}
            <div className="mb-4">
              <label className="block font-semibold mb-1 text-gray-900 dark:text-gray-100">Colors</label>
              <div
                className="flex items-center gap-2 mb-2 overflow-x-auto"
                style={{ maxWidth: "100%", paddingBottom: 2 }}
              >
                {colorTags.map((color, idx) => (
                  <span
                    key={idx}
                    className="relative flex-shrink-0"
                    style={{ width: 36, height: 36, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <span
                      className="rounded-full border border-gray-300"
                      style={{
                        width: 32,
                        height: 32,
                        backgroundColor: color,
                        display: "inline-block",
                        boxShadow: "0 1px 4px #0001"
                      }}
                      title={color}
                    />
                    <button
                      onClick={() => removeColorTag(color)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-xs text-gray-600 border shadow hover:bg-red-100 hover:text-red-700"
                      style={{ lineHeight: 1, padding: 0, fontWeight: "bold", border: "1px solid #eee" }}
                      title="Remove color"
                      tabIndex={-1}
                    >×</button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add color"
                  value={colorInput}
                  onChange={e => setColorInput(e.target.value)}
                  className="border rounded-lg p-1 w-40 bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addColorTag())}
                />
                <button
                  type="button"
                  onClick={addColorTag}
                  className="ml-1 flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 hover:bg-blue-400 text-2xl font-bold text-white transition"
                  aria-label="Add color"
                  style={{ minWidth: "2rem", minHeight: "2rem", padding: 0 }}
                >
                  +
                </button>
              </div>
            </div>
            {/* Item Tags */}
            <div className="mb-4">
              <label className="block font-semibold mb-1 text-gray-900 dark:text-gray-100">Tags (Type, Brand, etc.)</label>
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
                 className="border rounded-lg p-1 w-40 bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
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
              className="border rounded-lg w-full mb-4 p-2 bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
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