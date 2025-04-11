import { create } from "zustand";
import { generateNonAdjacentPositions, generateId } from "../hexUtils";

export interface Hexagon {
  id: string;
  position: number; // Index in the hexPositions array
  colorIndex: number | null; // Index in the hexColors array or null for default
}

export type ColorDefinition = {
  color: string;
  name: string;
};

interface HexagonState {
  hexagons: Hexagon[];
  isGenerating: boolean;
  customColors: ColorDefinition[]; // Custom colors defined by the user
  previousPositions: number[]; // Store previous colored positions to avoid similar patterns
  generateNewPattern: () => void;
  setCustomColors: (colors: ColorDefinition[]) => void;
  // Vertex positions to exclude (positions that must remain white)
  vertexPositions: number[];
}

// Define the positions that we want to exclude from colored hexagons
// Based on user's selection of exact positions that should always be white
const vertexPositions = [7, 9, 11, 13, 15, 17];

export const useHexagonStore = create<HexagonState>((set, get) => ({
  hexagons: [],
  isGenerating: false,
  customColors: [], // Empty by default, will use default colors if not set
  previousPositions: [], // Start with empty array for previous positions
  vertexPositions,
  
  setCustomColors: (colors: ColorDefinition[]) => {
    set({ customColors: colors });
  },
  
  generateNewPattern: () => {
    set({ isGenerating: true });
    
    // Simulate processing delay for better animation effect
    setTimeout(() => {
      const { vertexPositions, previousPositions } = get();
      
      // Filter out the vertex positions from available positions
      // (the positions that should always be white)
      const availablePositions = Array.from({ length: 19 }, (_, i) => i)
        .filter(pos => !vertexPositions.includes(pos));
      
      // Get the positions of the hexagons in the inner ring (1-6) - these are adjacent to center
      const innerRingPositions = [1, 2, 3, 4, 5, 6];
      
      // Ensure we have at least 2-3 colored hexagons in the inner ring
      // to avoid patterns with all inner ring hexagons being white
      let coloredPositions: number[] = [];
      
      // Generate a custom pattern with inner ring hexagons included
      let attempts = 0;
      const maxAttempts = 15;
      let bestDifference = 0;
      let bestPattern: number[] = [];
      
      while (attempts < maxAttempts) {
        // Step 1: First, randomly select 2-3 hexagons from the inner ring to be colored
        const innerRingOptions = [...innerRingPositions]
          .filter(pos => !vertexPositions.includes(pos)) // Remove any inner ring positions that must be white
          .sort(() => Math.random() - 0.5); // Shuffle them
        
        // Take 2-3 of them randomly
        const innerRingCount = Math.floor(Math.random() * 2) + 2; // 2-3 inner ring hexagons
        const selectedInnerRing = innerRingOptions.slice(0, innerRingCount);
        
        // Step 2: Select remaining positions from the outer ring and others
        const remainingAvailable = availablePositions
          .filter(pos => !selectedInnerRing.includes(pos))
          .sort(() => Math.random() - 0.5);
        
        // Complete the pattern to have exactly 6 positions
        const candidatePositions = [
          ...selectedInnerRing,
          ...remainingAvailable.slice(0, 6 - selectedInnerRing.length)
        ];
        
        // Calculate how different this pattern is from the previous one
        const difference = previousPositions.length === 0 ? 6 : 
          candidatePositions.filter(pos => !previousPositions.includes(pos)).length;
        
        // If this pattern is more different than our best so far, use it
        if (difference > bestDifference) {
          bestPattern = candidatePositions;
          bestDifference = difference;
          
          // If we found a very different pattern, we can stop early
          if (difference >= 5) {
            break;
          }
        }
        
        attempts++;
      }
      
      // Use the best pattern we found
      coloredPositions = bestPattern;
      
      // If we somehow couldn't generate a good pattern, fall back to random selection
      if (coloredPositions.length < 6) {
        const shuffled = [...availablePositions].sort(() => Math.random() - 0.5);
        coloredPositions = shuffled.slice(0, 6);
      }
      
      // Create the new hexagons array
      const newHexagons: Hexagon[] = [];
      
      // Add all 19 hexagons - 6 colored and 13 default
      for (let i = 0; i < 19; i++) {
        const coloredIndex = coloredPositions.indexOf(i);
        
        newHexagons.push({
          id: generateId(),
          position: i,
          colorIndex: coloredIndex !== -1 ? coloredIndex : null
        });
      }
      
      // Store the positions we used for next time
      set({ 
        hexagons: newHexagons,
        previousPositions: coloredPositions,
        isGenerating: false
      });
    }, 500);
  }
}));
