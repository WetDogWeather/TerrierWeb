var Module

// Represents an overlay into another map toolkit or
//  a Canvas with WebGL.  This is how you control what
//  Terrier is displaying in our window.
class TerrierOverlay {
    constructor(terrierModule) {
        this.terrierModule = terrierModule
    }

    // Get an overview of what the stack has
    // {"<src>" : 
    //   {"<region>":
    //     {"<products>": [],
    //      "<levels>": [],
    //      "temporalType": "observed", "forecast", "both",
    //      "dataType": "wind_uv", "wind_speed", "wind_speed_gust", "temperature", 
    //                  "radar", "precip_rate", "precip_type", "cloud_cover", "cloud_ceiling", 
    //                  "pressure", "visibility"}}}
    fetchStackContents(fetchFunc) {
        fetch("./stack_contents.json")
            .then((response) => response.json())
            .then((data) => {
                fetchFunc(data)
            })
    }
    
    // Start the display of a given layer by name.
    // The layer names can be found in the stack contents are things like "temperature" or "cloud_cover"
    // Leave level blank if there is no level information.  These can also be found
    //  in the stack contents.
    // Returns an identifier for the layer
    startLayer(layerName,level,colorMap) {

        // Note: Turn this into a lookup into the stack contents and make it generally more generic
        var ctl = null
        var name = null
        switch (layerName) {
            case "wind_uv":
                break;
            case "wind_speed_gust":
                break;
            case "temperature":
                ctl = globalThis.Module.tempCtl
                globalThis.Module.enableTemp = true
                globalThis.Module.tempColorMap = colorMap ? colorMap : this.terrierModule.TEMP_COLORS_NOT_GREY;
                if (level !== null && level !== undefined) {
                    globalThis.Module.selectedLevel = level
                }
                break;
            case "cloud_ceiling":
                break;
            case "cloud_cover":
                break;
            case "precip_rate":
                break;
            case "pressure":
                break;
            case "visibility":
                break;
            default:
                console.log("Terrier: Unknown layer name " + layerName)
                return null
        }

        // This creates the controls if they're not there already
        globalThis.Module.updateOverlay()

        // ctl.varInterp = globalThis.Module.TexInterpType.Nearest
        // ctl.visInterp = globalThis.Module.TexInterpType.Nearest
        ctl.minImportanceFactor = 4.0

        return layerName
    }

    // Stop the given layer from displaying
    stopLayer(layerId) {
        let layerName = layerId

        // Note: Turn this into a lookup into the stack contents and make it generally more generic
        switch (layerName) {
            case "wind_uv":
                break;
            case "wind_speed_gust":
                break;
            case "temperature":
                globalThis.Module.enableTemp = false
                break;
            case "cloud_ceiling":
                break;
            case "cloud_cover":
                break;
            case "precip_rate":
                break;
            case "pressure":
                break;
            case "visibility":
                break;
            default:
                console.log("Terrier: Unknown layer name " + layerName)
                return null
        }

        globalThis.Module.updateOverlay()
    }

    // Add the given raw GeoJSON data
    // Note: Need a way to remove it
    addGeoJSON(geojson) {
        globalThis.Module.overlay.addGeoJSON(geojson)
    }

    // Update the transform used to move the map around
    updateTransform(lon, lat, zoom, transMat) {
        globalThis.Module.transform = {
            centerLng: lon,
            centerLat: lat,
            zoom: zoom,
            scale: zoom, 
            projMatrix: transMat
        }
        // console.log("lon = " + lon)
        // console.log("lat = " + lat)
        // console.log("zoom = " + zoom)
        // console.log("projMatrix = " + transMat)
        if (globalThis.Module.repaint !== undefined) {
            globalThis.Module.repaint()
        }
    }
}

// Putting all the Terrier methods into one class
class TerrierModule {
    constructor() {
        // Developers interface to Terrier through the 'overlay'
        this.ovl = new TerrierOverlay(this)
        this.isReady = false
    }

    // Initialize Terrier and get it ready for use
    start(stackName, mapCanvas, readyFunc) {
        if (mapCanvas == undefined) {
            console.log('Need to pass the mapCanvas into TerrierInit.  Not starting.')
            return
        }

        // Already started, so just call them back
        if (this.isReady) {
            if (readyFunc !== undefined) {
                readyFunc(this.ovl)
            }
            return
        }

        // TODO: Do something with the stackName
        
        // Emscripten is expecting this global Module to be defined
        //  and it will merge these contents with its own
        globalThis.Module = {
            preRun: [],
            postRun: [],
            emInitialized: false, // Set when the Emscripten runtime is loaded
            doMapInit: true,      // MapLibre not currently deferred, can we do that?
            noInitialRun: true,   // don't call main
            noExitRuntime: true,  // Keep the Emscripten runtime from shutting down after async
            // calls because we aren't using the main loop mechanism.
            canvas: mapCanvas,
            autoRepaint: 2000,    // draw a frame every few seconds even if nothing changed
            debugLayers: false,
            debugTracker: false,
            debugJSFetch: false,
            debugTemp: false,
            debugWind: false,
            debugRadar: false,

            print: (function () {
                return function (text) {
                    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
                    text = text.replace(/&/g, "&amp;");
                    text = text.replace(/</g, "&lt;");
                    text = text.replace(/>/g, "&gt;");
                    text = text.replace('\n', '<br>', 'g');
                    console.log(text);
                };
            })(),
            setStatus: function (text) {
                //console.log("Module.setStatus: '" + text + "'");
            },
            totalDependencies: 0,
            monitorRunDependencies: function (left) {
                //console.log("Module.monitorRunDependencies(" + left + ")");
            },
            onRuntimeInitialized: function () {
                this.TEMP_COLORS_NOT_GREY = new globalThis.Module.TrrShaderColorMap(0, false,
                    [255.372, 260.928, 266.483, 272.039, 277.594, 283.15, 288.706, 294.261, 299.817, 305.372, 310.928, 316.483],
                    [0xFFFFBFFF, 0xFFD873DB, 0xFF913ABB, 0xFF372398, 0xFF00B6DC, 0xFF02D786, 0xFF40C604, 0xFFFFFF00, 0xFFFB7700, 0xFFD22402, 0xFFA20902, 0xFFEED9D8]);
        
                console.log("Runtime Initialized");
                if (window.mobile) {
                    const text = document.getElementById("frameText");
                    text.innerHTML = "Mobile not supported";
                    text.setAttribute("rows", 2);
                    text.classList.add("active");
                    return;
                }
                globalThis.Module.emInitialized = true;
                _postLoadInit();

                globalThis.Module.service = new globalThis.Module.TrrService();
                globalThis.Module.service.stackName = "dev";
                globalThis.Module.service.apiVersion = 1;
                globalThis.Module.tempCadence = [-24 * 3600, 24 * 3600, 40];
                globalThis.Module.windCadence = [-25 * 3600, 24 * 3600, 40];
                globalThis.Module.radarCadence = [-6 * 3600, 0 * 3600, 40];

                if (globalThis.Module.doMapInit) {
                    _initMap("webglcanvas", mapCanvas)

                    if (readyFunc !== undefined) {
                        this.isReady = true
                        // Let things settle a beat and then let the dev get set up
                        setTimeout( () => {readyFunc(Terrier.ovl) }, 0)
                    }
                }
            },
        };

        // Have the main WhirlyGlobe web module load itself
        //  this also kicks off Emscriten
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = 'WhirlyGlobeWeb.js';
        s.defer = 'defer';
        document.body.appendChild(s);
    }

};

var Terrier = new TerrierModule()
export default Terrier;
