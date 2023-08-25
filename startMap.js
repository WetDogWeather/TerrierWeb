import TerrierInit from "./terrier.js"

// An example of starting up terrier
function startMap() {
    TerrierInit(document.getElementById('mapCanvas'));

    setTimeout(() => {
        ["ne_50m_admin_0_countries", "ne_50m_admin_1_states_provinces"].forEach(c =>
          fetch("geojson/" + c + ".geojson").then(result =>
            result.text().then(t => {
              console.debug("Adding " + c + ".geojson")
              Module.overlay.addGeoJSON(t);
            })));
      }, 1000);
}

startMap()
