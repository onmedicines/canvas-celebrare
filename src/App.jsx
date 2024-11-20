import { useState, useRef, useEffect } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [draggedText, setDraggedText] = useState({});
  const [isDragging, setDragging] = useState(false);
  const [canvasElements, setCanvasElements] = useState([]);
  const [text, setText] = useState("");
  const [selectedtext, setSelectedText] = useState(null);
  const [timeLine, setTimeLine] = useState([]);
  const [timeLineCanvas, setTimeLineCanvas] = useState([]);
  const [coordinate, setCoordinate] = useState(-1);
  const [fontSize, setFontSize] = useState(50);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontColor, setFontColor] = useState("#000000");
  const fontOptions = ["Arial", "Times New Roman", "Courier New", "Georgia", "Verdana", "Helvetica", "Comic Sans MS", "Impact"];

  useEffect(() => {
    // create canvas
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    const { width, height } = container.getBoundingClientRect();
    console.log(width, height);
    canvas.width = width;
    canvas.height = height;

    // create canvas context
    ctxRef.current = canvas.getContext("2d");
    ctxRef.current.font = "50px Ariel";
  }, []);

  // repaint screen everytmie the compoent renders
  useEffect(() => {
    if (ctxRef.current) {
      repaintCanvas(canvasElements);
    }
    if (canvasElements.length > 0 && !isDragging) {
      addToTimeline();
    }
  }, [canvasElements]);

  useEffect(() => {
    if (ctxRef.current) {
      repaintCanvas(timeLineCanvas);
    }
  }, [timeLineCanvas]);

  // logger function
  function logAnything() {
    console.log({ timeLine, coordinate, timeLineCanvas });
  }

  // supportive functions
  function addToTimeline() {
    setTimeLine((prev) => [...prev, [...canvasElements]]);
    setCoordinate((prev) => prev + 1);
  }

  // canvas utility functions
  function clearCanvas() {
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setDraggedText({});
    setDragging(false);
    setCanvasElements([]);
    setText("");
    setSelectedText(null);
    setTimeLine([]);
    setTimeLineCanvas([]);
    setCoordinate(-1);
  }
  function repaintCanvas(array) {
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    array.forEach((item) => {
      ctxRef.current.font = `${item.size}px ${item.family}`;
      ctxRef.current.fillStyle = item.color;
      ctxRef.current.fillText(item.text, item.x, item.y);
    });
  }
  function createText(text, x, y, family, color, size) {
    ctxRef.current.font = `${size}px ${family}`;
    ctxRef.current.fillStyle = color;
    ctxRef.current.fillText(text, x, y);
    const metrics = ctxRef.current.measureText(text);
    setCanvasElements((prev) => [...prev, { text, x, y, metrics, family, color, size }]);
    setTimeLineCanvas((prev) => [...prev, { text, x, y, metrics, family, color, size }]);
  }
  function removeText(x, y) {
    let newArray = canvasElements.filter((item) => item.x !== x || item.y !== y);
    setCanvasElements(newArray);
    setTimeLineCanvas(newArray);
  }

  // event handlers
  function handleTextAreaChange(e) {
    const { value } = e.target;
    setText(value);
  }
  function handleCreateText(e) {
    if (text != "") {
      createText(text, 250, 250, fontFamily, fontColor, fontSize);
      setText("");
    }
  }
  function handleSelectText(e) {
    const { offsetX, offsetY } = e.nativeEvent;

    let ele = canvasElements.find((item) => offsetX >= item.x && offsetX <= item.x + item.metrics.width && offsetY >= item.y - item.metrics.actualBoundingBoxAscent && offsetY <= item.y + item.metrics.actualBoundingBoxDescent);

    if (ele) {
      setSelectedText(ele);
    } else {
      setSelectedText(null);
    }
  }
  function handleDeleteText(e) {
    removeText(selectedtext.x, selectedtext.y);
    setSelectedText("");
  }
  function handleGrabText(e) {
    const { offsetX, offsetY } = e.nativeEvent;

    let ele = canvasElements.find((item) => offsetX >= item.x && offsetX <= item.x + item.metrics.width && offsetY >= item.y - item.metrics.actualBoundingBoxAscent && offsetY <= item.y + item.metrics.actualBoundingBoxDescent);

    if (ele) {
      setDraggedText(ele);
      let newIsDragging = !isDragging;
      setDragging(newIsDragging);
      if (!newIsDragging) {
        // add a snapshot of canvas to timeline
        // if its a double click (the idDragging changes only on double clicks)
        // and the double click sets isDragging to flase (means that the elemnt stopped moving)
        addToTimeline();
        setDraggedText({});
      }
    }
  }
  function handleDragText(e) {
    if (draggedText && isDragging) {
      const { offsetX, offsetY } = e.nativeEvent;
      removeText(draggedText.x, draggedText.y);
      let newX = offsetX - draggedText.metrics.width / 2;
      let newY = offsetY + draggedText.metrics.actualBoundingBoxAscent / 2;
      createText(draggedText.text, newX, newY, draggedText.family, draggedText.color, draggedText.size);
      setDraggedText((prev) => ({ ...prev, x: newX, y: newY }));
    }
  }
  function handleGoBack(e) {
    if (coordinate > 0) {
      setTimeLineCanvas(timeLine[coordinate - 1]);
      setCoordinate((prev) => prev - 1);
      repaintCanvas(timeLineCanvas);
    }
  }
  function handleGoForward(e) {
    if (coordinate < timeLine.length - 1) {
      setTimeLineCanvas(timeLine[coordinate + 1]);
      setCoordinate((prev) => prev + 1);
      repaintCanvas(timeLineCanvas);
    }
  }

  return (
    <div className="h-screen min-h-screen bg-zinc-800 p-6">
      <div className="mx-auto space-y-4 flex flex-col h-full">
        <header className="flex items-center">
          <div className="flex gap-2">
            <button onClick={handleGoBack} className={`px-4 py-2 ${coordinate > 0 ? "bg-zinc-700 text-white rounded-sm hover:bg-zinc-600 transition-colors" : "text-zinc-500"}`}>
              Previous
            </button>
            <button onClick={handleGoForward} className={`px-4 py-2 ${coordinate < timeLine.length - 1 ? "bg-zinc-700 text-white rounded-sm hover:bg-zinc-600 transition-colors" : "text-zinc-500"}`}>
              Next
            </button>
          </div>
          <div className="flex gap-2 ml-auto">
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full p-2 rounded-sm bg-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {fontOptions.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input type="range" min="12" max="100" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="flex-1" />
              <span className="text-white w-12">{fontSize}px</span>
            </div>

            <div className="flex items-center gap-2">
              <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="h-8 w-16 rounded-sm" />
              <span className="text-white">{fontColor}</span>
            </div>
          </div>
        </header>

        <main className="grow flex flex-col">
          <div className="grow">
            <div className="canvas-container flex justify-center overflow-hidden h-full w-full">
              <canvas ref={canvasRef} className="bg-white" onClick={handleSelectText} onDoubleClick={handleGrabText} onMouseMove={handleDragText} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <textarea value={text} onChange={handleTextAreaChange} className="w-full p-3 rounded-sm bg-zinc-700 text-white placeholder-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type text to add to canvas..." />

            <div className="flex gap-2">
              <button onClick={handleCreateText} className="px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors">
                Create
              </button>

              {selectedtext && (
                <button onClick={handleDeleteText} className="px-6 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors">
                  Delete
                </button>
              )}

              <button onClick={clearCanvas} className="px-6 py-2 bg-zinc-700 text-white rounded-sm hover:bg-zinc-600 transition-colors">
                Clear Canvas
              </button>

              <button onClick={logAnything} className="ml-auto px-6 py-2 bg-zinc-700 text-white rounded-sm hover:bg-zinc-600 transition-colors">
                Log
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
