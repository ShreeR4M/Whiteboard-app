import React, { useRef, useEffect, useState } from 'react';
import * as fabric from 'fabric';
import FabricEventsManager from '../utils/fabricEvents';

const Canvas = ({ 
  socketManager, 
  currentTool, 
  currentColor, 
  brushSize,
  onCanvasReady,
  onShapeAdd,
  roomId 
}) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [fabricEvents, setFabricEvents] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const canvasInitializedRef = useRef(false); 

  useEffect(() => {
    if (canvasRef.current && !canvas && !canvasInitializedRef.current) {
      canvasInitializedRef.current = true; 
      console.log('Initializing canvas');
      
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 1200,
        height: 600,
        backgroundColor: 'white',
        selection: false,
        preserveObjectStacking: true
      });

      fabricCanvas.isDrawingMode = currentTool === 'pen';
      fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
      fabricCanvas.freeDrawingBrush.width = brushSize;
      fabricCanvas.freeDrawingBrush.color = currentColor;

      setCanvas(fabricCanvas);
      
      const eventsManager = new FabricEventsManager(fabricCanvas, socketManager);
      setFabricEvents(eventsManager);
      
      if (onCanvasReady) {
        onCanvasReady(fabricCanvas, eventsManager);
      }

      setIsLoading(false);
    }

    return () => {
      if (canvas) {
        console.log('Disposing canvas');
        canvas.dispose();
        setCanvas(null);
        canvasInitializedRef.current = false; 
      }
    };
  }, []); 

  useEffect(() => {
    if (!canvas) return;

    switch (currentTool) {
      case 'pen':
        canvas.isDrawingMode = true;
        canvas.selection = false;
        canvas.forEachObject(obj => {
          obj.selectable = false;
        });
        break;
      
      case 'select':
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.forEachObject(obj => {
          obj.selectable = true;
        });
        break;
      
      case 'eraser':
        canvas.isDrawingMode = true;
        canvas.selection = false;
        canvas.forEachObject(obj => {
          obj.selectable = false;
        });
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = 'white';
        canvas.freeDrawingBrush.width = brushSize * 1.5; 
        break;
      
      default:
        canvas.isDrawingMode = false;
        canvas.selection = false;
    }

    canvas.renderAll();
  }, [canvas, currentTool]);

  useEffect(() => {
    if (!canvas || !canvas.freeDrawingBrush) return;

    if (currentTool === 'pen') {
      canvas.freeDrawingBrush.color = currentColor;
      canvas.freeDrawingBrush.width = brushSize;
    } else if (currentTool === 'eraser') {
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [canvas, currentColor, brushSize, currentTool]);

  useEffect(() => {
    if (!socketManager || !fabricEvents) return;

    const handleDrawingEvent = (eventData) => {
      fabricEvents.handleRemoteDrawingEvent(eventData);
    };

    const handleCanvasCleared = () => {
      fabricEvents.handleCanvasCleared();
    };

    socketManager.on('drawing-event', handleDrawingEvent);
    socketManager.on('canvas-cleared', handleCanvasCleared);

    return () => {
      socketManager.off('drawing-event', handleDrawingEvent);
      socketManager.off('canvas-cleared', handleCanvasCleared);
    };
  }, [socketManager, fabricEvents]);

  useEffect(() => {
    if (onShapeAdd && fabricEvents) {
      onShapeAdd.current = (shapeType, options = {}) => {
        switch (shapeType) {
          case 'rectangle':
            return fabricEvents.addRectangle({
              stroke: currentColor,
              strokeWidth: 2,
              ...options
            });
          
          case 'circle':
            return fabricEvents.addCircle({
              stroke: currentColor,
              strokeWidth: 2,
              ...options
            });
          
          case 'text':
            const text = prompt('Enter text:') || 'Sample Text';
            return fabricEvents.addText(text, {
              fill: currentColor,
              ...options
            });
          
          default:
            console.warn('Unknown shape type:', shapeType);
        }
      };
    }
  }, [fabricEvents, currentColor, onShapeAdd]);

  const getCursorClass = () => {
    switch (currentTool) {
      case 'pen':
        return 'cursor-crosshair';
      case 'select':
        return 'cursor-default';
      case 'eraser':
        return 'cursor-not-allowed';
      default:
        return 'cursor-default';
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="relative bg-white rounded-lg shadow-lg p-4">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">Loading canvas...</span>
            </div>
          </div>
        )}
        
        <div className={`relative ${getCursorClass()}`}>
          <canvas
            ref={canvasRef}
            className="border-2 border-gray-200 rounded-lg"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          
          {}
          {currentTool && (
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {currentTool.charAt(0).toUpperCase() + currentTool.slice(1)} Mode
            </div>
          )}
        </div>

        {}
        <div className="mt-2 text-center text-sm text-gray-500">
          Canvas: 1200 × 600 pixels
          {roomId && (
            <span className="ml-4">Room: {roomId.substring(0, 8)}...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;