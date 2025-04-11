import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hexagon from "./Hexagon";
import { useHexagonStore } from "@/lib/stores/useHexagonStore";
import { cn } from "@/lib/utils";
import { hexPositions, hexColors } from "@/lib/hexUtils";
import { useAudio } from "@/lib/stores/useAudio";

interface HexagonGridProps {
  colorblindMode: boolean;
  animationSpeed: number;
  backgroundColor?: string;
}

// Patterns for colorblind mode
const patterns = ["lines", "dots", "zigzag", "grid", "cross", "waves"];

const HexagonGrid: React.FC<HexagonGridProps> = ({ 
  colorblindMode, 
  animationSpeed,
  backgroundColor = "transparent" 
}) => {
  const { 
    hexagons, 
    generateNewPattern,
    isGenerating,
    customColors
  } = useHexagonStore();
  
  const [gridKey, setGridKey] = useState(0);
  const { playSuccess } = useAudio();
  
  useEffect(() => {
    if (!hexagons.length) {
      generateNewPattern();
    }
  }, [generateNewPattern, hexagons.length]);

  // Calculate the size based on viewport
  const calculateHexSize = () => {
    // Get the smallest dimension (width or height)
    const smallestDimension = Math.min(
      window.innerWidth * 0.8,
      window.innerHeight * 0.7
    );
    
    // Size for each small hexagon
    return smallestDimension / 10;
  };

  const hexSize = calculateHexSize();
  // Used for calculating center position
  const centerSize = hexSize * 3;
  
  // Get colorblind patterns for each colored hexagon
  const getPatternForColor = (colorIndex: number) => {
    return patterns[colorIndex % patterns.length];
  };

  // Use custom colors if available, otherwise use default colors
  const getColorData = (colorIndex: number | null) => {
    if (colorIndex === null) {
      return { color: "#ffffff", name: "blanco" }; // Default white
    }
    
    // Use custom colors if available
    if (customColors.length >= 6) {
      return customColors[colorIndex];
    }
    
    // Otherwise use default colors
    return hexColors[colorIndex];
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      {/* Background div with specified color if any */}
      {backgroundColor !== "transparent" && (
        <div className="absolute inset-0 rounded-xl" style={{ backgroundColor }} />
      )}
      
      {/* Hexagon grid container */}
      <div className="relative">
        {/* Inner hexagons - no large background hexagon */}
        <AnimatePresence mode="sync">
          <div key={gridKey} className="relative" style={{ width: `${hexSize * 6}px`, height: `${hexSize * 6}px` }}>
            {hexagons.map((hexagon) => {
              const position = hexPositions[hexagon.position];
              const colorData = getColorData(hexagon.colorIndex);
              
              // Use our predefined center position
              const centerX = centerSize;
              const centerY = centerSize;
              
              return (
                <div
                  key={hexagon.id}
                  className="absolute"
                  style={{
                    left: `${position.x * hexSize + centerX}px`,
                    top: `${position.y * hexSize + centerY}px`,
                    transform: "translate(-50%, -50%) rotate(30deg)", // Rotate to reduce gaps
                  }}
                >
                  <Hexagon
                    size={hexSize * 0.95} // Slightly smaller but larger than before
                    color={colorData.color}
                    colorName={colorData.name}
                    pattern={hexagon.colorIndex !== null ? getPatternForColor(hexagon.colorIndex) : undefined}
                    isColorblind={colorblindMode}
                    animationSpeed={animationSpeed}
                    id={hexagon.id}
                    position={hexagon.position} // Pass position to display
                  />
                </div>
              );
            })}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HexagonGrid;
