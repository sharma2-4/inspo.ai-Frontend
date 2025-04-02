import { useState, useRef, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import { AnimatePresence } from "framer-motion";
import DesignSettingsSidebar from "./components/DesignSettingsSidebar";
import ChatArea from "./components/ChatArea";
import MoodboardPreview from "./components/MoodboardPreview";
import DesignCanvas from "./components/DesignCanvas"; // Import the new component

import {
  Send,
  Loader2,
  X,
  Download,
  Palette,
  PanelLeft,
  PanelRight,
  Sliders,
  Layout,
} from "lucide-react";

export default function Dashboard() {
  // State for messages
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'll help you create a design moodboard. What kind of project are you working on?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Design preferences
  const [industry, setIndustry] = useState("");
  const [font, setFont] = useState("");
  const [designStyle, setDesignStyle] = useState("");
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPalette, setColorPalette] = useState([
    "#000000",
    "#333333",
    "#666666",
    "#999999",
    "#CCCCCC",
    "#FFFFFF",
  ]);
  const [relatedTerms, setRelatedTerms] = useState([
    "minimalist", 
    "modern", 
    "vibrant", 
    "elegant", 
    "professional"
  ]);

  // UI state
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showMoodboardPreview, setShowMoodboardPreview] = useState(false);
  const [moodboardLayout, setMoodboardLayout] = useState("grid");
  const [imageStyle, setImageStyle] = useState("natural");
  const [apiEndpoint, setApiEndpoint] = useState("https://inspo-ai-backend.onrender.com");
  const [assetTypes, setAssetTypes] = useState({
    images: true,
    vectors: false,
    psd: false
  });
  
  // Canvas-related state
  const [showCanvas, setShowCanvas] = useState(false);
  const [extractedColors, setExtractedColors] = useState([]);

  // Refs
  const colorPickerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const moodboardRef = useRef(null);

  // Dropdown options
  const industryOptions = [
    { value: "", label: "Select Industry" },
    { value: "Technology", label: "Technology" },
    { value: "Fashion", label: "Fashion" },
    { value: "Health", label: "Health" },
    { value: "Finance", label: "Finance" },
    { value: "Education", label: "Education" },
    { value: "Food", label: "Food & Beverage" },
    { value: "Real Estate", label: "Real Estate" },
    { value: "Entertainment", label: "Entertainment" },
    { value: "E-commerce", label: "E-commerce" },
    { value: "Travel", label: "Travel & Tourism" },
  ];

  const fontOptions = [
    { value: "", label: "Select Font" },
    { value: "Sans-serif", label: "Sans-serif" },
    { value: "Serif", label: "Serif" },
    { value: "Monospace", label: "Monospace" },
    { value: "Handwritten", label: "Handwritten" },
    { value: "Display", label: "Display" },
    { value: "Slab Serif", label: "Slab Serif" },
    { value: "Geometric", label: "Geometric" },
    { value: "Humanist", label: "Humanist" },
  ];

  const designStyleOptions = [
    { value: "", label: "Select Design Style" },
    { value: "Minimalist", label: "Minimalist" },
    { value: "Modern", label: "Modern" },
    { value: "Vintage", label: "Vintage" },
    { value: "Futuristic", label: "Futuristic" },
    { value: "Organic", label: "Organic" },
    { value: "Brutalist", label: "Brutalist" },
    { value: "Retro", label: "Retro" },
    { value: "Corporate", label: "Corporate" },
    { value: "Playful", label: "Playful" },
    { value: "Glassmorphism", label: "Glassmorphism" },
    { value: "Neumorphic", label: "Neumorphic" },
  ];

  const imageStyleOptions = [
    { value: "natural", label: "Natural" },
    { value: "rounded", label: "Rounded" },
    { value: "polaroid", label: "Polaroid" },
    { value: "framed", label: "Framed" },
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close color picker if user clicks outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target)
      ) {
        setShowColorPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extract color palette from AI response
  const extractColorPalette = (text) => {
    const hexCodeRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
    const matches = text.match(hexCodeRegex) || [];
    return matches.length > 0 ? matches : colorPalette;
  };

  // Toggle asset type selection
  const toggleAssetType = (type) => {
    setAssetTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Handle colors extracted from the canvas
  const handleExtractColors = (colors) => {
    if (colors && colors.length > 0) {
      setExtractedColors(prev => {
        // Avoid duplicates
        const newColors = colors.filter(color => !prev.includes(color));
        return [...prev, ...newColors];
      });
      
      // Also add to the main color palette
      setColorPalette(prev => {
        const newColors = colors.filter(color => !prev.includes(color));
        return [...prev, ...newColors];
      });
    }
  };

  // Send user message + fetch data
  const sendMessage = async () => {
    if (!input.trim()) return;
  
    // Combine design prefs with user input
    const userMessage = `${input}${
      industry ? ` | Industry: ${industry}` : ""
    }${font ? ` | Font: ${font}` : ""}${
      designStyle ? ` | Style: ${designStyle}` : ""
    }${selectedColor !== "#000000" ? ` | Color: ${selectedColor}` : ""}`;
  
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setInput("");
    setLoading(true);
  
    try {
      // Build query parameters including asset types
      const queryParams = {
        q: input,
        industry,
        font,
        color: selectedColor,
        designStyle,
        imageType: assetTypes.images ? 'true' : 'false',
        vectorType: assetTypes.vectors ? 'true' : 'false',
        psdType: assetTypes.psd ? 'true' : 'false'
      };
  
      const response = await axios.get(`${apiEndpoint}/search`, {
        params: queryParams
      });
  
      const { images, aiSuggestions, relatedTerms: terms, colorPalette: newPalette } = response.data;
  
      // Update state with new data
      if (terms && terms.length) {
        setRelatedTerms(terms);
      }
  
      // Extract and update color palette
      const extractedPalette = extractColorPalette(aiSuggestions);
      if (extractedPalette.length > 0) {
        setColorPalette(extractedPalette);
      } else if (newPalette && newPalette.length > 0) {
        setColorPalette(newPalette);
      }
  
      // Process and categorize images
      const processedImages = images.map(img => ({
        ...img,
        format: img.fileType || (img.url?.endsWith('.svg') ? 'vector' : 
                              img.url?.endsWith('.psd') ? 'psd' : 'image')
      }));
  
      // Group images by category for better organization
      const groupedImages = {};
      processedImages.forEach(img => {
        const category = img.category || 'Design Inspiration';
        if (!groupedImages[category]) {
          groupedImages[category] = [];
        }
        groupedImages[category].push(img);
      });
  
      // First, add image groups as messages
      Object.entries(groupedImages).forEach(([category, imgs]) => {
        setMessages(prev => [
          ...prev, 
          { 
            categoryTitle: category,
            images: imgs, 
            sender: "bot" 
          }
        ]);
      });
  
      // Then add AI suggestions with color palette
      setMessages(prev => [
        ...prev, 
        { 
          text: aiSuggestions, 
          sender: "bot",
          colorPalette: extractedPalette.length > 0 ? extractedPalette : newPalette,
          heading: "Design Suggestions"
        }
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I couldn't fetch design inspiration at the moment. Please try again.",
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Toggle selection for moodboard
  // Add this improved toggleImageSelection function to your Dashboard.jsx

  const toggleImageSelection = (image) => {
    setSelectedImages((prev) => {
      // Check if this image already exists in the selection
      const imageExists = prev.some((img) => 
        (img.image && image.image && img.image === image.image) ||
        (img.url && image.url && img.url === image.url) ||
        (img.image && image.url && img.image === image.url) ||
        (img.url && image.image && img.url === image.image)
      );
      
      // If image exists, remove it; otherwise add it
      if (imageExists) {
        return prev.filter((img) => !(
          (img.image && image.image && img.image === image.image) ||
          (img.url && image.url && img.url === image.url) ||
          (img.image && image.url && img.image === image.url) ||
          (img.url && image.image && img.url === image.image)
        ));
      } else {
        // Normalize the image object to have both image and url properties if possible
        const normalizedImage = { 
          ...image,
          image: image.image || image.url,
          url: image.url || image.image
        };
        return [...prev, normalizedImage];  
    }
  });
  
  // Optionally open the canvas automatically when adding an image
  if (!showCanvas) {
    setShowCanvas(true);
  }
};

  // Download moodboard
  const downloadMoodboard = async () => {
    if (!moodboardRef.current) return;
    try {
      const canvas = await html2canvas(moodboardRef.current);
      const link = document.createElement("a");
      link.download = "moodboard.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Failed to download moodboard:", error);
    }
  };

  // Export palette as CSS variables
  const exportColorPalette = () => {
    let cssVars = ":root {\n";
    colorPalette.forEach((color, index) => {
      cssVars += `  --color-${index + 1}: ${color};\n`;
    });
    cssVars += "}";
    
    const blob = new Blob([cssVars], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "color-palette.css";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper to check if message contains a clickable element
  const hasInteractiveElements = (message) => {
    return message.images || 
           (message.colorPalette && message.colorPalette.length > 0);
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <DesignSettingsSidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        industry={industry}
        setIndustry={setIndustry}
        font={font}
        setFont={setFont}
        designStyle={designStyle}
        setDesignStyle={setDesignStyle}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        showColorPicker={showColorPicker}
        setShowColorPicker={setShowColorPicker}
        colorPalette={colorPalette}
        colorPickerRef={colorPickerRef}
        relatedTerms={relatedTerms}
        setInput={setInput}
        selectedImages={selectedImages}
        setShowMoodboardPreview={setShowMoodboardPreview}
        industryOptions={industryOptions}
        fontOptions={fontOptions}
        designStyleOptions={designStyleOptions}
        exportColorPalette={exportColorPalette}
        showCanvas={showCanvas}
        extractedColors={extractedColors}
      />

      {/* Main Chat Area */}
      <ChatArea
        messages={messages}
        loading={loading}
        input={input}
        setInput={setInput}
        handleKeyPress={handleKeyPress}
        sendMessage={sendMessage}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        showAdvancedOptions={showAdvancedOptions}
        setShowAdvancedOptions={setShowAdvancedOptions}
        relatedTerms={relatedTerms}
        messagesEndRef={messagesEndRef}
        moodboardLayout={moodboardLayout}
        setMoodboardLayout={setMoodboardLayout}
        imageStyle={imageStyle}
        setImageStyle={setImageStyle}
        imageStyleOptions={imageStyleOptions}
        colorPalette={colorPalette}
        assetTypes={assetTypes}
        toggleAssetType={toggleAssetType}
        hasInteractiveElements={hasInteractiveElements}
        toggleImageSelection={toggleImageSelection}
        selectedImages={selectedImages}
        showCanvas={showCanvas}
        setShowCanvas={setShowCanvas}
      />

      {/* Moodboard Preview */}
      <AnimatePresence>
        {showMoodboardPreview && (
          <MoodboardPreview
            showMoodboardPreview={showMoodboardPreview}
            setShowMoodboardPreview={setShowMoodboardPreview}
            downloadMoodboard={downloadMoodboard}
            moodboardRef={moodboardRef}
            colorPalette={colorPalette}
            designStyle={designStyle}
            industry={industry}
            font={font}
            selectedImages={selectedImages}
            moodboardLayout={moodboardLayout}
            imageStyle={imageStyle}
            exportColorPalette={exportColorPalette}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
