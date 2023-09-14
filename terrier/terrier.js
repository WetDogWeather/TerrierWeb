var Module

// Represents a single layer, like temperature or wind.
// Don't create these yourself
class TerrierLayer {
    constructor(layerName,state,params,ovl) {
        this.name = layerName
        this.state = state
        this.ovl = ovl
        this.updateParams(params)
    }

    // Update settings based on parameters you're allowed to pass in
    updateParams(params) {
        if ('interpMode' in params) {
            this.setInterpMode(params['interpMode'])
        }
        if ('opacity' in params) {
            this.setOpacity(params['opacity'])
        }
        if ('importFactor' in params) {
            this.setImportanceScale(params['importFactor'])
        }
    }

    // Stop and clean up layer
    stop() {
        if (this.state !== null) {
            this.state.enabled = false
        }
    }

    // Set the display interpolation mode
    // Use Nearest if you want to see the cells
    setInterpMode(type) {
        switch (type) {
            case 'nearest':
                this.state.controller.visInterp = globalThis.Module.TexInterpType.Nearest
                this.state.controller.varInterp = globalThis.Module.TexInterpType.Nearest
                break;
            case 'linear':
                this.state.controller.visInterp = globalThis.Module.TexInterpType.Linear
                this.state.controller.varInterp = globalThis.Module.TexInterpType.Linear
                break;
            // case TerrierModule.InterpType.Bicubic:
            //     this.ctl.visInterp = Module.TexInterpType.Nearest
            //     this.ctl.varInterp = Module.TexInterpType.Nearest
            //     break;
        }
    }

    // Change how the data is loaded based on screen real estate
    // A value greater than 1.0 means it's more important than default, less than 1.0 means less so
    setImportanceScale(importFactor) {
        this.state.controller.minImportanceFactor = importFactor
    }

    // Set the transparency/opacity of the layer itself.  1.0 is completely opaque
    setOpacity(opacity) {
        this.state.controller.opacity = opacity
    }

