import Terrier from "./terrier.js"
import "./L.RealtimeCanvasLayer.js"

// L.TerrierLayer = L.CanvasLayer.extend({
//     onAdd: function(map) {
//         var pane = map.getPane(this.options.pane);
//         this._container = L.DomUtil.create("canvas");
//         this._container.name = "Custom Layer Canvas"

//         pane.appendChild(this._container);

//         // Calculate initial position of container with `L.Map.latLngToLayerPoint()`, `getPixelOrigin()` and/or `getPixelBounds()`

//         // L.DomUtil.setPosition(this._container, point);

//         // Add and position children elements if needed


//         map.on('zoomend viewreset', this._update, this);
//     },

//     onRemove: function(map) {
//         L.DomUtil.remove(this._container);
//         map.off('zoomend viewreset', this._update, this);
//     },

//     _update: function() {
//         // Recalculate position of container

//         L.DomUtil.setPosition(this._container, point);        

//         // Add/remove/reposition children elements if needed
//     }
// });

// L.terrierLayer = (name, options) => {
//     return new L.TerrierLayer(name, options);
// }

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
    canvasLayer.delegate({
        onLayerDidMount() {
            Terrier.start('truwx', canvasLayer._canvas, (ovl) => {
                // Toss in country/state outlines
                ["ne_50m_admin_0_countries", "ne_50m_admin_1_states_provinces"].forEach(c =>
                    fetch("geojson/" + c + ".geojson").then(result =>
                        result.text().then(t => {
                            console.debug("Adding " + c + ".geojson")
                            ovl.addGeoJSON(t)
                        })))                

                // Turn on the temperature layer
                let tempLayerId = ovl.startLayer('temperature')
            })
        },

        onDrawLayer(info) {
            var px = map.getPixelBounds()
            let far = 10.0
            let near = -10.0
            // console.log('pixelBounds = ' + px.min + ' ' + px.max)
            // console.log('width = ' + canvasLayer._canvas.width + " height = " + canvasLayer._canvas.height)
            var transform = [2.0/(px.max.x-px.min.x), 0.0, 0.0, 0.0,  
                             0.0, -2.0/(px.max.y-px.min.y), 0.0, 0.0,  
                             0.0, 0.0, -2.0/(far-near), 0.0,
                             -(px.max.x+px.min.x)/(px.max.x-px.min.x), (px.max.y+px.min.y)/(px.max.y-px.min.y), -(far+near)/(far-near), 1.0]
            var geoCenter = map.getCenter()
            Terrier.ovl.updateTransform(geoCenter.lng, geoCenter.lat, info.zoom, transform)
        }
    })
    canvasLayer.addTo(map)
}

startMap()
