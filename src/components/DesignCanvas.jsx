import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Download, PencilRuler, Pipette, Trash2, 
  Move, Maximize, Minimize, Type, X, Palette,
  Copy
} from "lucide-react";
import html2canvas from "html2canvas";

const DesignCanvas = ({ 
  isOpen, 
  onClose, 
  colorPalette = [],
  onExtractColor,
  selectedImages = []
}) => {
  const [canvasItems, setCanvasItems] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  const [extractedElements, setExtractedElements] = useState({
    colors: [],
    typography: []
  });
  const canvasRef = useRef(null);
  const [isColorPickerActive, setIsColorPickerActive] = useState(false);
  const [isTypoPickerActive, setIsTypoPickerActive] = useState(false);

  // Load selected images when the component mounts or when selectedImages changes
  useEffect(() => {
    // Only process images when the canvas is actually open
    if (isOpen && selectedImages && selectedImages.length > 0) {
      // Clear existing canvasItems when canvas opens
      if (canvasItems.length === 0) {
        // Convert selected images to canvas item format
        const newItems = selectedImages.map((img, index) => {
          // Use either image.image or image.url, whichever is available
          const imageSrc = img.image || img.url;
          
          if (!imageSrc) {
            console.warn("Image has no src property:", img);
            return null;
          }
          
          return {
            id: `item-${Date.now()}-${index}`,
            type: 'image',
            src: imageSrc,
            title: img.title || 'Canvas Image',
            position: {
              x: Math.random() * (canvasSize.width/2 - 200) + 100,
              y: Math.random() * (canvasSize.height/2 - 200) + 100
            },
            size: { width: 200, height: 200 },
            rotation: 0,
            zIndex: index
          };
        }).filter(item => item !== null); // Remove any null items
        
        if (newItems.length > 0) {
          setCanvasItems(newItems);
        }
      }
    }
  }, [isOpen, selectedImages]);

  // Add an image to the canvas
  const addImageToCanvas = (image) => {
    const newItem = {
      id: `item-${Date.now()}`,
      type: 'image',
      src: image.image || image.url || image,
      title: image.title || 'Canvas Image',
      position: {
        x: Math.random() * (canvasSize.width/2 - 200) + 100,
        y: Math.random() * (canvasSize.height/2 - 200) + 100
      },
      size: { width: 200, height: 200 },
      rotation: 0,
      zIndex: canvasItems.length
    };
    
    setCanvasItems([...canvasItems, newItem]);
  };

  // Handle image drag
  const handleDrag = (id, info) => {
    setCanvasItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, position: { x: info.point.x, y: info.point.y } } 
          : item
      )
    );
  };

  // Handle item removal
  const removeItem = (id) => {
    setCanvasItems(prevItems => prevItems.filter(item => item.id !== id));
    if (activeItem === id) setActiveItem(null);
  };

  // Activate an item
  const activateItem = (id) => {
    setActiveItem(id);
    // Bring to front by setting highest z-index
    setCanvasItems(prevItems => {
      const highestZ = Math.max(...prevItems.map(item => item.zIndex), 0);
      return prevItems.map(item => 
        item.id === id ? { ...item, zIndex: highestZ + 1 } : item
      );
    });
  };

  // Extract color from an image
  const extractColorFromImage = (imageElement) => {
    if (!imageElement) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    
    context.drawImage(imageElement, 0, 0);
    
    // Sample colors from different parts of the image
    const colorPoints = [
      { x: canvas.width * 0.25, y: canvas.height * 0.25 },
      { x: canvas.width * 0.75, y: canvas.height * 0.25 },
      { x: canvas.width * 0.25, y: canvas.height * 0.75 },
      { x: canvas.width * 0.75, y: canvas.height * 0.75 },
      { x: canvas.width * 0.5, y: canvas.height * 0.5 },
    ];
    
    const extractedColors = colorPoints.map(point => {
      const pixel = context.getImageData(point.x, point.y, 1, 1).data;
      return `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
    });
    
    // Filter out duplicates
    const uniqueColors = [...new Set(extractedColors)];
    
    setExtractedElements(prev => ({
      ...prev,
      colors: [...prev.colors, ...uniqueColors]
    }));
    
    if (onExtractColor) {
      onExtractColor(uniqueColors);
    }
  };

  // Extract "typography" (this is simulated in our case)
  const extractTypography = () => {
    // In a real app, this would use image recognition or OCR
    // Here we'll simulate it with some preset typography styles
    const fontStyles = [
      { name: 'Heading', family: 'Inter', weight: 700, size: '24px' },
      { name: 'Subheading', family: 'Inter', weight: 600, size: '18px' },
      { name: 'Body Text', family: 'Inter', weight: 400, size: '16px' }
    ];
    
    setExtractedElements(prev => ({
      ...prev,
      typography: [...prev.typography, ...fontStyles]
    }));
    
    setIsTypoPickerActive(false);
  };

  // Handle color picker click
  const handleColorPickerClick = () => {
    setIsColorPickerActive(!isColorPickerActive);
    if (isTypoPickerActive) setIsTypoPickerActive(false);
  };

  // Handle typography picker click
  const handleTypoPickerClick = () => {
    setIsTypoPickerActive(!isTypoPickerActive);
    if (isColorPickerActive) setIsColorPickerActive(false);
  };

  // Export canvas as image
  const downloadCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const canvasImage = await html2canvas(canvas, {
        backgroundColor: '#121212',
        allowTaint: true,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `design-canvas-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvasImage.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading canvas:', error);
    }
  };

  // Zoom in/out
  const handleZoom = (delta) => {
    setZoomLevel(prev => {
      const newZoom = prev + delta;
      return Math.min(Math.max(0.5, newZoom), 2);
    });
  };

  // Clear all items from canvas
  const clearCanvas = () => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      setCanvasItems([]);
      setActiveItem(null);
    }
  };

  // Duplicate an item
  const duplicateItem = (item) => {
    const newItem = {
      ...item,
      id: `item-${Date.now()}`,
      position: {
        x: item.position.x + 20,
        y: item.position.y + 20
      },
      zIndex: Math.max(...canvasItems.map(i => i.zIndex), 0) + 1
    };
    setCanvasItems([...canvasItems, newItem]);
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="font-bold text-xl mr-4">Design Canvas</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => handleZoom(0.1)}
              className="p-2 rounded-full hover:bg-gray-800"
              title="Zoom In"
            >
              <Maximize size={16} />
            </button>
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-2 rounded-full hover:bg-gray-800"
              title="Zoom Out"
            >
              <Minimize size={16} />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 rounded-full hover:bg-gray-800 text-red-400"
              title="Clear Canvas"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleColorPickerClick}
            className={`p-2 rounded-full ${isColorPickerActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
            title="Extract Colors"
          >
            <Pipette size={16} />
          </button>
          <button
            onClick={handleTypoPickerClick}
            className={`p-2 rounded-full ${isTypoPickerActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
            title="Extract Typography"
          >
            <Type size={16} />
          </button>
          <button
            onClick={downloadCanvas}
            className="p-2 rounded-full hover:bg-gray-800"
            title="Download Canvas"
          >
            <Download size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800"
            title="Close Canvas"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 relative overflow-auto" ref={canvasRef}>
          <div
            className="absolute top-0 left-0 transform-origin-center transition-transform"
            style={{
              transform: `scale(${zoomLevel})`,
              width: canvasSize.width,
              height: canvasSize.height,
              background: 'rgb(18, 18, 18)',
              backgroundSize: '20px 20px',
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)'
            }}
          >
            {canvasItems.map((item) => (
              <motion.div
                key={item.id}
                className={`absolute cursor-move ${activeItem === item.id ? 'ring-2 ring-blue-500' : ''}`}
                style={{
                  x: item.position.x,
                  y: item.position.y,
                  zIndex: item.zIndex,
                  transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`
                }}
                drag
                dragMomentum={false}
                onDragStart={() => activateItem(item.id)}
                onDrag={(_, info) => handleDrag(item.id, info)}
                onClick={() => {
                  if (isColorPickerActive) {
                    const imgElement = document.getElementById(`canvas-img-${item.id}`);
                    extractColorFromImage(imgElement);
                    setIsColorPickerActive(false);
                  } else if (isTypoPickerActive) {
                    extractTypography();
                  } else {
                    activateItem(item.id);
                  }
                }}
              >
                {item.type === 'image' && (
                  <div className="relative">
                    <img
                      id={`canvas-img-${item.id}`}
                      src={item.src}
                      alt={item.title || 'Canvas item'}
                      style={{
                        width: item.size.width,
                        height: item.size.height,
                        objectFit: 'cover'
                      }}
                      className="rounded-lg"
                      crossOrigin="anonymous"
                    />
                    {activeItem === item.id && (
                      <div className="absolute -top-3 -right-3 flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateItem(item);
                          }}
                          className="p-1 bg-blue-500 rounded-full"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.id);
                          }}
                          className="p-1 bg-red-500 rounded-full"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
            {isColorPickerActive && (
              <div className="absolute top-4 left-4 bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-700">
                <div className="flex items-center mb-2">
                  <Pipette size={16} className="mr-2 text-blue-400" />
                  <span>Click on any image to extract colors</span>
                </div>
              </div>
            )}
            {isTypoPickerActive && (
              <div className="absolute top-4 left-4 bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-700">
                <div className="flex items-center mb-2">
                  <Type size={16} className="mr-2 text-blue-400" />
                  <span>Click on any image to extract typography</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="w-64 border-l border-gray-800 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-bold mb-3 flex items-center">
              <Palette size={16} className="mr-2" />
              Extracted Colors
            </h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {colorPalette.map((color, index) => (
                <div
                  key={`palette-${index}`}
                  className="w-10 h-10 rounded-lg cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                  onClick={() => {
                    if (onExtractColor) onExtractColor([color]);
                  }}
                />
              ))}
              {extractedElements.colors.map((color, index) => (
                <div
                  key={`extracted-${index}`}
                  className="w-10 h-10 rounded-lg cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                  onClick={() => {
                    if (onExtractColor) onExtractColor([color]);
                  }}
                />
              ))}
              {(colorPalette.length === 0 && extractedElements.colors.length === 0) && (
                <div className="text-sm text-gray-400 italic">
                  No colors extracted yet
                </div>
              )}
            </div>
            
            <h3 className="font-bold mb-3 flex items-center">
              <Type size={16} className="mr-2" />
              Typography
            </h3>
            <div className="space-y-2 mb-6">
              {extractedElements.typography.map((font, index) => (
                <div 
                  key={index} 
                  className="p-2 bg-gray-800 rounded-lg"
                  style={{ 
                    fontFamily: font.family,
                    fontWeight: font.weight
                  }}
                >
                  <div style={{ fontSize: font.size }}>{font.name}</div>
                  <div className="text-xs text-gray-400">
                    {font.family}, {font.weight}, {font.size}
                  </div>
                </div>
              ))}
              {extractedElements.typography.length === 0 && (
                <div className="text-sm text-gray-400 italic">
                  No typography extracted yet
                </div>
              )}
            </div>
            
            <h3 className="font-bold mb-3 flex items-center">
              <PencilRuler size={16} className="mr-2" />
              Canvas Controls
            </h3>
            <div className="space-y-2">
              <button 
                onClick={downloadCanvas}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center"
              >
                <Download size={16} className="mr-2" />
                Download Canvas
              </button>
              <button 
                onClick={clearCanvas}
                className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center"
              >
                <Trash2 size={16} className="mr-2" />
                Clear Canvas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignCanvas;
