import React, { useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useHexagonStore } from "@/lib/stores/useHexagonStore";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Download, Share2, Eye, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAudio } from "@/lib/stores/useAudio";

interface ControlPanelProps {
  colorblindMode: boolean;
  setColorblindMode: (value: boolean) => void;
  animationSpeed: number;
  setAnimationSpeed: (value: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  colorblindMode,
  setColorblindMode
}) => {
  const gridRef = useRef<HTMLElement | null>(null);
  const { isGenerating, generateNewPattern } = useHexagonStore();
  const { playSuccess } = useAudio();

  // Handler for generating new pattern
  const handleGeneratePattern = () => {
    generateNewPattern();
    playSuccess();
  };

  const handleSaveImage = async () => {
    try {
      const fileName = `animalien-pattern-${Date.now()}`;
      
      // Get the main title element
      const titleElement = document.querySelector('h1.text-4xl.md\\:text-6xl.font-bold') as HTMLElement;
      
      // Get the element that contains both the title and the hexagon grid
      const hexagonWithTitle = document.getElementById('hexagon-with-title') as HTMLElement;
      
      if (!hexagonWithTitle) {
        toast.error("No se pudo encontrar el hexágono para descargar");
        return;
      }
      
      // Get background color of the app container
      const appContainer = document.getElementById('app-container') as HTMLElement;
      const bgColorStyle = window.getComputedStyle(appContainer).backgroundColor;
      const backgroundColor = bgColorStyle || "#111827";
      
      console.log("Color de fondo detectado:", backgroundColor);
      
      // Get the hexagon grid element directly
      const hexagonGridEl = document.querySelector('[data-testid^="hexagon-"]')?.closest('.relative') as HTMLElement;
      
      if (!hexagonGridEl) {
        toast.error("No se pudo encontrar el hexágono principal para descargar");
        return;
      }
      
      // Create a new div to hold the title and hexagon with minimal spacing
      const combinedElement = document.createElement('div');
      combinedElement.style.display = 'flex';
      combinedElement.style.flexDirection = 'column';
      combinedElement.style.alignItems = 'center';
      combinedElement.style.justifyContent = 'center';
      combinedElement.style.backgroundColor = backgroundColor;
      combinedElement.style.padding = '20px';
      combinedElement.style.width = '600px'; // Fixed width
      combinedElement.style.margin = '0 auto';
      
      // Add the title to the combined element
      if (titleElement) {
        const titleClone = titleElement.cloneNode(true) as HTMLElement;
        titleClone.style.marginBottom = '10px';
        titleClone.style.color = 'white';
        titleClone.style.fontSize = '48px';
        titleClone.style.textAlign = 'center';
        titleClone.style.fontWeight = 'bold';
        combinedElement.appendChild(titleClone);
      }
      
      // Clone the hexagon grid and adjust it
      const hexagonGridClone = hexagonGridEl.cloneNode(true) as HTMLElement;
      hexagonGridClone.style.transform = 'scale(1)'; // Prevent distortion
      hexagonGridClone.style.width = '500px';
      hexagonGridClone.style.height = '500px';
      hexagonGridClone.style.margin = '0 auto';
      hexagonGridClone.style.display = 'flex';
      hexagonGridClone.style.alignItems = 'center';
      hexagonGridClone.style.justifyContent = 'center';
      
      combinedElement.appendChild(hexagonGridClone);
      
      // Temporarily append to document to capture (will be removed later)
      document.body.appendChild(combinedElement);
      
      // Capture the combined element
      const dataUrl = await toPng(combinedElement, { 
        backgroundColor: backgroundColor,
        quality: 0.95,
        canvasWidth: 600,
        canvasHeight: 600,
        pixelRatio: 2
      });
      
      // Remove the temporary element
      document.body.removeChild(combinedElement);
      
      // Convert PNG to JPEG
      const image = new Image();
      image.src = dataUrl;
      
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Parse the background color if it's in rgba format
          let fillColor = backgroundColor;
          
          // Handle rgba format
          if (backgroundColor.startsWith('rgba') || backgroundColor.startsWith('rgb')) {
            // Extract RGB values
            const rgbValues = backgroundColor.match(/\d+/g);
            if (rgbValues && rgbValues.length >= 3) {
              const r = parseInt(rgbValues[0]);
              const g = parseInt(rgbValues[1]);
              const b = parseInt(rgbValues[2]);
              fillColor = `rgb(${r}, ${g}, ${b})`;
            }
          }
          
          console.log("Color de fondo aplicado:", fillColor);
          
          // Fill background explicitly
          ctx.fillStyle = fillColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw the image on top
          ctx.drawImage(image, 0, 0);
          
          // Convert to JPEG
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
          
          // Download as JPEG
          downloadImage(jpegDataUrl, `${fileName}.jpg`);
          toast.success("Imagen JPEG guardada con título");
        } else {
          // Fallback to PNG if canvas context not available
          downloadImage(dataUrl, `${fileName}.png`);
          toast.success("Imagen PNG guardada (modo alternativo)");
        }
      };
      
      image.onerror = () => {
        console.error("Error al cargar la imagen para conversión");
        // Fallback to PNG if image loading fails
        downloadImage(dataUrl, `${fileName}.png`);
        toast.success("Imagen PNG guardada (modo alternativo)");
      };
    } catch (error) {
      console.error("Error al guardar la imagen:", error);
      toast.error("No se pudo guardar la imagen");
    }
  };

  const downloadImage = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!gridRef.current) {
      // Try to get the hexagon grid element if not already set
      let parentElement = document.querySelector('[data-testid^="hexagon-"]')?.closest('.relative') as HTMLElement | null;
      while (parentElement && parentElement.children.length < 5) {
        parentElement = parentElement.parentElement?.closest('.relative') as HTMLElement | null;
      }
      gridRef.current = parentElement;
    }

    if (!gridRef.current) {
      toast.error("No se pudo encontrar el patrón de hexágonos para compartir");
      return;
    }

    try {
      // Generate PNG for sharing
      const dataUrl = await toPng(gridRef.current, { 
        backgroundColor: 'transparent',
        quality: 0.8
      });

      // Check if Web Share API is available
      if (navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "animalien-pattern.png", { type: "image/png" });
        
        await navigator.share({
          title: "Patrón ANIMALIEN",
          text: "¡Mira este patrón ANIMALIEN que he creado!",
          files: [file]
        });
        toast.success("Patrón compartido exitosamente");
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText("¡Mira el generador de patrones ANIMALIEN!");
        toast.success("Enlace copiado al portapapeles", {
          description: "¡Comparte esto con tus amigos para que creen sus propios patrones!"
        });
      }
    } catch (error) {
      console.error("Error al compartir:", error);
      toast.error("No se pudo compartir el patrón");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full max-w-2xl"
    >
      <Card className="bg-white/95 shadow-xl border-blue-300 rounded-xl">
        <CardContent className="space-y-6 pt-6 pb-6 px-6">
          {/* Generate new pattern button */}
          <Button 
            onClick={handleGeneratePattern}
            disabled={isGenerating}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-4 bg-blue-900 hover:bg-blue-950 text-white rounded-md",
              isGenerating && "opacity-70 cursor-not-allowed"
            )}
            size="lg"
          >
            <RefreshCw className={cn(
              "w-5 h-5",
              isGenerating && "animate-spin"
            )} />
            Generar Nuevo Patrón
          </Button>
          
          {/* Colorblind mode button */}
          <Button
            onClick={() => setColorblindMode(!colorblindMode)}
            disabled={isGenerating}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3",
              colorblindMode 
                ? "bg-blue-900 hover:bg-blue-950 text-white" 
                : "bg-blue-900 hover:bg-blue-950 text-white",
              "rounded-md transition-colors"
            )}
          >
            <Eye className="w-4 h-4" />
            <span>{colorblindMode ? "Modo Daltonismo Activado" : "Modo Daltonismo"}</span>
          </Button>
          
          {/* Export controls */}
          <div className="pt-4 border-t border-blue-200 text-center">
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button 
                onClick={handleSaveImage}
                className="flex items-center justify-center bg-blue-900 hover:bg-blue-950 text-white"
                disabled={isGenerating}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar JPEG
              </Button>
              <Button 
                onClick={handleShare}
                className="flex items-center justify-center bg-blue-900 hover:bg-blue-950 text-white"
                disabled={isGenerating}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>
          
          <div className="pt-2 text-sm text-center font-medium">
            <p className="text-blue-900">
              Este generador crea patrones para las misiones secretas del juego de mesa ANIMALIEN.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ControlPanel;
