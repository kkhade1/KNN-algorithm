import React from 'react';

import canvasToMnistB64 from './canvas-to-mnist-b64.mjs';

//logical size of canvas
const DRAW = { width: 20, height: 20 };

//canvas is zoomed by this factor
const ZOOM = 10;

//color used for drawing digits; this cannot be changed arbitrarily as
//the value selected from each RGBA pixel depends on it being blue.
const FG_COLOR = 'blue';

export default class DigitImageRecognizer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      canvasRef: React.createRef(),
      penWidth: 1,
      label: 1,
      mouseDown: false,
      last: { x: 0, y: 0 },
      errors: [], //li-enclosed messages
    };
    const handlers = [
      'mouseDownHandler', 'mouseUpHandler', 'mouseMoveHandler',
      'mouseLeaveHandler', 'setPenWidthHandler', 'resetApp', 'recognize',
    ];
    for (const h of handlers) this[h] = this[h].bind(this);
  }


  componentDidMount() {
    const ctx = this.state.canvasRef.current.getContext("2d");
    // set up ctx attributes sufficient for this project
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.strokeStyle = FG_COLOR;
    ctx.lineWidth = this.state.pendWidth;
  }



  /** Clear canvas specified by graphics context ctx and any
   *  previously determined label
   */
  resetApp(ev) {
    const ctx = this.state.canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.setState({label: ''});
  }

  /** Label the image in the canvas specified by canvas corresponding
   *  to graphics context ctx.  Specifically, call the relevant web
   *  services to label the image.  Display the label in the result
   *  area of the app.  Display any errors encountered.
   */
  async recognize(ev) {
    const ctx = this.state.canvasRef.current.getContext("2d");
    const b64 = canvasToMnistB64(ctx);
    const labelResult = await this.props.knnWs.classify(b64);
    if (labelResult.hasErrors) {
      this.setState({errors:
                     labelResult.errors.map((e, i) =>
                                            <li key={i}>{e.message}</li>)});
    }
    else {
      const { label } = labelResult.val;
      this.setState({label, errors: []});
    }
  }

  setPenWidthHandler(ev) {
    const ctx = this.state.canvasRef.current.getContext("2d");
    const width = Number(ev.target.value);
    ctx.lineWidth = width;
  };

  /** set up an event handler for the mouse button being pressed within
   *  the canvas.
   */
  mouseDownHandler(ev) {
    this.setState({ mouseDown: true,
                    last: eventCanvasCoord(this.state.canvasRef.current, ev)});
  }


  /** set up an event handler for the mouse button being moved within
   *  the canvas.
   */
  mouseMoveHandler(ev) {
    if (this.state.mouseDown) {
      const pt = eventCanvasCoord(this.state.canvasRef.current, ev);
      const ctx = this.state.canvasRef.current.getContext("2d");
      draw(ctx, this.state.last, pt);
      this.setState({last: pt});
    }
  }

  /** set up an event handler for the mouse button being released within
   *  the canvas.
   */
  mouseUpHandler(ev) {
    this.setState({mouseDown: false});
  }

  /** set up an event handler for the mouse button being moved off
   *  the canvas.
   */
  mouseLeaveHandler(ev) {
    this.setState({mouseDown: false});
  }

  render() {

    const width = DRAW.width;
    const height = DRAW.height;
    const zoom = ZOOM;
    const style = {
      width: `${zoom * width}px`,
      height: `${zoom * height}px`,
      border: '2px solid black',
    };
    return (
      <div align="center">
        <canvas ref={this.state.canvasRef}
                width={width} height={height} style={style}
                onMouseDown={this.mouseDownHandler}
                onMouseUp={this.mouseUpHandler}
                onMouseMove={this.mouseMoveHandler}
                onMouseLeave={this.mouseLeaveHandler}>
          Sorry, your browser does not support the <code>canvas</code>
          element, which is necessary for this application.
        </canvas>
        <br /><br />
        <button id="clear" onClick={this.resetApp}>Clear Area</button>
        <button id="recognize" onClick={this.recognize}>Classify</button>
        <label htmlFor="pen-width">Pen width:</label>
        <select id="pen-width" onChange={this.setPenWidthHandler}>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
        <p>
          <strong>Label</strong>: <span id="knn-label">{this.state.label}</span>
        </p>
        <ul id="errors">{this.state.errors}</ul>
      </div>
    );
  }

};


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
