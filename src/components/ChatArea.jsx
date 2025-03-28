import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, Send, PanelLeft, PanelRight, Sliders, 
  Download, ExternalLink, Filter, X, Building2
} from "lucide-react";

// Utility function to make links clickable
const makeLinksClickable = (html) => {
  return html.replace(
    /<a\s+href="([^"]+)"(?![^>]*target=)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>'
  );
};

// Skeleton Loading Component
const MessageSkeleton = () => {
  return (
    <div className="p-4 bg-gray-900 rounded-2xl animate-pulse">
      <div className="flex space-x-4">
        <div className="flex-1 space-y-4">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
};

// Typing Animation Component
const TypingText = ({ text, speed = 20 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (text) {
      let i = 0;
      const typingEffect = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(prevText => prevText + text.charAt(i));
          i++;
        } else {
          clearInterval(typingEffect);
        }
      }, speed);

      return () => clearInterval(typingEffect);
    }
  }, [text, speed]);

  return <>{displayedText}</>;
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
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedColor, setCopiedColor] = useState(null);
  const messagesContainerRef = useRef(null);
  const [typedMessages, setTypedMessages] = useState({});

  // Auto-scroll effect
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Typing management for AI messages
  useEffect(() => {
    const unTypedAIMessages = messages.filter(
      msg => msg.sender === 'ai' && !typedMessages[msg.id]
    );

    unTypedAIMessages.forEach(msg => {
      setTypedMessages(prev => ({
        ...prev,
        [msg.id]: true
      }));
    });
  }, [messages]);

  const isSubmitDisabled = () => {
    if (loading) return true;
    const trimmedInput = input.trim();
    return trimmedInput.length === 0 || trimmedInput.length > 500;
  };

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

  const renderIndustryInsights = (insights) => {
    if (!insights || !insights.industriesWithImages) return null;

    return (
      <div className="space-y-6 mt-6">
        <h2 className="text-2xl font-bold text-white mb-4">Industry Design Insights</h2>
        {insights.industriesWithImages.map((industrySection, index) => (
          <div key={index} className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <div className="flex items-center mb-4">
              <Building2 size={24} className="mr-3 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">{industrySection.industry}</h3>
            </div>
            
            {industrySection.images && industrySection.images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {industrySection.images.map((image, imgIndex) => (
                  <img 
                    key={imgIndex}
                    src={image.image} 
                    alt={image.title} 
                    className="rounded-lg object-cover w-full h-32"
                    onClick={() => handleImagePreview(image)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        
        {insights.insights && (
          <div 
            className="prose prose-invert max-w-none leading-relaxed break-words whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ 
              __html: makeLinksClickable(insights.insights) 
            }}
          />
        )}
      </div>
    );
  };

  const handleDownload = useCallback((image) => {
    const link = document.createElement('a');
    link.href = image.image;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedTitle = image.title 
      ? image.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() 
      : 'inspoai_image';
    
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

  const renderFormatGrid = (images) => {
    if (!images || images.length === 0) return null;
    
    return (
      <div className="space-y-6">
        {Object.entries(
          images.reduce((acc, img) => {
            const category = img.category || "Inspiration";
            if (!acc[category]) acc[category] = [];
            acc[category].push(img);
            return acc;
          }, {})
        ).map(([category, imgs]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-lg font-bold text-white mb-2">{category}</h3>
            <div className={`grid gap-3 ${
              moodboardLayout === "masonry" 
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" 
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
            }`}>
              {imgs.map((image, idx) => (
                <div 
                  key={idx} 
                  className={`relative group ${moodboardLayout === "masonry" && idx % 3 === 0 ? "row-span-2" : ""}`}
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

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-black to-gray-900">
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
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  __html: msg.sender === 'ai' 
                    ? makeLinksClickable(`<p>${
                      typedMessages[msg.id] 
                        ? msg.text 
                        : <TypingText text={msg.text} />
                    }</p>`)
                    : makeLinksClickable(msg.text)
                }}
              />
            )}
            {msg.images && (
              <div className="mt-5">
                {renderFormatGrid(msg.images)}
              </div>
            )}
            {msg.industryInsights && renderIndustryInsights(msg.industryInsights)}
          </motion.div>
        ))}
        
        {loading && (
          <div className="space-y-4">
            <MessageSkeleton />
            <MessageSkeleton />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
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
                    >
                      {imageStyleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs text-gray-300">Asset Types</label>
                  <div className="flex gap-2 mt-1">
                    <button className="px-3 py-1 bg-blue-800 text-xs rounded-full">Images</button>
                    <button className="px-3 py-1 text-xs rounded-full border bg-black border-gray-700 hover:bg-gray-800">Vectors</button>
                    <button className="px-3 py-1 text-xs rounded-full border bg-black border-gray-700 hover:bg-gray-800">PSD</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the design you're looking for (e.g., 'Minimalist workspace design')"
              className="w-full bg-black text-white p-3 pl-10 rounded-full focus:ring-2 focus:ring-white placeholder-gray-500 resize-none h-12 max-h-32 min-h-12 border border-gray-800"
              maxLength={500}
            />
            <Filter size={16} className="absolute left-4 top-3 text-gray-500" />
          </div>
          <Tooltip 
            content={
              isSubmitDisabled() 
                ? "Please enter a valid input (1-500 characters)" 
                : "Send your request"
            }
          >
            <button
              onClick={sendMessage}
              disabled={isSubmitDisabled()}
              className="bg-gradient-to-r from-white to-gray-500 hover:from-gray-500 hover:to-white text-black p-3 rounded-full flex items-center justify-center disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </Tooltip>
        </div>
        {renderInputFeedback()}
      </div>
      {selectedImage && <ImagePreviewModal />}
    </div>
  );
}
