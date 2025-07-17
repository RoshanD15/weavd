
import { FaPlus } from "react-icons/fa";

export default function FloatingAddButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-6 right-6
        bg-white/30
        backdrop-blur-xl
        border border-white/40
        rounded-full w-16 h-16
        flex items-center justify-center
        shadow-lg
        text-3xl
        z-50
        transition-all
        hover:bg-white/50
      "
      style={{ WebkitBackdropFilter: "blur(20px)" }} // for Safari support
      aria-label="Add Fragrance"
    >
      <FaPlus className="text-gray-500" />
    </button>
  );
}