import { useState, useRef, useEffect } from 'react'
import { useMap } from "react-leaflet";
import './terrierLayer.css'

// TODO: Move this somewhere more sane
var terrierInit = false



function TerrierLayer() {
  const [count, setCount] = useState(0)
  
  const map = useMap()
  console.log('map center:', map.getCenter())

  const canvasRef = useRef(null)
  useEffect(() => {
    if (terrierInit) {
        return
    }
    terrierInit = true
    const canvas = canvasRef.current
    console.log("canvas: ", canvas)

    var gl = canvas.getContext('webgl');
    gl.clearColor(0.9,0.9,0.8,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    setInterval(()=> {
        gl.clearColor(0.9,0.9,0.8,1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }, 2000)  
  }, [])

  return (
    // <div id="terrierLayer">
    <canvas ref={canvasRef} >
    </canvas>
    // </div>
  );
}

export default TerrierLayer
