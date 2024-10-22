import Terrier from "./terrier.js"

require(["esri/Map", 
         "esri/views/MapView"], (Map, MapView) => {
  // Start by creating a map in the way ESRI suggests
  const map = new Map({
    basemap: "streets-night-vector"
  });
  const mapView = new MapView({
    container: "viewDiv", // Reference to the view div created in step 5
    map: map, // Reference to the map object created before the view
    center: [0, 0],
    zoom: 1
  });

  Terrier.startArcGIS("dev", mapView, (ovl) => {
    let radarLayer = ovl.startLayer('radar', {
        // colorMap: {}
        sources: Terrier.sourcesForVariable('reflectivity'),
        interpMode: 'linear',
        opacity: 0.5,
        // Four hours worth of past radar, maximum of 64 frames
        cadence: [-4*60*60,0,32]
    })

    // Turn this on to animate over time
    // ovl.timePlay({period: 20.0})    
  })
});
