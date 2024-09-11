import Terrier from "./terrier.js"

require(["esri/Map", 
    "esri/views/MapView"], (Map, MapView, BaseLayerViewGL2D) => {
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
    let tempLayer = ovl.startLayer('radar', {
        // colorMap: {}
        // level: 80
        interpMode: 'linear',
        opacity: 0.5,
        cadence: [-4*60*60,0,32]
    })
    ovl.timePlay({period: 20.0})    
})
});
