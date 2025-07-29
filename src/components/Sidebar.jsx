import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Sidebar({ open, setOpen }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const alwaysOpen = windowWidth >= 768;
  const expanded = open || alwaysOpen;

  // Optional: close mobile sidebar when going to desktop
  useEffect(() => {
    if (windowWidth >= 768) {
      setOpen(false);
    }
  }, [windowWidth, setOpen]);

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-20 z-20 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`
          z-30
          bg-white/30 dark:bg-gray-900/50 backdrop-blur-xl border border-white/40 dark:border-gray-700 shadow-lg dark:shadow-black/50
          transition-all duration-500
          overflow-hidden flex flex-col
          ${expanded ? "w-56 h-[90vh] rounded-2xl" : "w-20 h-12 rounded-2xl"}
          fixed top-6 left-6
          md:relative md:top-0 md:left-0 md:h-screen md:w-56 md:rounded-b-2xl md:rounded-t-none md:shadow-none md:bg-gray-100 dark:md:bg-gray-900 md:border-none md:backdrop-blur-none
        `}
        style={{ WebkitBackdropFilter: "blur(20px)" }}
      >
        {/* Hamburger icon - only show when not expanded (mobile only) */}
        {!expanded && (
          <button
            className="w-full h-full flex items-center justify-center md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open sidebar"
          >
            <div className="relative w-8 h-6">
              <span className="absolute h-0.5 w-8 bg-gray-800 dark:bg-gray-200 rounded top-0 left-0 transition-all duration-300"></span>
              <span className="absolute h-0.5 w-8 bg-gray-800 dark:bg-gray-200 rounded top-2.5 left-0 transition-all duration-300"></span>
              <span className="absolute h-0.5 w-8 bg-gray-800 dark:bg-gray-200 rounded top-5 left-0 transition-all duration-300"></span>
            </div>
          </button>
        )}
        {/* Sidebar content - show when expanded (always on desktop) */}
        {expanded && (
          <div className="flex flex-col h-full">
            {/* Close button - mobile only */}
            {!alwaysOpen && (
              <button
                className="absolute top-4 right-4 p-2 text-2xl md:hidden text-gray-900 dark:text-gray-200"
                onClick={() => setOpen(false)}
                aria-label="Close sidebar"
              >
                &times;
              </button>
            )}
            <h2 className="font-bold text-xl m-6 mb-8 text-gray-900 dark:text-gray-100">weavd</h2>
            <nav className="flex flex-col gap-4 px-6">
              <Link
                to="/explore"
                onClick={() => setOpen(false)}
                className="text-gray-900 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
              >
                Explore
              </Link>
              <Link
                to="/Closet"
                onClick={() => setOpen(false)}
                className="text-gray-900 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
              >
                MyCloset
              </Link>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="text-gray-900 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
              >
                Profile
              </Link>
            </nav>
          </div>
        )}
      </div>
    </>
  );
}