import React from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Type, RotateCw } from 'lucide-react';

// This component handles individual moodboard items (images and text)
const MoodboardItem = ({
  item,
  isSelected,
  isEditing,
  textValue,
  handleSelectItem,
  handleDrag,
  handleRemoveItem,
  handleDuplicateItem,
  handleDoubleClickText,
  handleTextChange,
  saveFinalText,
  rotateItem,
  handleResizeStart,
  textInputRef
}) => {
  // For text items
  if (item.type === 'text') {
    return (
      <motion.div
        className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          x: item.position.x,
          y: item.position.y,
          zIndex: item.zIndex,
          transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg)`,
          width: item.size.width,
          minHeight: item.size.height
        }}
        drag={!isEditing}
        dragMomentum={false}
        onDragStart={() => handleSelectItem(item.id)}
        onDrag={(_, info) => handleDrag(item.id, info)}
        onClick={() => handleSelectItem(item.id)}
        onDoubleClick={() => handleDoubleClickText(item)}
      >
        <div 
          className="relative group p-2 bg-transparent rounded-lg overflow-hidden text-white"
          style={{
            width: '100%',
            minHeight: '100%',
            fontFamily: item.fontFamily || 'sans-serif'
          }}
        >
          {isEditing ? (
            <textarea
              ref={textInputRef}
              value={textValue}
              onChange={handleTextChange}
              onBlur={saveFinalText}
              className="w-full h-full bg-transparent border-none outline-none resize-none text-white p-0"
              style={{
                fontSize: `${item.fontSize || 18}px`,
                color: item.fontColor || '#ffffff',
                fontFamily: item.fontFamily || 'sans-serif'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div 
              style={{
                fontSize: `${item.fontSize || 18}px`,
                color: item.fontColor || '#ffffff',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {item.text || "Double-click to edit text"}
            </div>
          )}
          
          {isSelected && !isEditing && (
            <div className="absolute -top-3 -right-3 flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDoubleClickText(item);
                }}
                className="p-1 bg-green-500 rounded-full hover:bg-green-600"
                title="Edit Text"
              >
                <Type size={12} className="text-white" />
              </button>
              <button
                onClick={(e) => handleDuplicateItem(item, e)}
                className="p-1 bg-blue-500 rounded-full hover:bg-blue-600"
                title="Duplicate"
              >
                <Copy size={12} className="text-white" />
              </button>
              <button
                onClick={(e) => handleRemoveItem(item.id, e)}
                className="p-1 bg-red-500 rounded-full hover:bg-red-600"
                title="Remove"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          )}
          
          {/* Resize handle for text */}
          {isSelected && !isEditing && (
            <div 
              className="absolute right-0 bottom-0 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize" 
              onMouseDown={(e) => handleResizeStart('se', e, item)}
            />
          )}
        </div>
      </motion.div>
    );
  } 
  
  // For image items
  return (
    <motion.div
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        x: item.position.x,
        y: item.position.y,
        zIndex: item.zIndex,
        transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg)`
      }}
      drag={true}
      dragMomentum={false}
      onDragStart={() => handleSelectItem(item.id)}
      onDrag={(_, info) => handleDrag(item.id, info)}
      onClick={() => handleSelectItem(item.id)}
    >
      <div className="relative group">
        <img
          src={item.src}
          alt={item.title || 'Moodboard item'}
          style={{
            width: item.size.width,
            height: item.size.height,
            objectFit: 'cover'
          }}
          className="rounded-lg shadow-lg"
          draggable={false}
        />
        
        {isSelected && (
          <div className="absolute -top-3 -right-3 flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                rotateItem(item.id, 90);
              }}
              className="p-1 bg-green-500 rounded-full hover:bg-green-600"
              title="Rotate"
            >
              <RotateCw size={12} className="text-white" />
            </button>
            <button
              onClick={(e) => handleDuplicateItem(item, e)}
              className="p-1 bg-blue-500 rounded-full hover:bg-blue-600"
              title="Duplicate"
            >
              <Copy size={12} className="text-white" />
            </button>
            <button
              onClick={(e) => handleRemoveItem(item.id, e)}
              className="p-1 bg-red-500 rounded-full hover:bg-red-600"
              title="Remove"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        )}
        
        {/* Resize handles for images */}
        {isSelected && (
          <>
            <div 
              className="absolute right-0 bottom-0 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize" 
              onMouseDown={(e) => handleResizeStart('se', e, item)}
            />
            <div 
              className="absolute right-0 top-0 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize" 
              onMouseDown={(e) => handleResizeStart('ne', e, item)}
            />
            <div 
              className="absolute left-0 bottom-0 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize" 
              onMouseDown={(e) => handleResizeStart('sw', e, item)}
            />
            <div 
              className="absolute left-0 top-0 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize" 
              onMouseDown={(e) => handleResizeStart('nw', e, item)}
            />
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MoodboardItem;
