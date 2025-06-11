import Terrier from "./terrier/terrier.js"

function startMap() {

    const map = new maplibregl.Map({
        container: 'map',
        style:
            'https://api.maptiler.com/maps/streets/style.json?key=shArXuSxvZazDjMsjkIm',
        center: [12.550343, 55.665957],
        zoom: 2
    });

    // Tell Terrier to hook itself into MapLibre
    Terrier.startMapLibre('dev', map, (ovl) => {
        // Once successful, start up a temperature layer
        let tempLayer = ovl.startLayer('reflectivity', {
            // colorMap: {}
            // level: 80
            interpMode: 'linear',
            opacity: 0.5,
            importFactor: 16.0,
        })

        // Animate the results
        ovl.timePlay({period: 10.0})
    })

    return map
}

function stopMap(map) {
    Terrier.stop()
    map.remove()
}

let map = startMap()

setTimeout(() => {
    stopMap(map)
    // Note: Problem seems to be the system is not properly setup when the layer is created
    startMap()
}, 10000)

// setTimeout(() => {
//     // Note: Problem seems to be the system is not properly setup when the layer is created
//     startMap()
// }, 0)
