import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WelcomeToastProps {
  name: string;
}

export const WelcomeToast: React.FC<WelcomeToastProps> = ({ name }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => setShow(false), 5500);
    return () => clearTimeout(timer);
  }, [name]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="fixed bottom-6 right-6 z-[9999] bg-gradient-to-br from-primary to-primary/80 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 w-[90vw] max-w-xs md:max-w-sm lg:max-w-md"
          style={{ pointerEvents: 'none' }}
        >
          <span className="text-2xl">👋</span>
          <div>
            <div className="font-bold text-lg">Welcome, {name}!</div>
            <div className="text-sm text-white/80">Glad to see you back. Have a productive day!</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
