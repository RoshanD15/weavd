import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HamburgerMenu({ onClick, show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white shadow rounded"
          onClick={onClick}
          aria-label="Open sidebar"
          initial={{ x: -80, opacity: 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -80, opacity: 0 }}           
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <span className="block w-6 h-0.5 bg-black mb-1"></span>
          <span className="block w-6 h-0.5 bg-black mb-1"></span>
          <span className="block w-6 h-0.5 bg-black"></span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}