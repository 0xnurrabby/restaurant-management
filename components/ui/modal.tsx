"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className,
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "bg-white border-2 border-black rounded-2xl w-full",
                sizes[size],
                className
              )}
            >
              {title && (
                <div className="flex items-center justify-between p-4 border-b-2 border-stone-100">
                  <h2 className="text-base font-semibold">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className={cn(!title && "relative")}>
                {!title && (
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 hover:bg-stone-100 rounded-lg transition-colors z-10"
                  >
                    <X size={16} />
                  </button>
                )}
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
