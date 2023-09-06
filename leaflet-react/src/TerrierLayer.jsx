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

    canvasLayer.delegate({
      onLayerDidMount() {
          Terrier.start('dev', canvasLayer._canvas, (ovl) => {
              // Toss in country/state outlines
              ["ne_50m_admin_0_countries", "ne_50m_admin_1_states_provinces"].forEach(c =>
                  fetch("geojson/" + c + ".geojson").then(result =>
                      result.text().then(t => {
                          console.debug("Adding " + c + ".geojson")
                          ovl.addGeoJSON(t)
                      })))                

              // Turn on a layer
              let tempLayerId = ovl.startLayer('temperature')
              // let windLayerID = ovl.startLayer('wind_uv')
              // let cloudCeilingId = ovl.startLayer('cloud_ceiling')
          })
      },

      onDrawLayer(info) {
          var px = map.getPixelBounds()
          let far = 10.0
          let near = -10.0
          var transform = [2.0/(px.max.x-px.min.x), 0.0, 0.0, 0.0,  
                           0.0, -2.0/(px.max.y-px.min.y), 0.0, 0.0,  
                           0.0, 0.0, -2.0/(far-near), 0.0,
                           -(px.max.x+px.min.x)/(px.max.x-px.min.x), (px.max.y+px.min.y)/(px.max.y-px.min.y), -(far+near)/(far-near), 1.0]
          var geoCenter = map.getCenter()
          Terrier.ovl.updateTransform(geoCenter.lng, geoCenter.lat, info.zoom, transform)
      }
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
