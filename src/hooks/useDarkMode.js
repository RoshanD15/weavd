import { useState, useEffect } from "react";

export default function useDarkMode() {
  // Initialize state from localStorage or system preference
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false; // SSR safe
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Apply/remove dark class and save preference whenever darkMode changes
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  return [darkMode, setDarkMode];
}