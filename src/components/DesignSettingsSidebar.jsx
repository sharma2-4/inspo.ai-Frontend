// DesignSettingsSidebar.jsx
import { motion } from "framer-motion";
import { X, Palette, Layout, Download, Plus, Sliders } from "lucide-react";
import { SketchPicker } from "react-color";

export default function DesignSettingsSidebar({
  showSidebar,
  setShowSidebar,
  industry,
  setIndustry,
  font,
  setFont,
  designStyle,
  setDesignStyle,
  selectedColor,
  setSelectedColor,
  showColorPicker,
  setShowColorPicker,
  colorPalette,
  colorPickerRef,
  relatedTerms,
  setInput,
  selectedImages,
  setShowMoodboardPreview,
  industryOptions,
  fontOptions,
  designStyleOptions,
  exportColorPalette,
  setShowCanvas,
  showCanvas,
  extractedColors = []
}) {
  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: showSidebar ? 0 : -300 }}
      exit={{ x: -300 }}
      transition={{ duration: 0.3 }}
      className={`${showSidebar ? "block" : "hidden"
        } w-64 border-r border-gray-800 p-4 flex flex-col gap-4 bg-gray-900 backdrop-blur-lg`}
    >
      <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
        Design Settings
      </h2>

      {/* Industry Dropdown */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-300">Industry</label>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded-full focus:ring-2 focus:ring-white border border-gray-700"
        >
          {industryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Dropdown */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-300">Typography</label>
        <select
          value={font}
          onChange={(e) => setFont(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded-full focus:ring-2 focus:ring-white border border-gray-700"
        >
          {fontOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Design Style Dropdown */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-300">Design Style</label>
        <select
          value={designStyle}
          onChange={(e) => setDesignStyle(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded-full focus:ring-2 focus:ring-white border border-gray-700"
        >
          {designStyleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Color Selector */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-300">Primary Color</label>
        <div className="relative" ref={colorPickerRef}>
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-2 bg-gray-800 text-white p-2 rounded-full w-full focus:ring-2 focus:ring-white border border-gray-700"
          >
            <div
              className="w-6 h-6 rounded-full border-2 border-gray-700"
              style={{ backgroundColor: selectedColor }}
            />
            {selectedColor}
          </button>

          {showColorPicker && (
            <div className="absolute top-12 left-0 z-50 shadow-lg rounded-lg">
              <div className="bg-gray-900 p-2 rounded-t-lg flex justify-between">
                <span className="text-sm">Select Color</span>
                <button
                  onClick={() => setShowColorPicker(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <SketchPicker
                color={selectedColor}
                onChange={(color) => setSelectedColor(color.hex)}
                presetColors={colorPalette}
              />
            </div>
          )}
        </div>
      </div>

      {/* Color Palette */}
      {colorPalette.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-300">Color Palette</label>
            <button
              onClick={exportColorPalette}
              className="text-xs bg-gray-800 px-2 py-1 rounded-full hover:bg-gray-700"
              title="Export as CSS variables"
            >
              <Download size={12} className="inline mr-1" /> Export
            </button>
          </div>
          <div className="flex gap-1 flex-wrap">
            {colorPalette.map((clr, index) => (
              <button
                key={index}
                className="w-8 h-8 rounded-full border border-gray-700 transition-transform hover:scale-110"
                style={{ backgroundColor: clr }}
                onClick={() => setSelectedColor(clr)}
                title={clr}
              />
            ))}
          </div>
        </div>
      )}

      {/* Extracted Colors from Canvas */}
      {extractedColors && extractedColors.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Extracted Colors</label>
          <div className="flex gap-1 flex-wrap">
            {extractedColors.map((clr, index) => (
              <button
                key={`extracted-${index}`}
                className="w-8 h-8 rounded-full border border-gray-700 transition-transform hover:scale-110"
                style={{ backgroundColor: clr }}
                onClick={() => setSelectedColor(clr)}
                title={clr}
              />
            ))}
          </div>
        </div>
      )}

      {/* Related Terms */}
      {relatedTerms.length > 0 && (
        <div className="flex flex-col gap-1 mt-2">
          <label className="text-sm text-gray-300">Related Terms</label>
          <div className="flex gap-1 flex-wrap">
            {relatedTerms.map((term, index) => (
              <button
                key={index}
                className="px-3 py-1 bg-gray-800 rounded-full text-xs hover:bg-gray-700 border border-gray-700"
                onClick={() =>
                  setInput((prev) => (prev ? `${prev} ${term}` : term))
                }
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto space-y-2">
        {/* Design Canvas Button */}

        {/* Selected Images Counter */}
        {selectedImages.length > 0 && (
          <button
            onClick={() => setShowMoodboardPreview(true)}
            className="w-full p-2 bg-gradient-to-r from-gray-700 to-black text-white rounded-full flex items-center justify-center gap-2 hover:from-white hover:to-gray-700 hover:text-black transition-all border border-gray-700"
          >
            <Palette size={18} />
            View Moodboard ({selectedImages.length})
          </button>
        )}
      </div>
    </motion.div>
  );
}
