import React from 'react';

export default function Toolbar({ 
  color, 
  setColor, 
  size, 
  setSize, 
  shape, 
  setShape,
  fill,
  setFill,
  clearCanvas
}) {
  
  const handleUndo = () => {
    if (window.undoCanvas) {
      window.undoCanvas();
    }
  };
  
  const handleRedo = () => {
    if (window.redoCanvas) {
      window.redoCanvas();
    }
  };

  return (
    <div className="toolbar">
      
      <div className="history-controls">
        <button onClick={handleUndo} className="tool-button">
          Undo
        </button>
        <button onClick={handleRedo} className="tool-button">
          Redo
        </button>
      </div>
      
    </div>
  );
}