
import { FaPlus } from "react-icons/fa";

export default function FloatingAddButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-6 right-6
        bg-white/30 dark:bg-gray-900/30
        backdrop-blur-xl
        border border-white/40 dark:border-gray-700
        rounded-full w-16 h-16
        flex items-center justify-center
        shadow-lg shadow-black/10 dark:shadow-black/50
        text-3xl
        z-50
        transition-all duration-300
        hover:bg-white/50 dark:hover:bg-gray-900/50
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-primary
      "
      style={{ WebkitBackdropFilter: "blur(20px)" }} // Safari support
      aria-label="Add Fragrance"
    >
      <FaPlus className="text-gray-500 dark:text-gray-300" />
    </button>
  );
}