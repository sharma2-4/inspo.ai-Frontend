import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, Send, PanelLeft, PanelRight, Sliders, 
  Download, ExternalLink, Wand2, Image as ImageIcon, 
  FileText, FileArchive, X, Copy, Check,
  Moon, Sun, Search, Filter, Info
} from "lucide-react";

const makeLinksClickable = (html) => {
  return html.replace(
    /<a\s+href="([^"]+)"(?![^>]*target=)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>'
  );
};

export default function ChatArea({
  messages,
  loading,
  input,
  setInput,
  handleKeyPress,
  sendMessage,
  showSidebar,
  setShowSidebar,
  showAdvancedOptions,
  setShowAdvancedOptions,
  relatedTerms,
  messagesEndRef,
  moodboardLayout,
  setMoodboardLayout,
  imageStyle,
  setImageStyle,
  imageStyleOptions,
  colorPalette,
  includeAI,
  setIncludeAI,
  addMessage
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedColor, setCopiedColor] = useState(null);
  const messagesContainerRef = useRef(null);

  // Scroll to bottom effect
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Input Validation and Enhancement
  const isSubmitDisabled = () => {
    if (loading) return true;
    const trimmedInput = input.trim();
    return trimmedInput.length === 0 || trimmedInput.length > 500;
  };

  // Tooltip Component for Advanced Explanations
  const Tooltip = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className="relative inline-block">
        <div 
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          {children}
        </div>
        {isVisible && (
          <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded-lg p-2 shadow-lg max-w-xs">
            {content}
          </div>
        )}
      </div>
    );
  };

  // Enhanced Error and Guidance Handling
  const renderInputFeedback = () => {
    const trimmedInput = input.trim();
    if (trimmedInput.length > 500) {
      return (
        <div className="text-red-400 text-xs ml-4 mt-1">
          Input is too long (max 500 characters)
        </div>
      );
    }
    return null;
  };

  const generateFreepikAIImage = async () => {
    if (!input.trim()) return;
    try {
      const response = await fetch(
        `/search?q=${encodeURIComponent(input)}&ai=true`
      );
      const data = await response.json();
      const newMessage = {
        sender: "bot",
        images: data.images,
        text: data.aiSuggestions,
        heading: data.heading,
        colorPalette: data.colorPalette,
      };
      addMessage(newMessage);
      setInput("");
    } catch (error) {
      console.error("Error generating Freepik AI image:", error);
    }
  };

  const handleSubmit = () => {
    if (includeAI) {
      generateFreepikAIImage();
    } else {
      sendMessage();
    }
  };

  const handleDownload = useCallback((image) => {
    const link = document.createElement('a');
    link.href = image.image;
    
    // Generate a more descriptive filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedTitle = image.title 
      ? image.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() 
      : 'inspoai_image';
    
    // Determine download details based on image type
    if (image.format === 'vector') {
      link.href = image.url;
      link.download = `${sanitizedTitle}_vector_${timestamp}.svg`;
    } else if (image.format === 'psd') {
      link.href = image.url;
      link.download = `${sanitizedTitle}_design_${timestamp}.psd`;
    } else {
      link.download = `${sanitizedTitle}_${timestamp}.jpg`;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleImagePreview = (image) => {
    setSelectedImage(image);
  };

  const handleColorCopy = (color) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const renderColorPalette = (colors) => {
    if (!colors || colors.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-3 mb-4">
        {colors.map((color, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="w-12 h-12 rounded-full border border-gray-700 shadow-lg cursor-pointer hover:scale-110 transition-transform relative group" 
              style={{ backgroundColor: color }}
              title={`Copy Color: ${color}`}
              onClick={() => handleColorCopy(color)}
            >
              {copiedColor === color && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  Copied!
                </div>
              )}
            </div>
            <span className="text-xs mt-1 font-mono">{color}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderFormatGrid = (images, categoryTitle) => {
    if (!images || images.length === 0) return null;
    
    const imagesByCategory = images.reduce((acc, img) => {
      const category = img.category || "Inspiration";
      if (!acc[category]) acc[category] = [];
      acc[category].push(img);
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        {categoryTitle && (
          <h3 className="text-lg font-bold text-white mb-2">{categoryTitle}</h3>
        )}
        {Object.entries(imagesByCategory).map(([category, categoryImages]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-400">{category}</h4>
            <div className={`grid gap-3 ${
              moodboardLayout === "masonry" 
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" 
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
            }`}>
              {categoryImages.map((image, idx) => (
                <div 
                  key={idx} 
                  className={`${
                    moodboardLayout === "masonry" && idx % 3 === 0 ? "row-span-2" : ""
                  } relative group`}
                >
                  <div 
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleImagePreview(image)}
                  >
                    <img 
                      src={image.image} 
                      alt={image.title} 
                      className="rounded-lg object-cover w-full h-full"
                    />
                    {image.format && image.format !== 'image' && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full px-2 py-1 text-xs font-bold">
                        {image.format.toUpperCase()}
                      </div>
                    )}
                    {image.author && (
                      <div className="absolute bottom-2 left-2 right-2 text-xs bg-black bg-opacity-70 p-1 rounded truncate">
                        {image.author}
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleDownload(image)}
                        className="bg-white/20 hover:bg-white/40 p-1 rounded-full backdrop-blur-sm"
                        title="Download"
                      >
                        <Download size={16} className="text-white" />
                      </button>
                      {image.url && (
                        <a 
                          href={image.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-white/20 hover:bg-white/40 p-1 rounded-full backdrop-blur-sm"
                          title="Open Original"
                        >
                          <ExternalLink size={16} className="text-white" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Image Preview Modal
  const ImagePreviewModal = () => {
    if (!selectedImage) return null;

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
        onClick={() => setSelectedImage(null)}
      >
        <div 
          className="max-w-4xl max-h-[90vh] relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 p-2 rounded-full z-60"
          >
            <X size={24} className="text-white" />
          </button>
          
          <img 
            src={selectedImage.image} 
            alt={selectedImage.title} 
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          
          <div className="mt-4 text-center text-white space-x-4">
            <button 
              onClick={() => handleDownload(selectedImage)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full inline-flex items-center"
            >
              <Download size={20} className="mr-2" /> Download
            </button>
            {selectedImage.url && (
              <a 
                href={selectedImage.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full inline-flex items-center"
              >
                <ExternalLink size={20} className="mr-2" /> Open Original
              </a>
            )}
          </div>
          
          {selectedImage.author && (
            <div className="text-center text-gray-300 mt-2">
              Author: {selectedImage.author}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Dynamic Placeholder Text
  const getPlaceholderText = () => {
    if (includeAI) {
      return "Describe the AI image you want to generate (e.g., 'Futuristic cityscape at sunset')";
    }
    return "Describe the design you're looking for (e.g., 'Minimalist workspace design')";
  };

  const formatAIMessage = (text) => {
    return makeLinksClickable(text);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-black to-gray-900">
      {/* Title Bar */}
      <div className="p-4 border-b border-gray-800 bg-black flex items-center justify-between">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-2 rounded-full hover:bg-gray-800 border border-gray-800"
          title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
        >
          {showSidebar ? <PanelLeft size={20} /> : <PanelRight size={20} />}
        </button>
        <img src="/inspoai.svg" alt="Inspo.ai" className="h-8 w-auto"/>
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="p-2 rounded-full hover:bg-gray-800 border border-gray-800"
          title="Advanced Options"
        >
          <Sliders size={20} />
        </button>
      </div>

      {/* Mode Indicator Bar */}
      {includeAI && (
        <div className="bg-blue-900 bg-opacity-30 border-b border-blue-700 py-2 px-4 flex items-center justify-center space-x-2">
          <Wand2 size={16} className="text-blue-400" />
          <span className="text-sm text-blue-300 font-medium">AI Image Generation Mode Active</span>
        </div>
      )}

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-4 rounded-2xl max-w-[95%] sm:max-w-[80%] lg:max-w-[80%] ${msg.sender === "user"
              ? "ml-auto bg-gradient-to-r from-gray-700 to-black text-white border border-gray-800"
              : "bg-black border border-gray-800"
              }`}
          >
            {msg.heading && (
              <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                {msg.heading}
              </h2>
            )}
            {msg.colorPalette && msg.colorPalette.length > 0 && renderColorPalette(msg.colorPalette)}
            {msg.text && (
              <div
                className="prose prose-invert max-w-none leading-relaxed break-words whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: msg.sender === "bot" ? formatAIMessage(msg.text) : msg.text,
                }}
              />
            )}
            {msg.images && (
              <div className="mt-5">
                {renderFormatGrid(msg.images, msg.categoryTitle)}
              </div>
            )}
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin text-white w-8 h-8" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div className="p-4 border-t border-gray-800 bg-black">
        <AnimatePresence>
          {showAdvancedOptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 overflow-hidden"
            >
              <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
                <h3 className="text-sm font-bold mb-2">Advanced Options</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-300">Layout Style</label>
                    <select
                      value={moodboardLayout}
                      onChange={(e) => setMoodboardLayout(e.target.value)}
                      className="mt-1 w-full bg-black text-white p-2 rounded-full text-sm border border-gray-800"
                      disabled={includeAI}
                    >
                      <option value="grid">Standard Grid</option>
                      <option value="masonry">Masonry</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-300">Image Style</label>
                    <select
                      value={imageStyle}
                      onChange={(e) => setImageStyle(e.target.value)}
                      className="mt-1 w-full bg-black text-white p-2 rounded-full text-sm border border-gray-800"
                      disabled={includeAI}
                    >
                      {imageStyleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 p-3 border border-blue-800 rounded-lg bg-blue-900 bg-opacity-20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wand2 size={18} className="text-blue-400" />
                      <label htmlFor="includeAI" className="text-sm font-medium text-blue-300">
                        AI Image Generation
                      </label>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="includeAI"
                        checked={includeAI}
                        onChange={(e) => setIncludeAI(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {includeAI && (
                    <div className="mt-2 text-xs text-blue-300">
                      When enabled, only AI-generated images will be shown. Regular moodboard creation will be disabled.
                    </div>
                  )}
                </div>
                
                <div className="mt-3">
                  <label className="text-xs text-gray-300">Asset Types</label>
                  <div className="flex gap-2 mt-1">
                    <button className="px-3 py-1 bg-blue-800 text-xs rounded-full">Images</button>
                    <button className={`px-3 py-1 text-xs rounded-full border ${includeAI ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed' : 'bg-black border-gray-700 hover:bg-gray-800'}`} disabled={includeAI}>Vectors</button>
                    <button className={`px-3 py-1 text-xs rounded-full border ${includeAI ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed' : 'bg-black border-gray-700 hover:bg-gray-800'}`} disabled={includeAI}>PSD</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Input Area */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholderText()}
              className={`w-full bg-black text-white p-3 pl-10 rounded-full focus:ring-2 focus:ring-white placeholder-gray-500 resize-none h-12 max-h-32 min-h-12 border ${
                includeAI ? "border-blue-600 focus:border-blue-400 focus:ring-blue-400" : "border-gray-800"
              }`}
              maxLength={500}
            />
            {includeAI ? (
              <Wand2 size={16} className="absolute left-4 top-3 text-blue-400" />
            ) : (
              <Filter size={16} className="absolute left-4 top-3 text-gray-500" />
            )}
          </div>
          <Tooltip 
            content={
              isSubmitDisabled() 
                ? "Please enter a valid input (1-500 characters)" 
                : "Send your request"
            }
          >
            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled()}
              className={`bg-gradient-to-r text-black p-3 rounded-full flex items-center justify-center disabled:opacity-50 ${
                includeAI
                  ? "from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"
                  : "from-white to-gray-500 hover:from-gray-500 hover:to-white"
              }`}
            >
              {includeAI ? <Wand2 size={20} /> : <Send size={20} />}
            </button>
          </Tooltip>
        </div>
        {renderInputFeedback()}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && <ImagePreviewModal />}
    </div>
  );
}
