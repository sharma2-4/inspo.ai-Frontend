import React from "react";
import { X, ExternalLink } from "lucide-react";

const ImageRenderer = ({ images, onSelectImage, selectedImages = [] }) => {
  if (!images || images.length === 0) {
    return <div className="text-gray-400">No images available</div>;
  }

  return (
    <div className="mt-2">
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, index) => (
          <div 
            key={index}
            className="relative group rounded-lg overflow-hidden bg-gray-700"
          >
            <img
              src={img.image}
              alt={img.title || "Design inspiration"}
              className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-image.jpg";
              }}
              loading="lazy"
            />
            
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300">
              {onSelectImage && (
                <button
                  className="bg-blue-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100"
                  onClick={() => onSelectImage(img)}
                >
                  {selectedImages.some(selected => selected.image === img.image) ? (
                    <X size={20} />
                  ) : (
                    <span className="block w-5 h-5">+</span>
                  )}
                </button>
              )}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
              <p className="text-white text-xs truncate">
                {img.title || "Design inspiration"}
              </p>
              {img.source && (
                <p className="text-gray-300 text-xs flex items-center gap-1">
                  <span>{img.source}</span>
                  {img.designer && <span>• {img.designer}</span>}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageRenderer;