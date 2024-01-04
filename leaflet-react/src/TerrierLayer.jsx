import { useState, useRef, useEffect } from 'react'
import { useMap, useMapEvents } from "react-leaflet";
import Terrier from "./terrier.js"
import './L.RealtimeCanvasLayer.js'
import './terrierLayer.css'

function TerrierLayer() {
  const [canvasLayer] = useState(L.realtimeCanvasLayer())
  
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

      // let feetToMeters = 3.28084
      // let cloudColorMap = Terrier.createColorMap(
      //   [0.0*feetToMeters,500.0*feetToMeters,900.0*feetToMeters,1000.0*feetToMeters,300.0*feetToMeters,4000.0*feetToMeters,5000.0*feetToMeters],
      //   [0xff800000,0xffff0000,0xffffff00,0xffff6600,0xff000080,0xff003300,0xff006400])

      // let cloudLayer = ovl.startLayer('CloudCeiling', {
      //   // interpMode: 'nearest',
      //   // colorMap: cloudColorMap,
      //   interpMode: 'linear',
      //   importFactor: 16.0,
      //   opacity: 0.75,
      // })
      // cloudLayer.setColorMap(cloudColorMap)

      // let cloudLayer = ovl.startLayer('CloudCover', {
      //   // interpMode: 'nearest',
      //   interpMode: 'linear',
      //   opacity: 0.75,
      // })

      // let pressureLayer = ovl.startLayer('Pressure', {
      //   interpMode: 'nearest',
      //   // interpMode: 'linear',
      //   opacity: 0.75,
      // })

      // let precipRateLayer = ovl.startLayer('PrecipRate', {
      //   interpMode: 'nearest',
      //   // interpMode: 'linear',
      //   opacity: 0.75,
      // })

      // let radarLayer = ovl.startLayer('radar', {
      //   // interpMode: 'nearest',
      //   interpMode: 'linear',
      //   opacity: 0.75,
      //   importFactor: 16.0,
      // })

      // Turn on a layer
      // let tempLayer = ovl.startLayer('temperature', {
      //     level: "2m",
      //     interpMode: 'nearest',
      //     opacity: 0.5,
      // })

      // let windLayer = ovl.startLayer('WindGust', {
      //     level: "sfc",
      //     // interpMode: 'nearest',
      //     interpMode: 'linear',
      //     opacity: 0.75,
      // })

      // let windLayer = ovl.startLayer('windUV', {
      //     level: "80m",
      //     interpMode: 'nearest',
      //     // interpMode: 'linear',
      //     opacity: 0.75,
      // })

      // let milesToM = 1609.34
      // let visColorMap = Terrier.createColorMap(
      //   [0.0*milesToM,1.0*milesToM,3.0*milesToM,5.0*milesToM,7.0*milesToM,8.0*milesToM,100.0*milesToM],
      //   [0xFF800000,0xFFda0000,0xFFffff00,0xFF00ff00,0xFF008000,0xFF003300,0x00003300])
      // let visLayer = ovl.startLayer('Visibility', {
      //   colorMap: visColorMap,
      //   interpMode: 'linear',
      //   opacity: 0.75,
      // })

      let myRadarLayer = ovl.startLayer('visual', {
        importFactor: 32.0,
        source: {
          model: 'myradar',
          region: 'global',
          variable: 'reflectivity'
        }
      })

      // setTimeout(() => {
      //   ovl.stopLayer(visLayer)

      //   setTimeout(() => {
      //     let visLayer = ovl.startLayer('Visibility', {
      //       interpMode: 'nearest',
      //       // interpMode: 'linear',
      //       opacity: 0.75,
      //     })    
      //   },10000)
      // },10000)

      // To set the time to now + 1hr
      // let d = new Date();
      // let now = d.getTime() / 1000
      // ovl.setCurrentTime(now+1*60*60)

      // To animate over the available time
      ovl.timePlay({period: 4.0})
    }

    // Tell Terrier to hook itself into the canvas and start loading itself
    // This calls the Leaflet variant
    Terrier.startLeaflet('truwx-dev',canvasLayer, (ovl) => {
      startupFunc(ovl)
    })

    canvasLayer.addTo(map)

    return shutdownFunc
  }, [])

  // Wire in a click event
  const mapEvents = useMapEvents({
    click: (e) => {
      // Grab the first layer.  Probably only one.
      const layers = Terrier.ovl.getLayers()
      if (layers.length > 0) {
        const layer = layers[0]
        const x = e.originalEvent.layerX
        const y = e.originalEvent.layerY
        const ret = layer.queryValue(x,y)
        console.log("Click event: %d %d: ",x,y,ret['value'].toString())
      }
    },
  })  

  return (
    // <div id="terrierLayer">
    <canvas ref={canvasRef} >
    </canvas>
    // </div>
  );
}

export default TerrierLayer
