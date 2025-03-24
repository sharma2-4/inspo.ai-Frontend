import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Image, Palette, Building, Type, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { SketchPicker } from "react-color";

// Enhanced ImageRenderer with optimized Bento Grid
const ImageRenderer = ({ images }) => {
  // Calculate dynamic sizes for bento grid with smaller overall height
  const getSpanClass = (index) => {
    // Create pattern focusing on smaller tiles to fit more images
    // Use more single-unit cells to display more images without scrolling
    const patterns = [
      "col-span-2 row-span-2", // Large square (use sparingly)
      "col-span-1 row-span-1", // Small square (most common)
      "col-span-1 row-span-1", // Small square
      "col-span-2 row-span-1", // Wide rectangle
      "col-span-1 row-span-1", // Small square
      "col-span-1 row-span-1"  // Small square
    ];
    
    // For the first image, make it a showcase piece
    if (index === 0) return "col-span-2 row-span-2";
    
    return patterns[index % patterns.length];
  };

  return (
    <div className="mt-3 w-full">
      <div className="grid grid-cols-6 auto-rows-[minmax(70px,_90px)] gap-2">
        {images.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`relative group overflow-hidden ${getSpanClass(index)}`}
            style={{ borderRadius: "24px" }}
          >
            <img
              src={`${item.image}?w=400&h=400&fit=crop&auto=format`}
              srcSet={`${item.image}?w=400&h=400&fit=crop&auto=format&dpr=2 2x`}
              alt={item.title || "Mood board image"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
              <p className="text-white p-2 text-xs font-medium truncate">{item.title || "Image"}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function ChatUI() {
  const [messages, setMessages] = useState([
    { text: "Welcome! I'll help you create the perfect mood board. Start by describing what you're looking for.", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [industry, setIndustry] = useState("");
  const [font, setFont] = useState("");
  const [designStyle, setDesignStyle] = useState("");
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const colorPickerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Format preferences as tags for better visibility
    let preferences = [];
    if (industry) preferences.push(`Industry: ${industry}`);
    if (font) preferences.push(`Font: ${font}`);
    if (selectedColor) preferences.push(`Color: ${selectedColor}`);
    if (designStyle) preferences.push(`Style: ${designStyle}`);

    const preferencesText = preferences.length > 0 
      ? `\n[Preferences: ${preferences.join(' • ')}]` 
      : "";

    const userMessage = input + preferencesText;

    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.get("http://localhost:3000/search", {
        params: { q: input, industry, font, color: selectedColor, designStyle },
      });

      const { images, aiSuggestions } = response.data;
      
      // For demo, ensuring we have enough images
      const extendedImages = [...images];
      while (extendedImages.length < 10) {
        extendedImages.push(...images.slice(0, Math.min(10 - extendedImages.length, images.length)));
      }
      
      // Add bot message with AI suggestions if available
      if (aiSuggestions) {
        setMessages((prev) => [
          ...prev,
          { text: aiSuggestions, sender: "bot" }
        ]);
      }
      
      // Add bot message with images
      setMessages((prev) => [
        ...prev,
        { 
          text: "Here are some inspiration images based on your request:", 
          images: extendedImages.slice(0, 10), 
          sender: "bot" 
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { 
          text: "I couldn't fetch images at the moment. Please try again or check your connection.", 
          sender: "bot",
          error: true
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-black text-white">
      {/* Header */}
      <header className="px-6 py-3 border-b border-white/20 flex justify-between items-center bg-black/95 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-white" />
          Mood Board Generator
        </h1>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/70 hover:text-white transition rounded-full px-4 py-1 border border-white/20 hover:border-white"
          style={{ borderRadius: "24px" }}
        >
          {collapsed ? "Show Options" : "Hide Options"}
        </button>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`max-w-[95%] ${
                msg.sender === "user"
                  ? "ml-auto"
                  : ""
              }`}
            >
              <div 
                className={`p-3 ${
                  msg.sender === "user"
                    ? "bg-white text-black"
                    : msg.error 
                      ? "bg-black border border-white/50 text-white" 
                      : "bg-black border border-white/20 text-white"
                }`}
                style={{ borderRadius: "24px" }}
              >
                {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                {msg.images && <ImageRenderer images={msg.images} />}
              </div>
              <div className={`text-xs text-white/70 mt-1 ${
                msg.sender === "user" ? "text-right" : "text-left"
              }`}>
                {msg.sender === "user" ? "You" : "AI Assistant"}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loader Animation */}
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2 p-3 bg-black border border-white/20 text-white max-w-[85%]"
            style={{ borderRadius: "24px" }}
          >
            <Loader2 className="animate-spin text-white w-5 h-5" />
            <p className="text-sm text-white/80">Generating mood board...</p>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input & Controls */}
      <div className="border-t border-white/20 bg-black w-full">
        {/* Options Panel */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="px-6 py-3 grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {/* Industry Selector */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/70 flex items-center">
                  <Building className="w-3 h-3 mr-1" /> Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-black border border-white/20 text-white px-3 py-1 focus:ring-2 focus:ring-white focus:outline-none text-sm"
                  style={{ borderRadius: "24px" }}
                >
                  <option value="">Any Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Health">Health</option>
                  <option value="Finance">Finance</option>
                  <option value="Food">Food & Beverage</option>
                  <option value="Travel">Travel</option>
                  <option value="Education">Education</option>
                </select>
              </div>

              {/* Font Selector */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/70 flex items-center">
                  <Type className="w-3 h-3 mr-1" /> Typography
                </label>
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value)}
                  className="w-full bg-black border border-white/20 text-white px-3 py-1 focus:ring-2 focus:ring-white focus:outline-none text-sm"
                  style={{ borderRadius: "24px" }}
                >
                  <option value="">Any Font</option>
                  <option value="Sans-serif">Sans-serif</option>
                  <option value="Serif">Serif</option>
                  <option value="Monospace">Monospace</option>
                  <option value="Handwritten">Handwritten</option>
                  <option value="Display">Display</option>
                  <option value="Slab-serif">Slab-serif</option>
                </select>
              </div>

              {/* Design Style Selector */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/70 flex items-center">
                  <Image className="w-3 h-3 mr-1" /> Design Style
                </label>
                <select
                  value={designStyle}
                  onChange={(e) => setDesignStyle(e.target.value)}
                  className="w-full bg-black border border-white/20 text-white px-3 py-1 focus:ring-2 focus:ring-white focus:outline-none text-sm"
                  style={{ borderRadius: "24px" }}
                >
                  <option value="">Any Style</option>
                  <option value="Minimalist">Minimalist</option>
                  <option value="Modern">Modern</option>
                  <option value="Vintage">Vintage</option>
                  <option value="Futuristic">Futuristic</option>
                  <option value="Retro">Retro</option>
                  <option value="Organic">Organic</option>
                  <option value="Geometric">Geometric</option>
                  <option value="Abstract">Abstract</option>
                </select>
              </div>

              {/* Color Picker */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/70 flex items-center">
                  <Palette className="w-3 h-3 mr-1" /> Color Theme
                </label>
                <div className="relative" ref={colorPickerRef}>
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-full bg-black border border-white/20 text-white px-3 py-1 focus:ring-2 focus:ring-white focus:outline-none text-sm flex items-center justify-between"
                    style={{ borderRadius: "24px" }}
                  >
                    <span>{selectedColor}</span>
                    <div 
                      className="w-6 h-6 ml-2 border border-white/30" 
                      style={{ backgroundColor: selectedColor, borderRadius: "12px" }}
                    />
                  </button>
                  {showColorPicker && (
                    <div className="absolute mt-2 z-50">
                      <SketchPicker
                        color={selectedColor}
                        onChange={(color) => setSelectedColor(color.hex)}
                        presetColors={[
                          "#FFFFFF", "#F5F5F5", "#D1D1D1", "#A9A9A9", 
                          "#808080", "#696969", "#404040", "#303030",
                          "#1A1A1A", "#0D0D0D", "#000000", "#747474"
                        ]}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Input */}
        <div className="px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Describe what you're looking for..."
                className="w-full bg-black border border-white/20 text-white px-4 py-2 pr-12 focus:ring-2 focus:ring-white focus:outline-none resize-none min-h-[48px] max-h-32"
                style={{ borderRadius: "24px" }}
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white hover:bg-white/90 disabled:bg-white/20 text-black p-2 transition-colors"
                style={{ borderRadius: "50%" }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          <p className="text-xs text-white/50 mt-1 ml-1">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}