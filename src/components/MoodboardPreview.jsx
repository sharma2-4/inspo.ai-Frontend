import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Download, ZoomIn, FileImage, Move, Grid, Trash2, Copy, 
  Maximize, Minimize, Type, RotateCw, Image as ImageIcon, 
  Plus, Minus
} from "lucide-react";
import html2canvas from "html2canvas";
import MoodboardItem from "./MoodboardItem";

export default function MoodboardPreview({
  showMoodboardPreview,
  setShowMoodboardPreview,
  moodboardRef,
  colorPalette,
  designStyle,
  industry,
  font,
  selectedImages
}) {
  // State for image preview
  const [previewImage, setPreviewImage] = useState(null);
  
  // State for draggable moodboard items
  const [moodboardItems, setMoodboardItems] = useState([]);
  
  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  
  // State for zoom level
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // State for selected item
  const [selectedItem, setSelectedItem] = useState(null);
  
  // State for resize handles
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const resizeStartRef = useRef({ width: 0, height: 0, x: 0, y: 0 });
  
  // State for text editing
  const [isEditingText, setIsEditingText] = useState(false);
  const [textValue, setTextValue] = useState("");
  const textInputRef = useRef(null);
  
  // State for canvas background settings
  const [canvasBackground, setCanvasBackground] = useState({
    type: "dots", // dots, lines, grid, solid
    color: "rgba(255, 255, 255, 0.03)",
    size: 20,
    pattern: "circle" // circle, square, diamond
  });
  
  // State for adding new items
  const [addingItemType, setAddingItemType] = useState(null); // "text", "image", null

  // Canvas container ref
  const canvasContainerRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize moodboard items from selected images when component mounts or selected images change
  useEffect(() => {
    if (selectedImages && selectedImages.length > 0) {
      // Only initialize once if moodboardItems is empty
      if (moodboardItems.length === 0) {
        const initialItems = selectedImages.map((image, index) => {
          // Get image url from string or object
          const imageUrl = typeof image === 'string' ? image : image.image || image.url;
          const imageTitle = typeof image === 'object' && image.title 
            ? image.title 
            : `Image ${index + 1}`;
            
          return {
            id: `item-${Date.now()}-${index}`,
            type: 'image',
            src: imageUrl,
            title: imageTitle,
            position: {
              x: 100 + (index % 3) * 220,
              y: 300 + Math.floor(index / 3) * 180
            },
            size: { width: 200, height: 150 },
            rotation: 0,
            zIndex: index
          };
        });
        
        setMoodboardItems(initialItems);
      }
    }
  }, [selectedImages]);

  // Focus text input when editing text
  useEffect(() => {
    if (isEditingText && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [isEditingText]);

  // Handle pressing escape to cancel editing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsEditingText(false);
        
        // If it's a new text item and no content, remove it
        if (addingItemType === 'text' && (!textValue || textValue.trim() === '')) {
          setMoodboardItems(items => items.filter(item => item.id !== selectedItem));
        }
        
        setAddingItemType(null);
        setSelectedItem(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditingText, addingItemType, textValue, selectedItem]);

  // Helper function to handle image download
  const handleImageDownload = (imageUrl, imageName = "image") => {
    if (!imageUrl) {
      console.error("Invalid image URL for download");
      return;
    }
    
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = imageName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to download the entire moodboard as image
  const handleDownloadMoodboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const canvasImage = await html2canvas(canvas, {
        backgroundColor: '#121212',
        allowTaint: true,
        useCORS: true,
        scale: 2 // Higher quality
      });
      
      const link = document.createElement('a');
      link.download = `moodboard-${designStyle || 'design'}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvasImage.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading moodboard:', error);
    }
  };

  // Function to open image preview
  const openImagePreview = (image) => {
    setPreviewImage(image);
  };

  // Function to close image preview
  const closeImagePreview = () => {
    setPreviewImage(null);
  };
  
  // Function to handle drag
  const handleDrag = (id, info) => {
    setMoodboardItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, position: { x: info.point.x, y: info.point.y } } 
          : item
      )
    );
  };
  
  // Function to select an item
  const handleSelectItem = (id) => {
    // If already editing text, save the value first
    if (isEditingText && selectedItem && selectedItem !== id) {
      saveFinalText();
    }
    
    setSelectedItem(id);
    setIsEditingText(false);
    setAddingItemType(null);
    
    // Bring to front by setting highest z-index
    setMoodboardItems(prevItems => {
      const highestZ = Math.max(...prevItems.map(item => item.zIndex), 0);
      
      const selectedItem = prevItems.find(item => item.id === id);
      if (selectedItem && selectedItem.type === 'text') {
        setTextValue(selectedItem.text || '');
      }
      
      return prevItems.map(item => 
        item.id === id ? { ...item, zIndex: highestZ + 1 } : item
      );
    });
  };
  
  // Function to remove an item
  const handleRemoveItem = (id, e) => {
    if (e) e.stopPropagation();
    setMoodboardItems(prevItems => prevItems.filter(item => item.id !== id));
    if (selectedItem === id) {
      setSelectedItem(null);
      setIsEditingText(false);
    }
  };
  
  // Function to duplicate an item
  const handleDuplicateItem = (item, e) => {
    if (e) e.stopPropagation();
    const newItem = {
      ...item,
      id: `item-${Date.now()}`,
      position: {
        x: item.position.x + 20,
        y: item.position.y + 20
      },
      zIndex: Math.max(...moodboardItems.map(i => i.zIndex), 0) + 1
    };
    setMoodboardItems(prev => [...prev, newItem]);
  };
  
  // Function to handle zoom in/out
  const handleZoom = (delta) => {
    setZoomLevel(prev => {
      const newZoom = prev + delta;
      return Math.min(Math.max(0.5, newZoom), 3);
    });
  };
  
  // Function to handle resize
  const handleResizeStart = (direction, e, item) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    
    resizeStartRef.current = {
      width: item.size.width,
      height: item.size.height,
      x: e.clientX,
      y: e.clientY
    };
  };
  
  const handleResizeMove = (e) => {
    if (!isResizing || !selectedItem) return;
    
    const dx = e.clientX - resizeStartRef.current.x;
    const dy = e.clientY - resizeStartRef.current.y;
    
    setMoodboardItems(prevItems => 
      prevItems.map(item => {
        if (item.id !== selectedItem) return item;
        
        const newSize = { ...item.size };
        
        if (resizeDirection.includes('e')) { // right
          newSize.width = Math.max(50, resizeStartRef.current.width + dx / zoomLevel);
        }
        if (resizeDirection.includes('w')) { // left
          newSize.width = Math.max(50, resizeStartRef.current.width - dx / zoomLevel);
        }
        if (resizeDirection.includes('s')) { // bottom
          newSize.height = Math.max(50, resizeStartRef.current.height + dy / zoomLevel);
        }
        if (resizeDirection.includes('n')) { // top
          newSize.height = Math.max(50, resizeStartRef.current.height - dy / zoomLevel);
        }
        
        return { ...item, size: newSize };
      })
    );
  };
  
  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeDirection(null);
  };
  
  // Auto-arrange items in a grid
  const arrangeItemsInGrid = () => {
    const containerWidth = canvasContainerRef.current?.clientWidth || 800;
    const itemWidth = 220;
    const itemHeight = 180;
    const itemsPerRow = Math.floor(containerWidth / itemWidth) || 3;
    
    setMoodboardItems(prevItems => 
      prevItems.map((item, index) => ({
        ...item,
        position: {
          x: 120 + (index % itemsPerRow) * itemWidth,
          y: 300 + Math.floor(index / itemsPerRow) * itemHeight
        }
      }))
    );
  };
  
  // Clear all items
  const clearAllItems = () => {
    if (window.confirm('Are you sure you want to remove all items from the moodboard?')) {
      setMoodboardItems([]);
      setSelectedItem(null);
      setIsEditingText(false);
    }
  };
  
  // Add a new text item
  const addTextItem = () => {
    setIsEditingText(true);
    setTextValue("");
    setAddingItemType("text");
    
    const containerWidth = canvasContainerRef.current?.clientWidth || 800;
    const containerHeight = canvasContainerRef.current?.clientHeight || 600;
    
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 3;
    
    const newTextItem = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: '',
      fontSize: 18,
      fontColor: '#ffffff',
      fontFamily: font || 'sans-serif',
      position: {
        x: centerX,
        y: centerY
      },
      size: { width: 200, height: 100 },
      rotation: 0,
      zIndex: Math.max(...moodboardItems.map(item => item.zIndex), 0) + 1
    };
    
    setMoodboardItems(prev => [...prev, newTextItem]);
    setSelectedItem(newTextItem.id);
  };
  
  // Handle text change
  const handleTextChange = (e) => {
    setTextValue(e.target.value);
    
    // Update item in real-time
    setMoodboardItems(prevItems => 
      prevItems.map(item => 
        item.id === selectedItem 
          ? { ...item, text: e.target.value } 
          : item
      )
    );
  };
  
  // Save text when done editing
  const saveFinalText = () => {
    setIsEditingText(false);
    
    // Remove empty text items
    if (!textValue || textValue.trim() === '') {
      if (addingItemType === 'text') {
        handleRemoveItem(selectedItem);
      }
    }
    
    setAddingItemType(null);
  };
  
  // Handle double click on text item
  const handleDoubleClickText = (item) => {
    setTextValue(item.text || '');
    setIsEditingText(true);
    setSelectedItem(item.id);
  };
  
  // Rotate selected item
  const rotateItem = (id, angle) => {
    setMoodboardItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          return {
            ...item,
            rotation: ((item.rotation || 0) + angle) % 360
          };
        }
        return item;
      })
    );
  };
  
  // Change background pattern
  const cycleBackgroundPattern = () => {
    const patterns = ["dots", "grid", "lines", "solid"];
    const currentIndex = patterns.indexOf(canvasBackground.type);
    const nextIndex = (currentIndex + 1) % patterns.length;
    
    setCanvasBackground(prev => ({
      ...prev,
      type: patterns[nextIndex]
    }));
  };

  // Render clickable images with preview functionality (for non-edit mode)
  const renderClickableImages = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {selectedImages.map((image, index) => {
          // Determine image URL and title
          const imageUrl = typeof image === 'string' ? image : image.image || image.url;
          const imageTitle = typeof image === 'object' && image.title 
            ? image.title 
            : `Image ${index + 1}`;

          return (
            <div 
              key={index} 
              className="relative group cursor-pointer rounded-lg overflow-hidden"
            >
              <img 
                src={imageUrl} 
                alt={imageTitle}
                className="w-full h-48 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => openImagePreview(image)}
                    className="p-2 bg-white rounded-full mx-1 hover:bg-gray-200"
                    title="Preview Image"
                  >
                    <ZoomIn size={16} className="text-black" />
                  </button>
                  <button
                    onClick={() => handleImageDownload(imageUrl, imageTitle)}
                    className="p-2 bg-white rounded-full mx-1 hover:bg-gray-200"
                    title="Download Image"
                  >
                    <Download size={16} className="text-black" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Get background style based on canvas background settings
  const getBackgroundStyle = () => {
    switch (canvasBackground.type) {
      case "dots":
        return {
          backgroundImage: `radial-gradient(${canvasBackground.pattern} at 25px 25px, ${canvasBackground.color} 1px, transparent 1px)`,
          backgroundSize: `${canvasBackground.size}px ${canvasBackground.size}px`
        };
      case "grid":
        return {
          backgroundImage: `linear-gradient(to right, ${canvasBackground.color} 1px, transparent 1px), 
                            linear-gradient(to bottom, ${canvasBackground.color} 1px, transparent 1px)`,
          backgroundSize: `${canvasBackground.size}px ${canvasBackground.size}px`
        };
      case "lines":
        return {
          backgroundImage: `linear-gradient(to right, ${canvasBackground.color} 1px, transparent 1px)`,
          backgroundSize: `${canvasBackground.size}px ${canvasBackground.size}px`
        };
      case "solid":
        return {
          background: "#121212"
        };
      default:
        return {};
    }
  };
  
  // Render draggable image and text items (for edit mode)
  const renderDraggableItems = () => {
    return (
      <div 
        className="relative w-full h-full min-h-[600px]"
        ref={canvasContainerRef}
        onMouseMove={isResizing ? handleResizeMove : undefined}
        onMouseUp={isResizing ? handleResizeEnd : undefined}
        onMouseLeave={isResizing ? handleResizeEnd : undefined}
      >
        {moodboardItems.map((item) => (
          <MoodboardItem
            key={item.id}
            item={item}
            isSelected={selectedItem === item.id}
            isEditing={isEditingText && selectedItem === item.id}
            textValue={textValue}
            handleSelectItem={handleSelectItem}
            handleDrag={handleDrag}
            handleRemoveItem={handleRemoveItem}
            handleDuplicateItem={handleDuplicateItem}
            handleDoubleClickText={handleDoubleClickText}
            handleTextChange={handleTextChange}
            saveFinalText={saveFinalText}
            rotateItem={rotateItem}
            handleResizeStart={handleResizeStart}
            textInputRef={isEditingText && selectedItem === item.id ? textInputRef : null}
          />
        ))}
        
        {moodboardItems.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8 bg-gray-900 bg-opacity-50 rounded-2xl border border-gray-800 max-w-md">
              <FileImage size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400">
                Your moodboard is empty. Add text or images using the toolbar above.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Image Preview Modal
  const ImagePreviewModal = () => {
    if (!previewImage) return null;

    // Determine image URL and title
    const imageUrl = typeof previewImage === 'string' 
      ? previewImage 
      : previewImage.image || previewImage.url;
    const imageTitle = typeof previewImage === 'object' && previewImage.title 
      ? previewImage.title 
      : 'Image Preview';

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 z-60 flex items-center justify-center p-8"
      >
        <div className="relative max-w-4xl max-h-[90vh] w-full">
          <button
            onClick={closeImagePreview}
            className="absolute -top-10 right-0 text-white hover:text-gray-300"
          >
            <X size={24} />
          </button>
          
          <div className="bg-black rounded-2xl overflow-hidden border border-gray-800">
            <img 
              src={imageUrl} 
              alt={imageTitle}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
          
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={() => handleImageDownload(imageUrl, imageTitle)}
              className="bg-white text-black px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-gray-200"
            >
              <Download size={16} className="mr-2" />
              <span>Download Image</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showMoodboardPreview ? 1 : 0 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-8 ${!showMoodboardPreview ? 'pointer-events-none' : ''}`}
      >
        <div className="bg-black rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-auto border border-gray-800 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              {editMode ? 'Edit Moodboard' : 'Your Moodboard'}
            </h2>
            
            <div className="flex items-center space-x-1">
              {/* Edit mode specific controls */}
              {editMode && (
                <>
                  <div className="flex items-center mr-2 bg-gray-900 rounded-full p-1">
                    <button
                      onClick={() => handleZoom(0.1)}
                      className="p-1 rounded-full hover:bg-gray-800"
                      title="Zoom In"
                    >
                      <Plus size={16} className="text-white" />
                    </button>
                    <span className="mx-1 text-xs text-gray-400">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      onClick={() => handleZoom(-0.1)}
                      className="p-1 rounded-full hover:bg-gray-800"
                      title="Zoom Out"
                    >
                      <Minus size={16} className="text-white" />
                    </button>
                  </div>
                  
                  <button
                    onClick={addTextItem}
                    className="p-2 rounded-full hover:bg-gray-800"
                    title="Add Text"
                  >
                    <Type size={16} className="text-white" />
                  </button>
                  <button
                    onClick={arrangeItemsInGrid}
                    className="p-2 rounded-full hover:bg-gray-800"
                    title="Auto-arrange Items"
                  >
                    <Grid size={16} className="text-white" />
                  </button>
                  <button
                    onClick={cycleBackgroundPattern}
                    className="p-2 rounded-full hover:bg-gray-800"
                    title="Change Background"
                  >
                    <ImageIcon size={16} className="text-white" />
                  </button>
                  <button
                    onClick={clearAllItems}
                    className="p-2 rounded-full hover:bg-gray-800 text-red-400"
                    title="Clear All Items"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="h-6 w-px bg-gray-700 mx-1"></div>
                </>
              )}
              
              {/* Common controls */}
              <button
                onClick={handleDownloadMoodboard}
                className="p-2 rounded-full bg-white text-black hover:bg-gray-200 flex items-center gap-1 font-medium"
                title="Download Moodboard"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Download</span>
              </button>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`p-2 rounded-full ${editMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-700'} flex items-center gap-1`}
                title={editMode ? "View Mode" : "Edit Mode"}
              >
                <Move size={16} className="text-white" />
                <span className="hidden sm:inline text-white">{editMode ? "View" : "Edit"}</span>
              </button>
              <button
                onClick={() => setShowMoodboardPreview(false)}
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700"
                title="Close"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          </div>

          <div
            ref={moodboardRef}
            className="p-8 bg-black flex-1 overflow-auto"
            style={{
              ...getBackgroundStyle(),
              transform: editMode ? `scale(${zoomLevel})` : 'none',
              transformOrigin: 'center top',
              transition: 'transform 0.2s ease'
            }}
          >
            <div 
              ref={canvasRef}
              className="relative w-full min-h-[600px]"
            >
              {/* Color Palette Bar - always visible in both modes */}
              <div className="flex justify-center mb-6">
                <div className="flex rounded-full overflow-hidden">
                  {(colorPalette || []).slice(0, 6).map((clr, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 relative group"
                      style={{ backgroundColor: clr }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-xs text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {clr}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!editMode && (
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                    {designStyle || "Design"} Moodboard
                  </h2>
                  <p className="text-gray-400 font-light tracking-wide">
                    {industry || "Your"} Project • {font || "Sans-serif"} Typography
                  </p>
                </div>
              )}

              {/* Content Area - different rendering based on edit mode */}
              {editMode 
                ? renderDraggableItems() 
                : selectedImages && selectedImages.length > 0 
                  ? renderClickableImages()
                  : (
                    <div className="text-center p-8 bg-gray-900 rounded-2xl border border-gray-800">
                      <FileImage size={48} className="mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-400">
                        No images selected. Click on images in the chat to add them to your moodboard.
                      </p>
                    </div>
                  )
              }
            </div>
          </div>
          
          {/* Bottom toolbar - only in edit mode */}
          {editMode && (
            <div className="p-3 border-t border-gray-800 bg-gray-900 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {moodboardItems.length} items • Zoom: {Math.round(zoomLevel * 100)}%
              </div>
              <div className="text-xs text-gray-400">
                Tip: Click and drag images to position them. Select an image to duplicate or delete.
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && <ImagePreviewModal />}
      </AnimatePresence>
    </>
  );
}
