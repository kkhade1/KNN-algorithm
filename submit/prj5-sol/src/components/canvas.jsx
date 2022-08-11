import React, { useRef, useEffect } from 'react'

const Canvas = props => {
  
  const canvasRef = useRef(null)
  const DRAW = { width: 20, height: 20 };
  const ZOOM = 10;
  const FG_COLOR = 'blue';

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = DRAW.width; canvas.height = DRAW.height;
    canvas.style.width = `${ZOOM * DRAW.width}.px`;
    canvas.style.height = `${ZOOM * DRAW.height}px`;
    const ctx = canvas.getContext('2d')
   // ctx.lineJoin = ctx.lineCap = 'round';
  //  ctx.strokeStyle = FG_COLOR;
   // ctx.borderStyle = '#ff0000
    ctx.lineWidth = 1;
   // ctx.fillStyle = '#000000'
    ctx.strokeRect(0, 0, DRAW.width, DRAW.height)
  }, [])
 function draw(ctx, pt0, pt1) {
  ctx.beginPath();
  ctx.moveTo(pt0.x,pt0.y);
  ctx.lineTo(pt1.x,pt1.y);
  ctx.stroke();
}
  return <canvas ref={canvasRef} {...props}/>
}

export default Canvas
