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
Terrier.startOpenLayers("dev", "authtoken", map, canvasLayer, (ovl) => {
  let hrrr_refl = Terrier.sourcesForVariable({
    source: "mrms",
    product: "mbr",
    region: "conus",
    variable: "reflectivity",
  });

  // For this source, let's look at yesterday through tomorrow
  let timeRange = [-2*60*60, 0, 64];

  // Turn on temperature as a layer
  let re = ovl.startLayer("reflectivity", {
    sources: hrrr_refl,
    colorMap: Terrier.REFLECTIVITY_HRRR_COMPATIBLE,
    opacity: 0.3,
    importFactor: 16.0,
    startFrame: "last",
    cadence: timeRange
  });

  let animSpeed = 1;

  ovl.timePlay({ period: 30.0 / animSpeed, pause: 1.0 });
});