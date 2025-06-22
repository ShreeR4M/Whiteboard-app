import * as fabric from 'fabric';

class FabricEventsManager {
  constructor(canvas, socketManager) {
    this.canvas = canvas;
    this.socketManager = socketManager;
    this.isReceivingEvent = false;
    this.setupCanvasEvents();
  }

  setupCanvasEvents() {
    if (!this.canvas) return;

    this.canvas.on('path:created', (e) => {
      if (this.isReceivingEvent) return;
      
      const pathData = e.path.toObject();
      this.socketManager.sendDrawingEvent({
        type: 'path:created',
        data: pathData
      });
    });

    this.canvas.on('object:modified', (e) => {
      if (this.isReceivingEvent) return;
      
      this.socketManager.sendDrawingEvent({
        type: 'object:modified',
        data: {
          objectId: e.target.id,
          object: e.target.toObject()
        }
      });
    });

    this.canvas.on('object:added', (e) => {
      if (this.isReceivingEvent) return;
      if (e.target.type === 'path') return; 
      
      this.socketManager.sendDrawingEvent({
        type: 'object:added',
        data: {
          object: e.target.toObject(),
          objectId: e.target.id
        }
      });
    });

    this.canvas.on('object:removed', (e) => {
      if (this.isReceivingEvent) return;
      
      this.socketManager.sendDrawingEvent({
        type: 'object:removed',
        data: {
          objectId: e.target.id
        }
      });
    });
  }

  handleRemoteDrawingEvent(eventData) {
    this.isReceivingEvent = true;
    
    try {
      switch (eventData.type) {
        case 'path:created':
          this.handlePathCreated(eventData.data);
          break;
        case 'object:added':
          this.handleObjectAdded(eventData.data);
          break;
        case 'object:modified':
          this.handleObjectModified(eventData.data);
          break;
        case 'object:removed':
          this.handleObjectRemoved(eventData.data);
          break;
        default:
          console.warn('Unknown drawing event type:', eventData.type);
      }
    } catch (error) {
      console.error('Error handling remote drawing event:', error);
    } finally {
      this.isReceivingEvent = false;
    }
  }

  async handlePathCreated(pathData) {
    try {
      const path = await fabric.Path.fromObject(pathData);
      this.canvas.add(path);
      this.canvas.renderAll();
    } catch (error) {
      console.error('Error creating path from remote data:', error);
    }
  }

  async handleObjectAdded(data) {
    try {
      const objects = await fabric.util.enlivenObjects([data.object]);
      if (objects && objects.length > 0) {
        const obj = objects[0];
        obj.id = data.objectId;
        this.canvas.add(obj);
        this.canvas.renderAll();
      }
    } catch (error) {
      console.error('Error adding object from remote data:', error);
    }
  }

  async handleObjectModified(data) {
    try {
      const existingObject = this.canvas.getObjects().find(obj => obj.id === data.objectId);
      if (existingObject) {
        const objects = await fabric.util.enlivenObjects([data.object]);
        if (objects && objects.length > 0) {
          const updatedObj = objects[0];
          updatedObj.id = data.objectId;
          
          this.canvas.remove(existingObject);
          this.canvas.add(updatedObj);
          this.canvas.renderAll();
        }
      }
    } catch (error) {
      console.error('Error modifying object from remote data:', error);
    }
  }

  handleObjectRemoved(data) {
    const objectToRemove = this.canvas.getObjects().find(obj => obj.id === data.objectId);
    if (objectToRemove) {
      this.canvas.remove(objectToRemove);
      this.canvas.renderAll();
    }
  }

  handleCanvasCleared() {
    this.isReceivingEvent = true;
    this.canvas.clear();
    this.canvas.backgroundColor = 'white';
    this.canvas.renderAll();
    this.isReceivingEvent = false;
  }

  clearCanvas() {
    this.canvas.clear();
    this.canvas.backgroundColor = 'white';
    this.canvas.renderAll();
    this.socketManager.clearCanvas();
  }

  saveCanvas() {
    const canvasData = this.canvas.toJSON();
    this.socketManager.saveCanvas(canvasData);
  }

  loadCanvasData(canvasData) {
    if (!canvasData) return;
    
    this.isReceivingEvent = true;
    this.canvas.loadFromJSON(canvasData, () => {
      this.canvas.renderAll();
      this.isReceivingEvent = false;
    });
  }

  setDrawingMode(isDrawing) {
    this.canvas.isDrawingMode = isDrawing;
  }

  setBrush(color, width) {
    if (this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.color = color;
      this.canvas.freeDrawingBrush.width = width;
    }
  }

  setSelection(enabled) {
    this.canvas.selection = enabled;
    this.canvas.forEachObject(obj => {
      obj.selectable = enabled;
    });
  }

  addRectangle(options = {}) {
    const rect = new fabric.Rect({
      left: options.left || 100,
      top: options.top || 100,
      width: options.width || 100,
      height: options.height || 80,
      fill: options.fill || 'transparent',
      stroke: options.stroke || '#000000',
      strokeWidth: options.strokeWidth || 2,
      id: options.id || Date.now().toString()
    });
    
    this.canvas.add(rect);
    this.canvas.setActiveObject(rect);
    this.canvas.renderAll();
    return rect;
  }

  addCircle(options = {}) {
    const circle = new fabric.Circle({
      left: options.left || 100,
      top: options.top || 100,
      radius: options.radius || 50,
      fill: options.fill || 'transparent',
      stroke: options.stroke || '#000000',
      strokeWidth: options.strokeWidth || 2,
      id: options.id || Date.now().toString()
    });
    
    this.canvas.add(circle);
    this.canvas.setActiveObject(circle);
    this.canvas.renderAll();
    return circle;
  }

  addText(text, options = {}) {
    const textObj = new fabric.Text(text, {
      left: options.left || 100,
      top: options.top || 100,
      fontFamily: options.fontFamily || 'Arial',
      fontSize: options.fontSize || 20,
      fill: options.fill || '#000000',
      id: options.id || Date.now().toString()
    });
    
    this.canvas.add(textObj);
    this.canvas.setActiveObject(textObj);
    this.canvas.renderAll();
    return textObj;
  }
}

export default FabricEventsManager;