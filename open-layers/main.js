import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

import Terrier from "./terrier.js"
import olRealtimeCanvasLayer from "./OLRealtimeCanvasLayer.js"

// Create the realtime canvas layer to interface to Terrier
var canvasLayer = olRealtimeCanvasLayer({})

// The OpenLayers map with a simple OSM layer and our canvas layer on top
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
// Ordering doesn't necessarily imply... order.  So we set that explicitly.
canvasLayer.setZIndex(99)

// Call into Terrier with our interface layer and OpenLayers map
// Terrier will get set up and then call us back for the rest
Terrier.startOpenLayers("dev", map, canvasLayer, (ovl) => {
  // Standard sources for north america
  let normalSources = ['rtma', 'gfs', 'hrrr']

  // Restrict to continental US
  let region = ['conus']

  // Temperature for just the US
  // let sources = Terrier.sourcesForVariable({source: normalSources, variable: 'temperature', level: '2m'})
  let swathSources = Terrier.sourcesForVariable({source: 'mrms', variable: 'hail_swath_1440min'})
  // let humidSources = Terrier.sourcesForVariable({variable: 'relative_humidity'})

  // Colormaps can be applied separately (and changed later)
  let swathColorMap = Terrier.colorMapForVariable(swathSources[0]);
  // let humidColorMap = Terrier.colorMapForVariable(humidSources[0]);

  // For this source, let's look at yesterday through tomorrow
  let cadence = [-1*60*60*24,1*60*60*24,64]

  // Turn on temperature as a layer
  let swathLayer = ovl.startLayer('swathLayer', {
      colorMap: swathColorMap,
      interpMode: 'linear',
      sources: swathSources,
      opacity: 0.5,
      importFactor: 8.0,
      renderScale: 4.0,
      cadence: cadence
    })
  
    // A bit of test code for tracking down start/stop problems
  // setTimeout( () => {
  //   ovl.stopLayer(swathLayer);
  //   ovl.stopLayer(swathLayer);

  //   let humidLayer = ovl.startLayer('humidLayer', {
  //     colorMap: humidColorMap,
  //     interpMode: 'linear',
  //     sources: humidSources,
  //     opacity: 0.5,
  //     importFactor: 8.0,
  //     renderScale: 4.0,
  //     cadence: cadence
  //   })

  //   setTimeout( () => {
  //     ovl.stopLayer(humidLayer);

  //     let swathLayer = ovl.startLayer('swathLayer', {
  //       colorMap: swathColorMap,
  //       interpMode: 'linear',
  //       sources: swathSources,
  //       opacity: 0.5,
  //       importFactor: 8.0,
  //       renderScale: 4.0,
  //       cadence: cadence
  //     })  
  //   }, 2000)

  // }, 2000)

})
