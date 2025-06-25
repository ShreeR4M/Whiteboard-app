import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export default function Canvas({ width, height, color = 'black', size = 5, shape = 'line', fill = false }) {
  const canvasRef = useRef(null);
  const ctx = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);

  // Add history state
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useLayoutEffect(() => {
    ctx.current = canvasRef.current.getContext('2d');
  }, []);

  const getCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      offsetX: (e.clientX - rect.left) * scaleX,
      offsetY: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    const { offsetX, offsetY } = getCoordinates(e);
    ctx.current.beginPath();
    ctx.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    setStartPoint({ x: offsetX, y: offsetY });
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const { offsetX, offsetY } = getCoordinates(e);
    
    if (shape === 'line') {
      ctx.current.lineTo(offsetX, offsetY);
      ctx.current.stroke();
    } else {
      // ...existing code...
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    ctx.current.closePath();
    setIsDrawing(false);
    
    // Save the current state to history when drawing stops
    const canvasState = canvasRef.current.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    setHistory([...newHistory, canvasState]);
    setHistoryStep(newHistory.length);
  };
  
  // Undo function - go back one step in history
  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
    }
  };
  
  // Redo function - go forward one step in history
  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
    }
  };
  
  // Apply history changes when historyStep changes
  useEffect(() => {
    if (historyStep === -1) {
      // Clear canvas for initial state
      clearCanvas();
      return;
    }
    
    const img = new Image();
    img.src = history[historyStep];
    img.onload = () => {
      ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.current.drawImage(img, 0, 0);
    };
  }, [historyStep]);

  // Save initial canvas state
  useEffect(() => {
    // Initialize with blank canvas in history
    if (history.length === 0) {
      const canvasState = canvasRef.current.toDataURL();
      setHistory([canvasState]);
      setHistoryStep(0);
    }
  }, []);

  // Clear canvas function
  const clearCanvas = () => {
    ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    // Add cleared state to history
    const canvasState = canvasRef.current.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    setHistory([...newHistory, canvasState]);
    setHistoryStep(newHistory.length);
  };
  
  // Export undo/redo functions for parent components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.undoCanvas = undo;
      window.redoCanvas = redo;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.undoCanvas;
        delete window.redoCanvas;
      }
    };
  }, [historyStep, history]);

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="drawing-canvas"
      />
    </div>
  );
}