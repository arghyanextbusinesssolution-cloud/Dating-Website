"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const MaskContainer = ({
  children,
  revealText,
  size = 30,
  revealSize = 500,
  className,
}: {
  children?: string | React.ReactNode;
  revealText?: string | React.ReactNode;
  size?: number;
  revealSize?: number;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState<any>({ x: null, y: null });
  const containerRef = useRef<any>(null);

  const updateMousePosition = (e: any) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", updateMousePosition);
      return () => {
        container.removeEventListener("mousemove", updateMousePosition);
      };
    }
  }, []);

  const maskSize = isHovered ? revealSize : size;

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative w-full h-full overflow-hidden", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background layer with reveal text */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl">
        {revealText}
      </div>

      {/* Masked layer with children content */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          maskImage: 'url(/mask.svg)',
          maskSize: `${maskSize}px`,
          maskRepeat: 'no-repeat',
          maskPosition: mousePosition.x !== null && mousePosition.y !== null
            ? `${mousePosition.x - maskSize / 2}px ${mousePosition.y - maskSize / 2}px`
            : 'center',
          WebkitMaskImage: 'url(/mask.svg)',
          WebkitMaskSize: `${maskSize}px`,
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: mousePosition.x !== null && mousePosition.y !== null
            ? `${mousePosition.x - maskSize / 2}px ${mousePosition.y - maskSize / 2}px`
            : 'center',
        }}
        animate={{
          maskSize: `${maskSize}px`,
        }}
        transition={{
          maskSize: { duration: 0.3, ease: "easeOut" },
        }}
      >
        <motion.div 
          className="bg-gradient-to-br from-purple-900 to-pink-900 text-white rounded-3xl w-full h-full flex items-center justify-center p-8"
          animate={!isHovered ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={!isHovered ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
