import React, { useState, useRef } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import './App.css';

function App() {
  const [color, setColor] = useState('black');
  const [size, setSize] = useState(5);
  const [shape, setShape] = useState('line');
  const [fill, setFill] = useState(false);
  const canvasRef = useRef(null);

  const clearCanvas = () => {
    if (canvasRef.current && canvasRef.current.clearCanvas) {
      canvasRef.current.clearCanvas();
    }
  };

  return (
    <div className="App">
      <h1>Whiteboard App</h1>
      <Toolbar
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
        shape={shape}
        setShape={setShape}
        fill={fill}
        setFill={setFill}
        clearCanvas={clearCanvas}
      />
      <Canvas
        ref={canvasRef}
        width={800}
        height={600}
        color={color}
        size={size}
        shape={shape}
        fill={fill}
      />
    </div>
  );
}

export default App;
