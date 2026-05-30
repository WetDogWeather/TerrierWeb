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
    Terrier.startMapLibre('dev', "empty-auth-string", map, (ovl) => {
        let regions = ["conus","alaska","carib","hawaii"]
        let region = regions[0]
        let mrms_refl = Terrier.sourcesForVariable({source:'mrms',
                                                    region:region,
                                                    product:'mcr',
                                                    variable:'reflectivity'})
        mrms_refl.forEach((src) => {
            src['cadence'] = [-2*60*60,0.0,50]
            src['enableForRange'] = [false,false]
        })
        
        let advect_mrms_refl = Terrier.sourcesForVariable({source:'mrms',
                                                    region:region,
                                                    product:'mcr',
                                                    variable:'reflectivity_advected'})
        advect_mrms_refl.forEach((src) => {
            src['cadence'] = [0.0,1*60*60,15]
            src['enableForRange'] = [true,false]
        })
        let all_sources = mrms_refl.concat(advect_mrms_refl)

        let mrmsLayer = ovl.startLayer('reflectivity', {
            sources: all_sources,
            colorMap: Terrier.REFLECTIVITY_HRRR_COMPATIBLE,
            snowColorMap: Terrier.SNOW_COLORS_NOT_GREY,
            cadence: [-4*60*60,1*60*60,64],
            interpMode: 'linear',
            opacity: 0.5,
            importFactor: 16.0,
          'loadCallback': (manifest) => {
            console.log("loadCallback called")
          }
        })

        // Refresh every two minutes
        let recurringTimeout = () => {
        setTimeout(() => {
            console.log("Refreshing")
            // Tell the layer to refresh with a new time range
            let newCadence = [-4*60*60,1*60*60,64]
            mrmsLayer.setCadence(newCadence);

            // Update the overlay with the same
            let now = Date.now()
            ovl.setTimeRange(now+newCadence[0]*1000,now+newCadence[1]*1000)

            recurringTimeout()
        }, 2*60*1000)
        }

        // let hrrrLayer = ovl.startLayer('reflectivity', {
        //     sources: hrrr_refl,
        //     colorMap: Terrier.RADAR_COLORS_NOT_GREY,
        //     timeRange: [0,4*60*60,64],
        //     interpMode: 'linear',
        //     opacity: 0.5,
        //     importFactor: 16.0,
        // })

        // Animate the results
        ovl.timePlay({period: 6.0})

        recurringTimeout()
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
