import React, { useState, useEffect } from "react";
import { uploadImageToFirebase } from "../utils/uploadImage";
import { moveImageInFirebase } from "../utils/moveImageInFirebase";
import { deleteImageFromFirebase } from "../utils/deleteImage";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

function timeoutPromise(promise, ms = 6000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Vision API timeout")), ms))
  ]);
}

async function fetchVisionLabels(imageUrls) {
  return timeoutPromise(
    fetch(`${backendUrl}/vision`, { 
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

export default function AddItemsModal({ show, images, onAdd, onClose }) {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [colorTags, setColorTags] = useState([]);
  const [itemTags, setItemTags] = useState([]);
  const [colorInput, setColorInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [uploadedTempObjs, setUploadedTempObjs] = useState([]);
  const [user] = useAuthState(auth);

  const MAX_COLOR_TAGS = 5;
  const MAX_ITEM_TAGS = 5;

  // AI autofill on mount with images
  useEffect(() => {
    async function runVision() {
      setLoadingAI(true);
      try {
        // Ensure all images are URLs (upload if File)
        const urlsAndObjs = await Promise.all(images.map(async (img) => {
          if (img.url) return img;
          if (img instanceof File) {
            const uploaded = await uploadImageToFirebase(img, user.uid);
            setUploadedTempObjs(prev => [...prev, uploaded]);
            return uploaded;
          }
          return img;
        }));
        const urls = urlsAndObjs.map(img => img.url);
        const visionResults = await fetchVisionLabels(urls);
        if (visionResults && visionResults.length) {
          if (visionResults[0].labels) {
            setItemTags(Array.from(new Set(visionResults[0].labels)).slice(0, MAX_ITEM_TAGS));
            setDescription(`AI: ${visionResults[0].labels.slice(0, MAX_ITEM_TAGS).join(", ")}`);
          }
          if (visionResults[0].brands && visionResults[0].brands.length) {
            setItemTags(prev => Array.from(new Set([...prev, ...visionResults[0].brands])).slice(0, MAX_ITEM_TAGS));
          }
          if (visionResults[0].colors && visionResults[0].colors.length) {
            setColorTags(Array.from(new Set(visionResults[0].colors)).slice(0, MAX_COLOR_TAGS));
          }
        }
      } catch (err) {
        alert("Image upload or Vision failed: " + (err && err.message ? err.message : String(err)));
      }
      setLoadingAI(false);
    }
    if (show && images && images.length > 0 && user) {
      setItemName(""); setDescription(""); setColorTags([]); setItemTags([]);
      setColorInput(""); setTagInput("");
      setUploadedTempObjs([]);
      runVision();
    }
  }, [show, images, user]);

  // Tag helpers
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

  // Final submit: only keep used images, clean up the rest
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure all images are uploaded and "moved" if temp
    const finalUploaded = await Promise.all(
      images.map(async (img) => {
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

    setItemName(""); setDescription("");
    setColorTags([]); setItemTags([]);
    setColorInput(""); setTagInput("");
  };

  // Modal close: cleanup temp images
  const handleModalClose = async () => {
    await Promise.all(uploadedTempObjs.map(imgObj => imgObj.path && deleteImageFromFirebase(imgObj.path)));
    setUploadedTempObjs([]);
    setItemName(""); setDescription(""); setColorTags([]); setItemTags([]);
    setColorInput(""); setTagInput("");
    if (onClose) onClose();
  };

  // For rendering local files
  const renderImage = (img) => {
    if (!img) return "";
    if (img instanceof File || img instanceof Blob) return URL.createObjectURL(img);
    if (typeof img === "object" && img.url) return img.url;
    return "";
  };

  return show ? (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {loadingAI && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-8"></div>
          <div className="text-xl font-bold text-gray-700">Analyzing images with AI…</div>
        </div>
      )}
      <div className="w-[98vw] max-w-[480px] sm:max-w-[96vw] sm:w-[34rem] bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl relative p-2 sm:p-8 flex flex-col overflow-x-hidden overflow-y-auto"
        style={{ WebkitBackdropFilter: "blur(20px)", minHeight: 'min(80vh, 540px)', maxHeight: '96vh', filter: loadingAI ? "blur(3px)" : "none", pointerEvents: loadingAI ? "none" : "auto" }}>
        <button onClick={handleModalClose} className="absolute top-4 right-4 text-2xl" aria-label="Close">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-center">Add Clothing Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex items-end gap-2 overflow-x-auto mb-4">
            {images.map((img, idx) => (
              <img key={idx} src={renderImage(img)} alt="preview" style={{ width: "100px", height: "140px", objectFit: "cover", borderRadius: "12px", background: "#eee" }} />
            ))}
          </div>
          <input className="border p-2 rounded w-full mb-4 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            type="text" placeholder="Item Name (e.g., 'Red Hoodie')" value={itemName} onChange={e => setItemName(e.target.value)} required />
          {/* Colors Section */}
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-gray-900 dark:text-gray-100">Colors</label>
            <div className="flex items-center gap-2 mb-2 overflow-x-auto">
              {colorTags.map((color, idx) => (
                <span key={idx} className="relative flex-shrink-0" style={{ width: 36, height: 36, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="rounded-full border border-gray-300" style={{ width: 32, height: 32, backgroundColor: color, display: "inline-block", boxShadow: "0 1px 4px #0001" }} title={color} />
                  <button onClick={() => removeColorTag(color)} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-xs text-gray-600 border shadow hover:bg-red-100 hover:text-red-700"
                    style={{ lineHeight: 1, padding: 0, fontWeight: "bold", border: "1px solid #eee" }} title="Remove color" tabIndex={-1}>×</button>
                </span>
              ))}
              <input type="text" placeholder="Add color" value={colorInput} onChange={e => setColorInput(e.target.value)}
                className="border rounded-lg p-1 w-40 bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addColorTag())} />
              <button type="button" onClick={addColorTag} className="ml-1 flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 hover:bg-blue-400 text-2xl font-bold text-white transition"
                aria-label="Add color" style={{ minWidth: "2rem", minHeight: "2rem", padding: 0 }}>+</button>
            </div>
          </div>
          {/* Item Tags */}
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-gray-900 dark:text-gray-100">Tags (Type, Brand, etc.)</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {itemTags.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full bg-gray-300 text-gray-700 mr-2"
                  onClick={() => removeItemTag(tag)} title="Remove tag">
                  {tag}
                  <span className="ml-1 text-xs cursor-pointer">×</span>
                </span>
              ))}
              <input type="text" placeholder="Add tag (e.g. Nike, hoodie)" value={tagInput} onChange={e => setTagInput(e.target.value)}
                className="border rounded-lg p-1 w-40 bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addItemTag())} />
              <button type="button" onClick={addItemTag}
                className="ml-1 flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 hover:bg-blue-400 text-2xl font-bold text-white transition"
                style={{ minWidth: "2rem", minHeight: "2rem", padding: 0 }} aria-label="Add tag">+</button>
            </div>
          </div>
          {/* Description */}
          <textarea className="border rounded-lg w-full mb-4 p-2 bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            placeholder="Item Description" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full">
            Add Item
          </button>
        </form>
      </div>
    </div>
  ) : null;
}