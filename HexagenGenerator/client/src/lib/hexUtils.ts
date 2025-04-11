// This file contains utility functions and constants for the hexagon grid

// Define the coordinates for the 19 hexagons within the large hexagon
// Arranged with the large hexagon having a vertex pointing up
export const hexPositions = [
  // Center
  { x: 0, y: 0 },
  
  // First ring (6 hexagons around center)
  { x: 0, y: -1 },         // Top
  { x: 0.866, y: -0.5 },   // Top right
  { x: 0.866, y: 0.5 },    // Bottom right
  { x: 0, y: 1 },          // Bottom
  { x: -0.866, y: 0.5 },   // Bottom left
  { x: -0.866, y: -0.5 },  // Top left
  
  // Second ring (12 hexagons - outer ring)
  { x: 0, y: -2 },         // Far top
  { x: 0.866, y: -1.5 },   // Top right (second ring)
  { x: 1.732, y: -1 },     // Top right corner
  { x: 1.732, y: 0 },      // Right
  { x: 1.732, y: 1 },      // Bottom right corner
  { x: 0.866, y: 1.5 },    // Bottom right (second ring)
  { x: 0, y: 2 },          // Far bottom
  { x: -0.866, y: 1.5 },   // Bottom left (second ring)
  { x: -1.732, y: 1 },     // Bottom left corner
  { x: -1.732, y: 0 },     // Left
  { x: -1.732, y: -1 },    // Top left corner
  { x: -0.866, y: -1.5 },  // Top left (second ring)
];

// Define the six colors we'll use with the exact colors specified
export const hexColors = [
  { color: "#ff5757", name: "rojo" },      // Rojo (Red)
  { color: "#38b6ff", name: "azul" },      // Azul (Blue)
  { color: "#ffbd59", name: "amarillo" },  // Amarillo (Yellow)
  { color: "#7ed957", name: "verde" },     // Verde (Green)
  { color: "#8c52ff", name: "morado" },    // Morado (Purple)
  { color: "#b07b4a", name: "marrón" },    // Marrón (Brown)
];

// Function to check if two hexagons at grid positions are adjacent
export const areAdjacent = (pos1: number, pos2: number): boolean => {
  const p1 = hexPositions[pos1];
  const p2 = hexPositions[pos2];
  
  // Calculate the Euclidean distance between the two positions
  const distance = Math.sqrt(
    Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
  );
  
  // Hexagons are adjacent if they are approximately 1 unit apart
  // Adding a small epsilon for floating point comparison
  return Math.abs(distance - 1) < 0.1;
};

// Function to generate unique and non-adjacent positions for the colored hexagons
export const generateNonAdjacentPositions = (count: number, availablePositions?: number[]): number[] => {
  const positions: number[] = [];
  // Use provided positions or all positions
  const positionPool = availablePositions 
    ? [...availablePositions] 
    : Array.from({ length: hexPositions.length }, (_, i) => i);
  
  // Shuffle the position pool
  for (let i = positionPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positionPool[i], positionPool[j]] = [positionPool[j], positionPool[i]];
  }
  
  while (positions.length < count && positionPool.length > 0) {
    const nextPos = positionPool.pop()!;
    
    // Check if this position is adjacent to any already selected position
    const isAdjacent = positions.some(pos => areAdjacent(pos, nextPos));
    
    if (!isAdjacent) {
      positions.push(nextPos);
    }
  }
  
  return positions;
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
