import Terrier from "./terrier.js"

// An example of starting up terrier
function startMap() {
    // Start the Terrier toolkit.  It's got a bit of code to load.
    // Then call our function to start doing things
    Terrier.start('truwx', document.getElementById('mapCanvas'), (ovl) => {
        // Toss in country/state outlines
        ["ne_50m_admin_0_countries", "ne_50m_admin_1_states_provinces"].forEach(c =>
            fetch("geojson/" + c + ".geojson").then(result =>
                result.text().then(t => {
                    console.debug("Adding " + c + ".geojson")
                    ovl.addGeoJSON(t)
                })))                

        // Turn on the temperature layer
        let tempLayerId = ovl.startLayer('temperature')

        // setTimeout( () => {
        //     ovl.stopLayer(tempLayerId)
        // }, 5000)
    })
}

startMap()
