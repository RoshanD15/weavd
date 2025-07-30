import React from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="
          max-w-md w-full
          bg-white/30 dark:bg-gray-900/30
          rounded-2xl shadow-lg
          border border-white/40 dark:border-gray-700
          backdrop-blur-xl
          flex flex-col items-center
          px-8 py-10
          transition-colors
        "
        style={{ WebkitBackdropFilter: "blur(18px)" }}
      >
        <h1 className="text-3xl font-bold mb-3 text-primary dark:text-blue-300">
          Welcome to weavd!
        </h1>
        <p className="text-base text-gray-800 dark:text-gray-100 mb-8 text-center">
          Track, discover, and share your Closet.
        </p>
        <div className="flex flex-col gap-3 w-full mb-4">
          <button
            className="px-4 py-2 bg-primary dark:bg-blue-700 text-white rounded-lg font-medium shadow hover:bg-blue-300 dark:hover:bg-blue-600 transition"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="px-4 py-2 bg-accent dark:bg-green-700 text-white rounded-lg font-medium shadow hover:bg-green-400 dark:hover:bg-green-600 transition"
            onClick={() => navigate("/SignUp")}
          >
            Join
          </button>
        </div>
        <Link
          to="/Explore"
          className="underline text-sm text-primary dark:text-blue-300 hover:text-accent dark:hover:text-green-400 transition-colors cursor-pointer"
        >
          Skip
        </Link>
      </div>
    </div>
  );
}