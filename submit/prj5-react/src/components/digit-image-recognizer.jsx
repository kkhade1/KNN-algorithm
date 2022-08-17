import React from 'react';

const { useEffect, useState } =  React;

import canvasToMnistB64 from './canvas-to-mnist-b64.mjs';

//logical size of canvas
const DRAW = { width: 20, height: 20 };

//canvas is zoomed by this factor
const ZOOM = 10;

//color used for drawing digits; this cannot be changed arbitrarily as
//the value selected from each RGBA pixel depends on it being blue.
const FG_COLOR = 'blue';

export default function DigitImageRecognizer(props) {

  const width = DRAW.width;
  const height = DRAW.height;
  const zoom = ZOOM;
  const style = {
    width: `${zoom * width}px`,
    height: `${zoom * height}px`,
    border: '2px solid black',
  };

  const canvasRef = React.createRef();

  const [penWidth, setPenWidth] = useState(1);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    // set up ctx attributes sufficient for this project
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.strokeStyle = FG_COLOR;
    ctx.lineWidth = 1;
  }, []);



  /** true if the mouse button is currently pressed within the canvas */
  const [mouseDown, setMouseDown] = useState(false);

  /** the last {x, y} point within the canvas where the mouse was
   *  detected with its button pressed. In logical canvas
   *  coordinates.
   */
  const [last, setLast] = useState({ x: 0, y: 0 });

  /** currently recognized label */
  const [label, setLabel] = useState('');

  /** current error <li>-enclosed messages */
  const [errors, setErrors] = useState([]);

  /** Clear canvas specified by graphics context ctx and any
   *  previously determined label
   */
  const resetApp = ev => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    setLabel('');
  };

  /** Label the image in the canvas specified by canvas corresponding
   *  to graphics context ctx.  Specifically, call the relevant web
   *  services to label the image.  Display the label in the result
   *  area of the app.  Display any errors encountered.
   */
  const recognize = async ev => {
    const ctx = canvasRef.current.getContext("2d");
    const b64 = canvasToMnistB64(ctx);
    const labelResult = await props.knnWs.classify(b64);
    if (labelResult.hasErrors) {
      setErrors(labelResult.errors.map((e, i) => <li key={i}>{e.message}</li>));
    }
    else {
      const { label } = labelResult.val;
      setLabel(label);
      setErrors([]);
    }
  };

  const setPenWidthHandler = ev => {
    const ctx = canvasRef.current.getContext("2d");
    const width = Number(ev.target.value);
    ctx.lineWidth = width;
  };

  /** set up an event handler for the mouse button being pressed within
   *  the canvas.
   */
  const mouseDownHandler =  e => {
    setMouseDown(true);
    setLast(eventCanvasCoord(canvasRef.current, e));
  };


  /** set up an event handler for the mouse button being moved within
   *  the canvas.
   */
  const mouseMoveHandler = e => {
    if (mouseDown) {
      const pt = eventCanvasCoord(canvasRef.current, e);
      const ctx = canvasRef.current.getContext("2d");
      draw(ctx, last, pt);
      setLast(pt);
    }
  };

  /** set up an event handler for the mouse button being released within
   *  the canvas.
   */
  const mouseUpHandler = e => setMouseDown(false);

  /** set up an event handler for the mouse button being moved off
   *  the canvas.
   */
  const mouseLeaveHandler =  e => setMouseDown(false);

  return (
    <div align="center">
      <canvas ref={canvasRef} width={width} height={height} style={style}
              onMouseDown={mouseDownHandler} onMouseUp={mouseUpHandler}
              onMouseMove={mouseMoveHandler} onMouseLeave={mouseLeaveHandler}>
        Sorry, your browser does not support the <code>canvas</code>
        element, which is necessary for this application.
      </canvas>
      <br /><br />
      <button id="clear" onClick={resetApp}>Clear Area</button>
      <button id="recognize" onClick={recognize}>Classify</button>
      <label htmlFor="pen-width">Pen width:</label>
      <select id="pen-width" onChange={setPenWidthHandler}>
        <option value="1">1</option>
        <option value="2">2</option>
      </select>
      <p>
        <strong>Label</strong>: <span id="knn-label">{label}</span>
      </p>
      <ul id="errors">{errors}</ul>
    </div>
  );

}


/** Draw a line from {x, y} point pt0 to {x, y} point pt1 in ctx */
function draw(ctx, pt0, pt1) {
  ctx.beginPath();
  ctx.moveTo(pt0.x, pt0.y);
  ctx.lineTo(pt1.x, pt1.y);
  ctx.stroke();
}

/** Returns the {x, y} coordinates of event ev relative to canvas in
 *  logical canvas coordinates.
 */
function eventCanvasCoord(canvas, ev) {
  const x = (ev.pageX - canvas.offsetLeft)/ZOOM;
  const y = (ev.pageY - canvas.offsetTop)/ZOOM;
  return { x, y };
}
