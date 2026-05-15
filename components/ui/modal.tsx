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

const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" };

export function Modal({ isOpen, onClose, title, children, size = "md", className }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#1a1a1a]/40 z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 12 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cn(
                "bg-white border-2 border-[#1a1a1a] rounded-2xl w-full pointer-events-auto",
                sizes[size],
                className
              )}
            >
              {title && (
                <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#1a1a1a]">
                  <h2 className="text-sm font-bold tracking-tight">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-[#f5f0e8] rounded-lg transition-colors border border-transparent hover:border-[#1a1a1a]"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
              <div className={cn(!title && "relative")}>
                {!title && (
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 hover:bg-[#f5f0e8] rounded-lg transition-colors z-10 border border-transparent hover:border-[#1a1a1a]"
                  >
                    <X size={15} />
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
