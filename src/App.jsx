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
    canvas.height = 500;

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
    <div className="pretend-root bg-zinc-600 min-h-screen w-screen ">
      <header>
        <button className="py-2 px-4 border border-zinc-100" onClick={handleGoBack}>
          Prev
        </button>
        <button className="py-2 px-4 border border-zinc-100" onClick={handleGoForward}>
          Next
        </button>
      </header>
      <main>
        <canvas ref={canvasRef} className="bg-slate-100" onClick={handleSelectText} onDoubleClick={handleGrabText} onMouseMove={handleDragText}></canvas>
        <textarea value={text} onChange={handleTextAreaChange} rows={7} placeholder="Type text to add to canvas..."></textarea>
        <button className="py-2 px-4 border border-zinc-100" id="create" onClick={handleCreateText}>
          Create
        </button>
        <button onClick={logAnything}>Log</button>
        {selectedtext && (
          <button className="py-2 px-4 border border-zinc-100" id="delete" onClick={handleDeleteText}>
            Delete
          </button>
        )}
      </main>
      <footer></footer>
    </div>
  );
}
