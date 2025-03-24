import React from "react"; // Added React import which was missing
import { motion } from "framer-motion";
import { X, Download } from "lucide-react";

export default function MoodboardPreview({
  showMoodboardPreview,
  setShowMoodboardPreview,
  downloadMoodboard,
  moodboardRef,
  colorPalette,
  designStyle,
  industry,
  font,
  selectedImages,
  renderMoodboardBento,
}) {
  // Helper function to handle image download
  const handleImageDownload = (imageUrl, imageName = "image") => {
    // Check if the URL is valid
    if (!imageUrl) {
      console.error("Invalid image URL for download");
      return;
    }
    
    // Create an anchor element
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = imageName;
    
    // Append to the document temporarily
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  };
  
  // Modified renderMoodboardBento to include clickable images
  const renderClickableBento = () => {
    // If renderMoodboardBento is not provided, return null
    if (!renderMoodboardBento) return null;
    
    // Get the original bento JSX from the parent component
    const originalBento = renderMoodboardBento();
    if (!originalBento) return null;
    
    // Clone and modify the bento to make images clickable
    return React.cloneElement(originalBento, {}, 
      React.Children.map(originalBento.props.children, child => {
        // For each div in the bento grid
        if (child && child.props && child.props.children) {
          // Find the img element inside
          return React.cloneElement(child, {}, 
            React.Children.map(child.props.children, imgChild => {
              if (imgChild && imgChild.type === 'img') {
                // Make the image container relative for overlay positioning
                return (
                  <div className="relative group cursor-pointer">
                    {imgChild}
                    {/* Download overlay */}
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent event bubbling
                        handleImageDownload(imgChild.props.src);
                      }}
                    >
                      <div className="p-2 bg-white rounded-full mx-1 hover:bg-gray-200">
                        <Download size={16} className="text-black" />
                      </div>
                    </div>
                  </div>
                );
              }
              return imgChild;
            })
          );
        }
        return child;
      })
    );
  };

  // Alternate approach for direct image rendering with download functionality
  const renderClickableImages = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {selectedImages.map((image, index) => (
          <div key={index} className="relative group cursor-pointer rounded-lg overflow-hidden">
            <img 
              src={typeof image === 'string' ? image : image.image || image.url} 
              alt={typeof image === 'object' && image.title ? image.title : `Image ${index}`}
              className="w-full h-full object-cover"
            />
            <div 
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
              onClick={() => handleImageDownload(
                typeof image === 'string' ? image : image.image || image.url,
                typeof image === 'object' && image.title ? image.title : `moodboard-image-${index}`
              )}
            >
              <div className="p-2 bg-white rounded-full mx-1 hover:bg-gray-200">
                <Download size={16} className="text-black" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: showMoodboardPreview ? 1 : 0 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-8 ${!showMoodboardPreview ? 'pointer-events-none' : ''}`}
    >
      <div className="bg-black rounded-2xl w-full max-w-4xl max-h-full overflow-auto border border-gray-800">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            Your Moodboard
          </h2>
          <div className="flex gap-2">
            <button
              onClick={downloadMoodboard}
              className="p-2 rounded-full bg-white text-black hover:bg-gray-200 flex items-center gap-1 font-medium"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={() => setShowMoodboardPreview(false)}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div
          ref={moodboardRef}
          className="p-8 bg-black"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        >
          {/* Color Palette Bar */}
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

          {/* Title Area */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              {designStyle || "Design"} Moodboard
            </h2>
            <p className="text-gray-400 font-light tracking-wide">
              {industry || "Your"} Project • {font || "Sans-serif"} Typography
            </p>
          </div>

          {/* Images Area */}
          {selectedImages && selectedImages.length > 0 ? (
            // Try the bento renderer first, fall back to simple grid if needed
            renderMoodboardBento ? renderClickableBento() : renderClickableImages()
          ) : (
            <div className="text-center p-8 bg-gray-900 rounded-2xl border border-gray-800">
              <p>
                No images selected. Click on images in the chat to add them to
                your moodboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}