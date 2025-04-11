import { useState } from "react";
import HexagonGrid from "./components/HexagonGrid";
import ControlPanel from "./components/ControlPanel";

import { Toaster } from "sonner";
import { motion } from "framer-motion";

function App() {
  const [colorblindMode, setColorblindMode] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(0.5); // Value between 0 and 1
  const [backgroundColor, setBackgroundColor] = useState("#111827"); // Dark background

  return (
    <>
      <div 
        id="app-container"
        className="flex flex-col items-center justify-center min-h-screen w-full py-8"
        style={{ backgroundColor }}
      >
        {/* Center container for everything */}
        <div className="flex flex-col items-center justify-center max-w-6xl mx-auto px-4 w-full">
          {/* Title */}
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-center mb-8 text-white"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            ANIMALIEN
          </motion.h1>
          
          {/* Main content with title and hexagon grid - This div will be captured for downloads */}
          <motion.div 
            id="hexagon-with-title"
            className="flex flex-col items-center justify-center w-full mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Hexagon grid container */}
            <div className="w-full h-[400px] md:h-[450px] flex items-center justify-center">
              <HexagonGrid 
                colorblindMode={colorblindMode} 
                animationSpeed={animationSpeed}
                backgroundColor={backgroundColor}
              />
            </div>
          </motion.div>
          
          {/* Control panel - positioned below the hexagon grid */}
          <div className="w-full max-w-xl mx-auto">
            <ControlPanel 
              colorblindMode={colorblindMode}
              setColorblindMode={setColorblindMode}
              animationSpeed={animationSpeed}
              setAnimationSpeed={setAnimationSpeed}
            />
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
