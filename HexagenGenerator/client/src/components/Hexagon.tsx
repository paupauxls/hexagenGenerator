import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface HexagonProps {
  size: number;
  color?: string;
  colorName?: string;
  pattern?: string;
  isColorblind?: boolean;
  animationSpeed?: number;
  id: string;
  isLarge?: boolean;
  position?: number; // Added position prop to display the index
}

const Hexagon: React.FC<HexagonProps> = ({
  size,
  color = "#e5e7eb", // Default to gray-200
  colorName,
  pattern,
  isColorblind = false,
  animationSpeed = 0.5,
  id,
  isLarge = false,
  position, // Position to display
}) => {
  // Calculate the dimensions for a regular hexagon - with vertex pointing up
  const height = size;
  const width = Math.sqrt(3) * size / 2;
  
  // Compute the hexagon points with vertex pointing up
  const points = [
    `${width/2},0`,             // Top vertex
    `${width},${height/4}`,     // Top right
    `${width},${3*height/4}`,   // Bottom right
    `${width/2},${height}`,     // Bottom vertex
    `0,${3*height/4}`,          // Bottom left
    `0,${height/4}`,            // Top left
  ].join(" ");

  // New animation - fade in with slight scale
  return (
    <motion.div
      className="relative"
      initial={isLarge ? {} : { opacity: 0, scale: 0.8 }}
      animate={isLarge ? {} : { opacity: 1, scale: 1 }}
      exit={isLarge ? {} : { opacity: 0, scale: 0.8 }}
      transition={{
        type: isLarge ? "tween" : "spring",
        stiffness: 260,
        damping: 25,
        duration: isLarge ? 0 : 0.5
      }}
      style={{ width: `${width}px`, height: `${height}px` }}
      data-color={colorName}
      data-testid={`hexagon-${id}`}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {isColorblind && pattern ? (
          <>
            <defs>
              <pattern id={`pattern-${id}`} patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
                {pattern === "lines" && (
                  <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="2" />
                )}
                {pattern === "dots" && (
                  <circle cx="5" cy="5" r="2" fill="currentColor" />
                )}
                {pattern === "zigzag" && (
                  <path d="M0,0 L5,10 L10,0" stroke="currentColor" strokeWidth="2" fill="none" />
                )}
                {pattern === "grid" && (
                  <>
                    <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1="0" x2="10" y2="0" stroke="currentColor" strokeWidth="1" />
                  </>
                )}
                {pattern === "cross" && (
                  <>
                    <line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="2" />
                    <line x1="5" y1="0" x2="5" y2="10" stroke="currentColor" strokeWidth="2" />
                  </>
                )}
                {pattern === "waves" && (
                  <path d="M0,5 C2.5,2.5 7.5,7.5 10,5" stroke="currentColor" strokeWidth="2" fill="none" />
                )}
              </pattern>
            </defs>
            <polygon 
              points={points} 
              fill={color} 
              stroke="transparent"
              strokeWidth={0}
            />
            <polygon 
              points={points} 
              fill={`url(#pattern-${id})`} 
              stroke="transparent"
              strokeWidth={0}
              style={{ color: "rgba(0,0,0,0.5)" }}
            />
          </>
        ) : (
          <>
            <polygon 
              points={points} 
              fill={color} 
              stroke="transparent"
              strokeWidth={0}
            />
            {/* Position numbers disabled as requested */}
          </>
        )}
      </svg>
    </motion.div>
  );
};

export default Hexagon;
