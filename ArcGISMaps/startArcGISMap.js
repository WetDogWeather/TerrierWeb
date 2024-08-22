import Terrier from "./terrier.js"

require(["esri/Map", 
    "esri/views/MapView"], (Map, MapView, BaseLayerViewGL2D) => {
  const map = new Map({
    basemap: "streets-night-vector"
  });
  const mapView = new MapView({
    container: "viewDiv", // Reference to the view div created in step 5
    map: map, // Reference to the map object created before the view
    zoom: 4, // Sets zoom level based on level of detail (LOD)
    center: [15, 65] // Sets center point of view using longitude,latitude
  });

  Terrier.startArcGIS("dev", mapView, (ovl) => {
    let tempLayer = ovl.startLayer('temperature', {
        // colorMap: {}
        // level: 80
        interpMode: 'linear',
        opacity: 0.5,
        importFactor: 4.0,
    })

    // Toss in country/state outlines
    // fetch("geojson/ne_50m_admin_0_countries.geojson").then(result =>
    //     result.text().then(t => {
    //         console.debug("Adding " + c + ".geojson")
    //         ovl.addGeoJSON(t)
    //     }))
    
})
});
