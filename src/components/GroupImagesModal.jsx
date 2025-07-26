import React, { useState } from "react";
import { uploadImageToFirebase } from "../utils/uploadImage";
import { deleteImageFromFirebase } from "../utils/deleteImage";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const GROUP_PALETTE = [
  "#00aaff", "#4caf50", "#f9a825", "#e040fb", "#ff5252", "#ff9800"
];

export default function GroupImagesModal({ show, onClose, onGroupsReady }) {
  const [images, setImages] = useState([]); // [File or { url, path }]
  const [selectedImages, setSelectedImages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupColors, setGroupColors] = useState([]);
  const [uploadedTempObjs, setUploadedTempObjs] = useState([]);
  const [user] = useAuthState(auth);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const isInAnyGroup = idx => groups.some(group => group.includes(idx));
  const groupOf = idx => groups.find(group => group.includes(idx));
  
  if (!show) return null;

  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  // Remove image
  const removeImage = (idx) => {
    let imgObj;
    setImages(prev => {
      imgObj = prev[idx];
      return prev.filter((_, i) => i !== idx);
    });
    if (imgObj && imgObj.path) {
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

  // Grouping logic
  const handleSelectGrid = idx => {
  const group = groupOf(idx);
  if (group) {
    // Select all in group if any clicked (unless already selected)
    const allSelected = group.every(i => selectedImages.includes(i));
    if (!allSelected) {
      setSelectedImages(group);
    } else {
      setSelectedImages([]); // Deselect all
    }
  } else {
    // Not in a group: toggle selection for grouping
    if (selectedImages.includes(idx)) {
      setSelectedImages(selectedImages.filter(i => i !== idx));
    } else {
      setSelectedImages([...selectedImages, idx]);
    }
  }
};
  const handleGroupImages = () => {
    if (selectedImages.length === 0) return;
    const updatedGroups = [...groups, [...selectedImages]];
    setGroups(updatedGroups);
    setGroupColors(prev => [...prev, GROUP_PALETTE[prev.length % GROUP_PALETTE.length]]);
    setSelectedImages([]);
  };
  const findGroupIdx = (imgIdx) => groups.findIndex(group => group.includes(imgIdx));
  const selectedGroupIdx = groups.findIndex(
      g => selectedImages.some(idx => g.includes(idx))
);

  // Cleanup temp images if modal closed
  const handleModalClose = async () => {
    await Promise.all(uploadedTempObjs.map(imgObj => imgObj.path && deleteImageFromFirebase(imgObj.path)));
    setUploadedTempObjs([]);
    setImages([]); setGroups([]); setGroupColors([]); setSelectedImages([]);
    if (onClose) onClose();
  };

  // Done grouping: pass data to parent, then close
  const handleDoneGrouping = () => {
    onGroupsReady({ images, groups });
    handleModalClose(); // Cleans up modal state
  };

  // For rendering local files
  const renderImage = (img) => {
    if (!img) return "";
    if (img instanceof File || img instanceof Blob) return URL.createObjectURL(img);
    if (typeof img === "object" && img.url) return img.url;
    return "";
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="
          w-[98vw] max-w-[480px] sm:max-w-[96vw] sm:w-[34rem]
          bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl
          relative p-2 sm:p-8 flex flex-col
          overflow-x-hidden overflow-y-auto
        "
        style={{ WebkitBackdropFilter: "blur(20px)", minHeight: 'min(80vh, 540px)', maxHeight: '96vh' }}
      >
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 text-2xl"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Add Photos and Group Per Post</h2>
        {/* Image grid for grouping */}
        <div className="mb-4">
          <input id="file-upload" type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
          <label
  htmlFor="file-upload"
  className="cursor-pointer flex items-center justify-center border-2 border-gray-400 bg-gray-300 text-3xl rounded-[10px] transition hover:bg-gray-100"
  style={{
    width: "52px",
    height: "52px",
    minWidth: "52px",
    minHeight: "52px",
    margin: "4px",
    fontWeight: "bold",
    userSelect: "none",
  }}
  title="Add photos"
>
  +
</label>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
{images.map((img, idx) => {
  const groupIdx = findGroupIdx(idx);
  const isHovered = hoveredIdx === idx;
  const isInSelectedGroup = groupIdx !== -1 && selectedImages.length && groups[groupIdx].every(i => selectedImages.includes(i));
  const isSelected = selectedImages.includes(idx);

  let borderColor = "transparent";

  if (isHovered) {
    borderColor = "#fff"; // 1. Hovered: white border
  } else if (isInSelectedGroup || isSelected) {
    borderColor = "#1976d2"; // 2. Selected (single or group): blue border
  } else if (groupIdx !== -1) {
    borderColor = groupColors[groupIdx]; // 3. Group color if not selected/hovered
  }

  return (
    <div
      key={idx}
      onClick={() => handleSelectGrid(idx)}
      onMouseEnter={() => setHoveredIdx(idx)}
      onMouseLeave={() => setHoveredIdx(null)}
      style={{
        width: "120px",
        height: "160px",
        border: `4px solid ${borderColor}`,
        borderRadius: "14px",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        transition: "border-color 0.18s"
      }}
    >
      <img
        src={renderImage(img)}
        alt={`grid-img-${idx}`}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {/* X button... */}
    </div>
  );
})}
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          {selectedGroupIdx !== -1 ? (
            <button
              className="flex-1 py-2 rounded bg-black hover:bg-red-800 text-white"
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
              className="flex-1 py-2 rounded bg-black hover:bg-blue-800 text-white"
              disabled={selectedImages.length === 0}
              onClick={handleGroupImages}
            >
              Group ({selectedImages.length || "0"} / 5)
            </button>
          )}
          <button
  className={`flex-1 py-2 rounded text-white transition
    ${groups.length === 0
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-700 hover:bg-blue-900"}
  `}
  onClick={handleDoneGrouping}
  disabled={groups.length === 0}
>
  Done
</button>
        </div>
      </div>
    </div>
  );
}