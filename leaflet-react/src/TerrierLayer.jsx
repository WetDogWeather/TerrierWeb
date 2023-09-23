import { useState, useRef, useEffect } from 'react'
import { useMap } from "react-leaflet";
import Terrier from "./terrier.js"
import './L.RealtimeCanvasLayer.js'
import './terrierLayer.css'

var terrierInit = false

function TerrierLayer() {
  const [count, setCount] = useState(0)
  
  const map = useMap()
  console.log('map center:', map.getCenter())

  var canvasLayer = L.realtimeCanvasLayer()

  const canvasRef = useRef(null)
  useEffect(() => {
    if (terrierInit) {
      return
    }
    terrierInit = true

    // Tell Terrier to hook itself into the canvas and start loading itself
    // This calls the Leaflet variant
    Terrier.startLeaflet('dev',canvasLayer, (ovl) => {
      // Toss in country/state outlines
      ["ne_50m_admin_0_countries", "ne_50m_admin_1_states_provinces"].forEach(c =>
        fetch("geojson/" + c + ".geojson").then(result =>
            result.text().then(t => {
                console.debug("Adding " + c + ".geojson")
                ovl.addGeoJSON(t)
            })))                

      // Turn on a layer
      // let tempLayer = ovl.startLayer('temperature', {
      //     // colorMap: {}
      //     // level: 80
      //     interpMode: 'nearest',
      //     opacity: 0.5,
      //     importFactor: 1.0,
      // })

      let windLayer = ovl.startLayer('windUV', {
          // colorMap: {}
          // level: 80
          interpMode: 'nearest',
          // interpMode: 'linear',
          opacity: 0.75,
          importFactor: 1.0,
      })

      // To set the time to now + 1hr
      // let d = new Date();
      // let now = d.getTime() / 1000
      // ovl.setCurrentTime(now+1*60*60)

      // To animate over the available time
      ovl.timePlay({period: 10.0})
    })

    canvasLayer.addTo(map)
}, [])

  return (
    // <div id="terrierLayer">
    <canvas ref={canvasRef} >
    </canvas>
    // </div>
  );
}

export default TerrierLayer
