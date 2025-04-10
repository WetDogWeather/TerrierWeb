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
      // All the available variables sorted by source/region/product
      console.log(Terrier.variablesForStack())

      // Here are a few examples of how to filter out variables that you want
      // to see.  You can also just mess with the list yourself once it's been
      // returned.

      // Some variables can be interpolated, but others won't look right
      var interpMode = 'linear'
      var importFactor = 4.0

      // Show data for the last four hours. Appropriate to the radar data.
      // let cadence = [-4*60*60,0,64]

      // Restrict to continental US or global, for GFS
      // let region = ['conus', 'global']

      // Composite (MCR) reflectivity from MRMS for all regions
      // let sources = Terrier.sourcesForVariable({source: 'mrms', product: 'mcr', region: region, variable: 'reflectivity'})
      let alaskaBounds = [-149.893611, 61.216667, -140, 63]
      let sources = Terrier.sourcesForVariable({source: 'mrms', product: 'mcr', bounds: alaskaBounds, variable: 'reflectivity'})

      // Most of these show nothing most of the time, but precipitation_type and precipitation_rate are visible
      let radarSource = ["mrms"]
      // importFactor = 16.0
      // let sources = Terrier.sourcesForVariable({source: radarSource, region: region, variable: 'probability_severe_hail'})
      // let sources = Terrier.sourcesForVariable({source: radarSource, region: region, variable: 'hail_swath_30min'}); interpMode = 'nearest';
      // let sources = Terrier.sourcesForVariable({source: radarSource, region: region, variable: 'hail_swath_120min'}); interpMode = 'linear';
      // let sources = Terrier.sourcesForVariable({source: radarSource, region: region, variable: 'precipitation_type'}); interpMode = 'nearest';
      // let sources = Terrier.sourcesForVariable({source: radarSource, region: region, variable: 'max_size_hail'}); interpMode = 'nearest';
      // let sources = Terrier.sourcesForVariable({source: radarSource, region: region, variable: 'precipitation_rate'})
      // let sources = Terrier.sourcesForVariable({source: radarSource, region: region, variable: 'severe_hail_index'})

      // Visual radar source (not available on all stacks)
      // let sources = Terrier.sourcesForVariable({variable: 'radar', dataType: "visual"})

      // For the rest of these sources, let's look at yesterday through tomorrow
      let cadence = [-1*60*60*24,1*60*60*24,64]

      // Standard sources for north america
      let normalSources = ['rtma', 'gfs', 'hrrr']

      // All the temperature available from all sources at 2m (default)
      // let sources = Terrier.sourcesForVariable({source: normalSources, region: region, variable: 'temperature'})

      // Just the surface temperature, if available in a given product
      // let sources = Terrier.sourcesForVariable({source: normalSources, region: region, variable: 'temperature', level: 'sfc'})

      // 80m winds for every source and region
      // let sources = Terrier.sourcesForVariable({source: normalSources, region: region, variable: 'wind_uv', level: '80m'})
      // let sources = Terrier.sourcesForVariable({source: normalSources,region: region, variable: 'wind_speed_gust'})

      if (sources.length == 0) {
        console.log("Failed to find any sources for variable")
        return
      }

      // Colormaps can be applied separately (and changed later)
      let colorMap = Terrier.colorMapForVariable(sources[0]);

      // Now start the layer
      let layer = ovl.startLayer('myLayer', {
          colorMap: colorMap,
          interpMode: interpMode,
          sources: sources,
          opacity: 0.5,
          importFactor: importFactor,
          cadence: cadence,
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
    Terrier.startLeaflet('dev',canvasLayer, (ovl) => {
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
