import { useState, useRef, useEffect } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [draggedText, setDraggedText] = useState({});
  const [isDragging, setDragging] = useState(false);
  const [canvasElements, setCanvasElements] = useState([]);

  useEffect(() => {
    // create canvas
    const canvas = canvasRef.current;
    canvas.width = 600;
    canvas.height = 600;

    // create canvas context
    ctxRef.current = canvas.getContext("2d");
    ctxRef.current.font = "50px Ariel";
  }, []);

  // repaint screen everytmie the compoent renders
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasElements.forEach((item) => {
        ctxRef.current.fillText(item.text, item.x, item.y);
      });
    }
  }, [canvasElements]);

  // canvas utility functions
  function createText(text, x, y) {
    ctxRef.current.fillText(text, x, y);
    const metrics = ctxRef.current.measureText(text);
    setCanvasElements((prev) => [...prev, { text, x, y, metrics }]);
  }
  function removeText(x, y) {
    let newArray = canvasElements.filter((item) => item.x !== x || item.y !== y);
    setCanvasElements(newArray);
  }

  // event handlers
  function handleCreateText(e) {
    createText("hello", 250, 250);
  }
  function handleDeleteText(e) {
    removeText(250, 250);
  }
  function handleGrabText(e) {
    const { offsetX, offsetY } = e.nativeEvent;

    let ele = canvasElements.find((item) => offsetX >= item.x && offsetX <= item.x + item.metrics.width && offsetY >= item.y - item.metrics.actualBoundingBoxAscent && offsetY <= item.y + item.metrics.actualBoundingBoxDescent);

    if (ele) {
      setDraggedText(ele);
      setDragging((prev) => !prev);
    }
  }
  function handleDragText(e) {
    if (draggedText && isDragging) {
      const { offsetX, offsetY } = e.nativeEvent;
      removeText(draggedText.x, draggedText.y);
      let newX = offsetX - 15;
      let newY = offsetY + 15;
      createText("hello", newX, newY);
      setDraggedText((prev) => ({ ...prev, x: newX, y: newY }));
    }
  }

  return (
    <div className="pretend-root bg-zinc-600 h-screen w-screen">
      <header></header>
      <canvas ref={canvasRef} className="bg-slate-100" onDoubleClick={handleGrabText} onMouseMove={handleDragText}></canvas>
      <textarea></textarea>
      <button id="create" onClick={handleCreateText}>
        Create
      </button>
      <button id="delete" onClick={handleDeleteText}></button>
      <footer></footer>
    </div>
  );
}
