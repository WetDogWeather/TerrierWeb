import Terrier from "./terrier.js"
import "./L.RealtimeCanvasLayer.js"

// An example of starting up terrier
function startMap() {
    var map = L.map('map', {
        zoomAnimation: false,
        zoomAnimationThreshold: 0.0
    }).setView([51.505, -0.09], 6);

	var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

    var canvasLayer = L.realtimeCanvasLayer()
    Terrier.startLeaflet('dev', canvasLayer, (ovl) => {
        // Toss in country/state outlines
        // ["ne_50m_admin_0_countries", "ne_50m_admin_1_states_provinces"].forEach(c =>
        //     fetch("geojson/" + c + ".geojson").then(result =>
        //         result.text().then(t => {
        //             console.debug("Adding " + c + ".geojson")
        //             ovl.addGeoJSON(t)
        //         })))                

        // Turn on temperature as a layer
        let tempColorMap = new globalThis.Module.TrrShaderColorMap(0, false,
            [255.372, 260.928, 266.483, 272.039, 277.594, 283.15, 288.706, 294.261, 299.817, 305.372, 310.928, 316.483],
            [0xFFFFBFFF, 0xFFD873DB, 0xFF913ABB, 0xFF372398, 0xFF00B6DC, 0xFF02D786, 0xFF40C604, 0xFFFFFF00, 0xFFFB7700, 0xFFD22402, 0xFFA20902, 0xFFEED9D8]);
        let tempLayer = ovl.startLayer('temperature', {
            colorMap: tempColorMap,
            interpMode: 'linear',
            opacity: 0.5,
            importFactor: 4.0,
        })
        // let windLayer = ovl.startLayer('windUV', {
        //     // colorMap: {}
        //     // level: 80
        //     interpMode: 'nearest',
        //     opacity: 0.5,
        //     importFactor: 1.0,
        // })
        // let radarLayer = ovl.startLayer('radar', {
        //     // colorMap: {}
        //     // level: 80
        //     interpMode: 'linear',
        //     opacity: 0.75,
        //     importFactor: 5.0
        // })

        // setTimeout(() => {
        //     tempLayer.setOpacity(1.0)
        // }, 5000)

        // let cloudCeiling = ovl.startLayer('cloud_ceiling')

        // ovl.timePlay({period: 10.0})
    })

    canvasLayer.addTo(map)
}

startMap()
