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
        let mrms_refl = Terrier.sourcesForVariable({source:'mrms',region:'conus',product:'mbr',variable:'reflectivity'})
        let hrrr_refl = Terrier.sourcesForVariable({source:'hrrr',region:'conus',variable:'reflectivity'})

        // let mrmsLayer = ovl.startLayer('reflectivity', {
        //     sources: mrms_refl,
        //     colorMap: Terrier.RADAR_COLORS_NOT_GREY,
        //     timeRange: [-4*60*60,0,64],
        //     interpMode: 'linear',
        //     opacity: 0.5,
        //     importFactor: 16.0,
        // })

        let hrrrLayer = ovl.startLayer('reflectivity', {
            sources: hrrr_refl,
            colorMap: Terrier.RADAR_COLORS_NOT_GREY,
            timeRange: [0,4*60*60,64],
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

// setTimeout(() => {
//     stopMap(map)
//     setTimeout(() => {
//         // Note: Problem seems to be the system is not properly setup when the layer is created
//         startMap()
//     }, 1000);
// }, 10000)

// setTimeout(() => {
//     // Note: Problem seems to be the system is not properly setup when the layer is created
//     startMap()
// }, 0)
