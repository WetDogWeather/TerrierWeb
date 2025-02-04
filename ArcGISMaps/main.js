import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import BaseLayerViewGL2D from "@arcgis/core/views/2d/layers/BaseLayerViewGL2D";
globalThis.BaseLayerViewGL2D  = BaseLayerViewGL2D
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
globalThis.GraphicsLayer = GraphicsLayer
import * as mat4 from "gl-matrix/mat4"
import * as vec3 from "gl-matrix/vec3"
import * as vec4 from "gl-matrix/vec4"
globalThis.mat4 = mat4
globalThis.vec3 = vec3
globalThis.vec4 = vec4
import "./style.css";
import Terrier from "./terrier.js"

const map = new Map({
  basemap: "streets-night-vector",
});

const view = new MapView({
  container: "viewDiv",
  map: map,
  zoom: 4,
  center: [-100, 40.5],
});

Terrier.startArcGIS("dev", view, (ovl) => {
  // All the available variables sorted by source/region/product
  console.log(Terrier.variablesForStack())

  // Here are a few examples of how to filter out variables that you want
  // to see.  You can also just mess with the list yourself once it's been
  // returned.

  // Some variables can be interpolated, but others won't look right
  var interpMode = 'linear'

  // Show data for the last four hours. Appropriate to the radar data.
  // let cadence = [-4*60*60,0,64]

  // Restrict to continental US or global, for GFS
  let region = ['conus', 'global']

  // Composite (MCR) reflectivity from MRMS for all regions
  // let sources = Terrier.sourcesForVariable({source: 'mrms', product: 'mcr', region: region, variable: 'reflectivity'})

  // Most of these show nothing most of the time, but precipitation_type and precipitation_rate are visible
  let radarSource = ["mrms"]
  // let sources = Terrier.sourcesForVariable({source: radarSource, region: region, variable: 'probability_severe_hail'})
  // let sources = Terrier.sourcesForVariable({source: radarSource, region: region, variable: 'hail_swath_30min'}); interpMode = 'nearest';
  // let sources = Terrier.sourcesForVariable({source: radarSource, region: region, variable: 'hail_swath_120min'}); interpMode = 'linear';
  // let sources = Terrier.sourcesForVariable({source: radarSource, region: region, variable: 'precipitation_type'}); interpMode = 'nearest';
  // let sources = Terrier.sourcesForVariable({source: radarSource, region: region, variable: 'max_size_hail'}); interpMode = 'nearest';
  // let sources = Terrier.sourcesForVariable({source: radarSource, region: region, variable: 'precipitation_rate'})
  // let sources = Terrier.sourcesForVariable({source: radarSource, region: region, variable: 'severe_hail_index'})

  // For the rest of these sources, let's look at yesterday through tomorrow
  let cadence = [-1*60*60*24,1*60*60*24,64]

  // Standard sources for north america
  let normalSources = ['rtma', 'gfs', 'hrrr']

  // All the temperature available from all sources at 2m (default)
  // let sources = Terrier.sourcesForVariable({source: normalSources, region: region, variable: 'temperature'})

  // Just the surface temperature, if available in a given product
  // let sources = Terrier.sourcesForVariable({source: normalSources, region: region, variable: 'temperature', level: 'sfc'})

  // 80m winds for every source and region
  let sources = Terrier.sourcesForVariable({source: normalSources, region: region, variable: 'wind_uv', level: '80m'})
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
      importFactor: 16.0,
      // Four hours worth of past radar, maximum of 64 frames
      cadence: cadence,
  })

  console.log(layer.getColorMap());

  // This example turns off the layer and then adds another one
  //  useful for testing with ArcGIS Web SDK
  //
  // setTimeout(() => {
  //   ovl.stopLayer(tempLayer)

  //   setTimeout(() => {
  //     let tempLayer = ovl.startLayer('temperature', {
  //         // colorMap: {}
  //         interpMode: 'linear',
  //         opacity: 0.5,
  //         // Four hours worth of past radar, maximum of 64 frames
  //         cadence: [-4*60*60,0,64]
  //       })
  //     }, 5000)
  // }, 10000)


  // Turn this on to animate over time
  ovl.timePlay({period: 20.0})    
})