    // Change the color map being used for display
    setColorMap(colorMap) {
        this.state.controller.colorMap = colorMap
    }
}

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
    startLayer(layerName,params) {
        var foundState = null
        var level = null
        if ('level' in params) {
            level = params['level']
        }
        var colorMap = null
        if ('colorMap' in params) {
            colorMap = params['colorMap']
        }
        if (params == null || params == undefined) {
            params = {}
        }

        // Look for a matching controller state below
        let findControllerState = (name) => {
            for (var key in globalThis.Module.controllerState) {
                if (key.toLowerCase() == name.toLowerCase()) {
                    return globalThis.Module.controllerState[key]
                }
            }
        }

        switch (layerName) {
            // Three of these are special
            case "wind_uv":
            case "windUV":
                layerName = "windUV"
                globalThis.Module.enableWind = true
                globalThis.Module.windColorMap = colorMap ? colorMap : this.terrierModule.WIND_COLORS_NOT_GREY;
                if (level !== null && level !== undefined) {
                    globalThis.Module.selectedLevel = level
                }
                foundState = findControllerState("winduv")
                break;
            case "temperature":
                globalThis.Module.enableTemp = true
                globalThis.Module.tempColorMap = colorMap ? colorMap : this.terrierModule.TEMP_COLORS_NOT_GREY;
                if (level !== null && level !== undefined) {
                    globalThis.Module.selectedLevel = level
                }
                foundState = findControllerState("temperature")
                break;
            case "radar":
                globalThis.Module.enableRadar = true
                globalThis.Module.radarColorMap = colorMap ? colorMap : this.terrierModule.RADAR_COLORS_NOT_GREY;
                if (level !== null && level !== undefined) {
                    globalThis.Module.selectedLevel = level
                }
                foundState = findControllerState("radar")
                globalThis.Module.radarCadence = [-2*3600, 0, 30]
                break;
            // And the rest more generic
            // TODO: Pass in the colormap
            default:
                // Look for the controller state 
                for (state in globalThis.Module.controllerState) {
                    if (state.name == layerName) {
                        foundState = state
                        break
                    }
                }
                if (!foundState) {
                    console.log("Failed to find layer named " + layerName)
                    return null
                }
                foundState.enabled = true

                break;
        }

        // This creates the controls if they're not there already
        globalThis.Module.updateOverlay()

        // Wrap the layer around the newly updates state
        var layer = new TerrierLayer(layerName,foundState,params,this)

        return layer
    }

    // Stop the given layer from displaying
    stopLayer(layer) {
        layer.stop()

        globalThis.Module.updateOverlay()
    }

    // Add the given raw GeoJSON data
    // Note: Need a way to remove it
    addGeoJSON(geojson) {
        globalThis.Module.overlay.addGeoJSON(geojson)
    }

    // Return the current time in seconds from the epoch (1970)
    getCurrentTime() {
        if (globalThis.Module === undefined) { return 0.0 }

        return globalThis.Module.curTime
    }

    // Set the current time in seconds from the epoch (1970)
    setCurrentTime(epoch) {
        if (globalThis.Module === undefined) { return }
        // TODO: Cache this if there's no Module yet

        globalThis.Module.curTime = epoch
    }

    // Return the min/max time range available from loaded data
    getTimeRange() {
        if (globalThis.Module === undefined) { return [0.0,0.0] }
        return [globalThis.Module.tracker.minTime, globalThis.Module.tracker.maxTime]
    }

    // Play from beginning to end of the current times available
    timePlay(params) {
        if (globalThis.Module === undefined) { return }

        if (!params) {
            params = {}
        }

        if ('period' in params) {
            globalThis.Module.setPlayInterval(params['period'])
        }

        globalThis.Module.play()  
    }

    // Check if we're currently animating over time
    isTimePlaying() {
        if (globalThis.Module === undefined) { return false }

        return Module.tracker.isPlaying
    }

    // Stop animating over time
    timePause() {
        if (globalThis.Module === undefined) { return }

        globalThis.Module.pause()
    }

    // Update the transform used to move the map around
    // Don't call this unless you know you should, as
    //  it's pretty different between toolkits
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

    // Interpolation type for layers
    InterpType = {
        Nearest: 'nearest',
        Linear: 'linear',
        // Bicubic: 'bicubic',
    };

    // Wire in the global colormaps
    setupColorMaps() {
        Terrier.TEMP_COLORS_GREY = new globalThis.Module.TrrShaderColorMap(0, false, [255.372, 316.483], [0xFF000000, 0xFFFFFFFF]);
        Terrier.TEMP_COLORS_NOT_GREY = new globalThis.Module.TrrShaderColorMap(0, false,
            [255.372, 260.928, 266.483, 272.039, 277.594, 283.15, 288.706, 294.261, 299.817, 305.372, 310.928, 316.483],
            [0xFFFFBFFF, 0xFFD873DB, 0xFF913ABB, 0xFF372398, 0xFF00B6DC, 0xFF02D786, 0xFF40C604, 0xFFFFFF00, 0xFFFB7700, 0xFFD22402, 0xFFA20902, 0xFFEED9D8]);
        Terrier.WIND_COLORS_GREY = new globalThis.Module.TrrShaderColorMap(0, false, [0, 40], [0xFF000000, 0xFFFFFFFF]);
        Terrier.WIND_COLORS_NOT_GREY = new globalThis.Module.TrrShaderColorMap(0, false,
        [0, 5, 10, 15, 20, 25, 30, 35, 40],
            [0xFFAED5FF, 0xFF86B4E6, 0xFF66E2D6, 0xFF00CC05, 0xFFECF006, 0xFFFF6B00, 0xFFE11511, 0xFFE111C1, 0xFFFFCEF7]);
        
        Terrier.RADAR_COLORS_GREY = new globalThis.Module.TrrShaderColorMap(0, false, [-30, 5, 70], [0x00000000, 0xFF111111, 0xFFFFFFFF]);
        Terrier.RADAR_COLORS_NOT_GREY = new globalThis.Module.TrrShaderColorMap(0, false, [
        -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75
        ], [
            0x00000000,   // Not actually present in the data
            0x00000000,   // "
            0x11FFFFFF,   // Data present but no returns
            0x4410E6E7,
            0x7710E6E7,
            0xBB10E6E7,
            0xFF10E6E7,
            0xFF10E6E7,
            0xFF069FF3,
            0xFF0400F0,
            0xFF01FC08,
            0xFF02C701,
            0xFF068D01,
            0xFFF6F602,
            0xFFE6BA03,
            0xFFF79505,
            0xFFFE0002,
            0xFFD60401,
            0xFFBB0200,
            0xFFF807F6,
            0xFF9A52C8,
            0xFFFCFBFA,
        ]);
    }

    // Internal setup logic
    setupModule(initFunc, readyFunc) {
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
                Terrier.setupColorMaps()
                        
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
                globalThis.Module.service.stackName = Terrier.stackName;
                globalThis.Module.service.apiVersion = 1;
                globalThis.Module.tempCadence = [-24 * 3600, 24 * 3600, 40];
                globalThis.Module.windCadence = [-25 * 3600, 24 * 3600, 40];
                globalThis.Module.radarCadence = [-2 * 3600, 0 * 3600, 40];

                if (globalThis.Module.doMapInit) {
                    initFunc()
                }
            },
            onOverlayInitialized: function() {
                if (readyFunc !== undefined) {
                    this.isReady = true
                    // Let things settle a beat and then let the dev get set up
                    setTimeout( () => {readyFunc(Terrier.ovl) }, 0)
                }
            }
        };        
    }

    // Internal setup logic
    loadLibrary() {
        // Have the main WhirlyGlobe web module load itself
        //  this also kicks off Emscriten
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = 'WhirlyGlobeWeb.js';
        s.defer = 'defer';
        document.body.appendChild(s);            
    }

    // Initialize Terrier and get it ready to use a Leaflet Canvas overlay
    startLeaflet(stackName, canvasLayer, readyFunc) {
        this.stackName = stackName
        let terrierModule = this
        if (canvasLayer == undefined) {
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

        // Wire ourselves into the canvas layer delegate
        canvasLayer.delegate({
            onLayerDidMount() {
                setupModule(() => {
                    _initMap("webglcanvas", canvasLayer._canvas)
                }, readyFunc)
                Module.canvas = canvasLayer._canvas,

                this.loadLibrary()
            },
        
            onDrawLayer(info) {
                var px = canvasLayer._map.getPixelBounds()
                let far = 10.0
                let near = -10.0
                var transform = [2.0/(px.max.x-px.min.x), 0.0, 0.0, 0.0,  
                                0.0, -2.0/(px.max.y-px.min.y), 0.0, 0.0,  
                                0.0, 0.0, -2.0/(far-near), 0.0,
                                -(px.max.x+px.min.x)/(px.max.x-px.min.x), (px.max.y+px.min.y)/(px.max.y-px.min.y), -(far+near)/(far-near), 1.0]
                var geoCenter = canvasLayer._map.getCenter()
                Terrier.ovl.updateTransform(geoCenter.lng, geoCenter.lat, info.zoom, transform)
            }
        })
    }

    // Initialize Terrier and get it ready to use a MapLibre Map
    startMapLibre(stackName, maplibreMap, readyFunc) {
        this.stackName = stackName
        let terrierModule = this
        if (maplibreMap == undefined) {
            console.log('Need to pass the MapLibre map into TerrierInit.  Not starting.')
            return
        }

        // Already started, so just call them back
        if (this.isReady) {
            if (readyFunc !== undefined) {
                readyFunc(this.ovl)
            }
            return
        }

        this.setupModule(() => {
            _initMapLibre(maplibreMap)
        }, readyFunc)
        this.loadLibrary()
    }

};

var Terrier = new TerrierModule()
export default Terrier;
