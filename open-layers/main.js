import Terrier from "./terrier.js"
import './style.css';
import {Map, View} from 'ol';
import Layer from 'ol/layer/Layer';
globalThis.OpenLayersLayer = Layer
import Source from 'ol/source/Source.js';
globalThis.OpenLayersSource = Source
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import olRealtimeCanvasLayer from "./OLRealtimeCanvasLayer.js"

var canvasLayer = olRealtimeCanvasLayer({})
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    canvasLayer
  ],
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});
canvasLayer.setZIndex(99)

Terrier.startOpenLayers("dev", map, canvasLayer, (ovl) => {
  // Standard sources for north america
  let normalSources = ['rtma', 'gfs', 'hrrr']

  // Restrict to continental US or global, for GFS
  let region = ['conus']

  // 80m winds for every source and region
  let sources = Terrier.sourcesForVariable({source: normalSources, region: region, variable: 'temperature', level: '2m'})
  // let sources = Terrier.sourcesForVariable({source: 'mrms', product: 'mcr', variable: 'reflectivity'})

  // Colormaps can be applied separately (and changed later)
  let colorMap = Terrier.colorMapForVariable(sources[0]);

  // For the rest of these sources, let's look at yesterday through tomorrow
  let cadence = [-1*60*60*24,1*60*60*24,64]

  // Turn on temperature as a layer
    let tempLayer = ovl.startLayer('myLayer', {
        colorMap: colorMap,
        interpMode: 'linear',
        sources: sources,
        opacity: 0.5,
        importFactor: 16.0,
        renderScale: 4.0,
        cadence: cadence
      })

    ovl.timePlay({period: 10.0})
})
