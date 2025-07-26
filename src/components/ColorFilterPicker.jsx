import React, { useRef, useEffect, useState } from "react";
import { Saturation, Hue, hsvaToHex, hexToHsva } from "@uiw/react-color";

export default function ColorFilterPicker({ color, setColor }) {
  const [show, setShow] = useState(false);
  const pickerRef = useRef(null);

  // We use HSVA for color management
  const [hsva, setHsva] = useState(() => hexToHsva(color || "#fff"));

  // Keep in sync with parent
  useEffect(() => {
    if (color && hsvaToHex(hsva) !== color) setHsva(hexToHsva(color));
  }, [color]);

  useEffect(() => {
    setColor(hsvaToHex(hsva));
  }, [hsva]);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShow(false);
      }
    }
    if (show) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [show]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        className="w-8 h-8 rounded-full border border-gray-300"
        style={{ background: color || "#fff", boxShadow: color ? "0 0 0 2px #000" : undefined }}
        onClick={() => setShow(v => !v)}
        title="Pick a color"
      />
      {show && (
        <div
          ref={pickerRef}
          style={{
            position: "absolute",
            left: 0,
            top: "120%",
            zIndex: 20,
            borderRadius: "1.5rem",
            background: "rgba(255,255,255,0.8)",
            boxShadow: "0 8px 32px 0 rgba(31,38,135,0.23)",
            padding: 18,
            minWidth: 240
          }}
        >
          {/* X Close Button */}
          <button
            onClick={() => setShow(false)}
            style={{
              position: "absolute",
              top: 12,
              right: 16,
              background: "transparent",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
              color: "#222",
            }}
            aria-label="Close color picker"
          >×</button>
          <div style={{ width: 200, marginBottom: 12 }}>
            <Saturation
              hsva={hsva}
              onChange={newHsva => setHsva({ ...hsva, ...newHsva })}
              style={{ width: 200, height: 160, borderRadius: 16 }}
            />
          </div>
          <div style={{ width: 200 }}>
            <Hue
              hue={hsva.h}
              onChange={hue => setHsva({ ...hsva, h: hue })}
              style={{ width: 200, height: 16, borderRadius: 8 }}
              direction="horizontal"
            />
          </div>
        </div>
      )}
      {color && (
        <button className="ml-2 text-xs underline" onClick={() => setColor("")}>Clear</button>
      )}
    </div>
  );
}