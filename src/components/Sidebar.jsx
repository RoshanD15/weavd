import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar({ open, setOpen }) {
    return (
      <>
        {/* Overlay for mobile */}
        {open && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
        <div
          className={`
            fixed top-0 left-0 h-full w-56 bg-white shadow-lg z-30 transition-transform duration-300
            ${open ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:relative md:shadow-none md:bg-gray-100 md:h-screen
          `}
        >
          {/* Close button (mobile only) */}
          <button
            className="md:hidden absolute top-4 right-4 p-2 text-2xl"
            onClick={() => setOpen(false)}
          >
            &times;
          </button>
          <h2 className="font-bold text-xl m-6 mb-8">MyScents</h2>
          <nav className="flex flex-col gap-4 px-6">
            <Link to="/explore" onClick={() => setOpen(false)} className="hover:text-primary">Explore</Link>
            <Link to="/collection" onClick={() => setOpen(false)} className="hover:text-primary">Collection</Link>
            <Link to="/favorites" onClick={() => setOpen(false)} className="hover:text-primary">Favorites</Link>
            <Link to="/profile" onClick={() => setOpen(false)} className="hover:text-primary">Profile</Link>
          </nav>
        </div>
      </>
    );
  }