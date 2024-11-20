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

  useEffect(() => {
    // create canvas
    const canvas = canvasRef.current;
    canvas.width = 700;
    canvas.height = 400;

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
      ctxRef.current.fillText(item.text, item.x, item.y);
    });
  }
  function createText(text, x, y) {
    ctxRef.current.fillText(text, x, y);
    const metrics = ctxRef.current.measureText(text);
    setCanvasElements((prev) => [...prev, { text, x, y, metrics }]);
    setTimeLineCanvas((prev) => [...prev, { text, x, y, metrics }]);
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
      createText(text, 250, 250);
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
    }
    let newIsDragging = !isDragging;
    setDragging(newIsDragging);
    if (!newIsDragging) {
      // add a snapshot of canvas to timeline
      // if its a double click (the idDragging changes only on double clicks)
      // and the double click sets isDragging to flase (means that the elemnt stopped moving)
      addToTimeline();
    }
  }
  function handleDragText(e) {
    if (draggedText && isDragging) {
      const { offsetX, offsetY } = e.nativeEvent;
      removeText(draggedText.x, draggedText.y);
      let newX = offsetX - draggedText.metrics.width / 2;
      let newY = offsetY + draggedText.metrics.actualBoundingBoxAscent / 2;
      createText(draggedText.text, newX, newY);
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
    <div className="min-h-screen bg-zinc-800 p-6">
      <div className="max-w-[2000px] border-2 border-yellow-200  mx-auto space-y-6">
        <header className="flex items-center gap-4">
          <button onClick={handleGoBack} className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors">
            Previous
          </button>
          <button onClick={handleGoForward} className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors">
            Next
          </button>
        </header>

        <main className="space-y-6">
          <div className="canvas-container flex justify-center overflow-hidden shadow-lg">
            <canvas ref={canvasRef} className="bg-white" onClick={handleSelectText} onDoubleClick={handleGrabText} onMouseMove={handleDragText} />
          </div>

          <div className="flex flex-col gap-4">
            <textarea value={text} onChange={handleTextAreaChange} rows={4} className="w-full p-3 rounded-lg bg-zinc-700 text-white placeholder-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type text to add to canvas..." />

            <div className="flex gap-4">
              <button onClick={handleCreateText} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Create
              </button>

              {selectedtext && (
                <button onClick={handleDeleteText} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Delete
                </button>
              )}

              <button onClick={clearCanvas} className="px-6 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors">
                Clear Canvas
              </button>

              <button onClick={logAnything} className="ml-auto px-6 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors">
                Log
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
