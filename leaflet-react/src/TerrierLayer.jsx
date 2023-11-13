import { useState, useRef, useEffect } from 'react'
import { useMap } from "react-leaflet";
import Terrier from "./terrier.js"
import './L.RealtimeCanvasLayer.js'
import './terrierLayer.css'

function TerrierLayer() {
  const [canvasLayer, setCanvasLayer] = useState(L.realtimeCanvasLayer())
  
  const map = useMap()
  console.log('map center:', map.getCenter())

  const canvasRef = useRef(null)
  useEffect(() => {
    // How to shut down the layer, if not Terrier
    const shutdownFunc = () => {
      if (canvasLayer != null && map != null) {
          Terrier.stop()
          map.removeLayer(canvasLayer)
      }
    }

    // Called after Terrier has started, or immediately if it's already there
    const startupFunc = (ovl) => {
      // Toss in country/state outlines
      ["ne_50m_admin_0_countries", "ne_50m_admin_1_states_provinces"].forEach(c =>
        fetch("geojson/" + c + ".geojson").then(result =>
            result.text().then(t => {
                console.debug("Adding " + c + ".geojson")
                ovl.addGeoJSON(t)
            })))                

      // let cloudLayer = ovl.startLayer('CloudCeiling', {
      //   // colorMap: {}
      //   // interpMode: 'nearest',
      //   interpMode: 'linear',
      //   opacity: 0.75,
      //   importFactor: 1.0,
      // })

      // let cloudLayer = ovl.startLayer('CloudCover', {
      //   // colorMap: {}
      //   // interpMode: 'nearest',
      //   interpMode: 'linear',
      //   opacity: 0.75,
      //   importFactor: 1.0,
      // })

      // let pressureLayer = ovl.startLayer('Pressure', {
      //   // colorMap: {}
      //   interpMode: 'nearest',
      //   // interpMode: 'linear',
      //   opacity: 0.75,
      //   importFactor: 1.0,
      // })

      // let precipRateLayer = ovl.startLayer('PrecipRate', {
      //   // colorMap: {}
      //   interpMode: 'nearest',
      //   // interpMode: 'linear',
      //   opacity: 0.75,
      //   importFactor: 1.0,
      // })

      // let windLayer = ovl.startLayer('radar', {
      //   // colorMap: {}
      //   // interpMode: 'nearest',
      //   interpMode: 'linear',
      //   opacity: 0.75,
      //   importFactor: 1.0,
      // })

      // Turn on a layer
      let tempLayer = ovl.startLayer('temperature', {
          // colorMap: {}
          level: "152m",
          interpMode: 'nearest',
          opacity: 0.5,
          importFactor: 1.0,
      })

      // let windLayer = ovl.startLayer('WindGust', {
      //     // colorMap: {}
      //     level: "50m",
      //     interpMode: 'nearest',
      //     // interpMode: 'linear',
      //     opacity: 0.75,
      //     importFactor: 1.0,
      // })

      // let windLayer = ovl.startLayer('windUV', {
      //     // colorMap: {}
      //     level: "152m",
      //     interpMode: 'nearest',
      //     // interpMode: 'linear',
      //     opacity: 0.75,
      //     importFactor: 1.0,
      // })

      // let visLayer = ovl.startLayer('Visibility', {
      //   // colorMap: {}
      //   interpMode: 'nearest',
      //   // interpMode: 'linear',
      //   opacity: 0.75,
      //   importFactor: 1.0,
      // })

      // To set the time to now + 1hr
      // let d = new Date();
      // let now = d.getTime() / 1000
      // ovl.setCurrentTime(now+1*60*60)

      // To animate over the available time
      ovl.timePlay({period: 10.0})
    }

    // Tell Terrier to hook itself into the canvas and start loading itself
    // This calls the Leaflet variant
    Terrier.startLeaflet('truwx',canvasLayer, (ovl) => {
      startupFunc(ovl)
    })

    canvasLayer.addTo(map)

    return shutdownFunc
}, [])

  return (
    // <div id="terrierLayer">
    <canvas ref={canvasRef} >
    </canvas>
    // </div>
  );
}

export default TerrierLayer
