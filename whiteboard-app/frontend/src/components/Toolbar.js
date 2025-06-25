import React from 'react';

const Toolbar = ({ 
  currentTool, 
  setCurrentTool, 
  currentColor, 
  setCurrentColor, 
  brushSize, 
  setBrushSize,
  onClearCanvas,
  onSaveCanvas,
  onAddShape,
  onUndo,
  canUndo,
  connectedUsers,
  roomId 
}) => {
  
  const tools = [
    { id: 'pen', label: '✏️ Pen', title: 'Drawing Pen' },
    { id: 'select', label: '👆 Select', title: 'Select & Move Objects' },
    { id: 'eraser', label: '🧹 Eraser', title: 'Eraser Tool' }
  ];

  const shapes = [
    { id: 'rectangle', label: '⬜ Rectangle', title: 'Add Rectangle' },
    { id: 'circle', label: '⭕ Circle', title: 'Add Circle' },
    { id: 'text', label: '📝 Text', title: 'Add Text' }
  ];

  return (
    <div className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Room Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-gray-800">
                Room: {roomId?.substring(0, 8)}...
              </h1>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  {connectedUsers?.length || 0} users online
                </span>
              </div>
            </div>
          </div>

          {/* Main Toolbar */}
          <div className="flex items-center space-x-6">
            
            {/* Drawing Tools */}
            <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setCurrentTool(tool.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTool === tool.id
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-white hover:shadow-sm'
                  }`}
                  title={tool.title}
                >
                  {tool.label}
                </button>
              ))}
            </div>

            {/* Shapes */}
            <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
              {shapes.map(shape => (
                <button
                  key={shape.id}
                  onClick={() => onAddShape(shape.id)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm transition-colors"
                  title={shape.title}
                >
                  {shape.label}
                </button>
              ))}
            </div>

            {/* History Controls */}
            <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  canUndo 
                    ? 'text-gray-700 hover:bg-white hover:shadow-sm' 
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title="Undo Last Action"
              >
                ↩️ Undo
              </button>
            </div>

            {/* Color Picker */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Color:</label>
              <div className="relative">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-10 h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
                  title="Pick Color"
                />
              </div>
            </div>

            {/* Brush Size */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Size:</label>
              <input
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-20"
                title="Brush Size"
              />
              <span className="text-sm text-gray-600 w-8 text-center">{brushSize}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onClearCanvas}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                title="Clear Canvas"
              >
                Clear
              </button>
              <button
                onClick={onSaveCanvas}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                title="Save Canvas"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Toolbar - Tool-specific options */}
        {currentTool === 'pen' && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-600">🎨 Drawing Mode Active</span>
              <span className="text-gray-500">• Click and drag to draw freely</span>
            </div>
          </div>
        )}

        {currentTool === 'select' && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-600">👆 Selection Mode Active</span>
              <span className="text-gray-500">• Click objects to select and move them</span>
            </div>
          </div>
        )}

        {currentTool === 'eraser' && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-600">🧹 Eraser Mode Active</span>
              <span className="text-gray-500">• Click and drag to erase</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;