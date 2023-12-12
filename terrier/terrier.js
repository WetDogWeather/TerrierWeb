var Module

// Represents a single layer, like temperature or wind.
// Don't create these yourself
class TerrierLayer {
    constructor(layerName,params,ovl) {
        this.name = layerName
        this.ovl = ovl

        if (params == null || params == undefined) {
            params = {}
        }

        this.level = null
        this.colorMap = null
        this.renderScale = 0.5
        this.importScale = 8.0

        this.setup(params)
    }

    setup(params) {
        if (params === undefined) {
            params = {}
        }
        if ('level' in params) {
            this.level = params['level']
        }
        if ('colorMap' in params) {
            this.colorMap = params['colorMap']
        }
        if ('renderScale' in params) {
            this.renderScale = params['renderScale']
        }
        if ('cadence' in params) {
            this.cadence = params['cadence']
        }
        if ('importFactor' in params) {
            this.importScale = params['importFactor']
        }

        // Look for a matching controller state below
        let findControllerState = (name) => {
            for (var key in globalThis.Module.controllerState) {
                if (key.toLowerCase() == name.toLowerCase()) {
                    return globalThis.Module.controllerState[key]
                }
            }
        }

        var foundState = null
        switch (this.name) {
            // Three of these are special
            case "wind_uv":
            case "windUV":
                this.name = "windUV"
                globalThis.Module.enableWind = true
                globalThis.Module.windColorMap = this.colorMap ? this.colorMap : Terrier.WIND_COLORS_NOT_GREY;
                globalThis.Module.windScale = this.renderScale
                globalThis.Module.windCadence = this.cadence
                if (this.level !== null && this.level !== undefined) {
                    globalThis.Module.selectedLevel = this.level
                }
                foundState = findControllerState("winduv")
                break;
            case "temperature":
                globalThis.Module.enableTemp = true
                globalThis.Module.tempColorMap = this.colorMap ? this.colorMap : Terrier.TEMP_COLORS_NOT_GREY;
                globalThis.Module.tempScale = this.renderScale
                globalThis.Module.tempCadence = this.cadence
                if (this.level !== null && this.level !== undefined) {
                    globalThis.Module.selectedLevel = this.level
                }
                foundState = findControllerState("temperature")
                break;
            case "radar":
                globalThis.Module.enableRadar = true
                globalThis.Module.radarColorMap = this.colorMap ? this.colorMap : Terrier.RADAR_COLORS_NOT_GREY;
                globalThis.Module.radarCadence = this.cadence
                if (this.level !== null && this.level !== undefined) {
                    globalThis.Module.selectedLevel = this.level
                }
                globalThis.Module.radarScale = this.renderScale
                foundState = findControllerState("radar")
                globalThis.Module.radarCadence = [-2*3600, 0, 30]
                break;
            // And the rest more generic
            // TODO: Pass in the colormap
            default:
                // Look for the controller state 
                if (this.name in globalThis.Module.controllerState) {
                    foundState = globalThis.Module.controllerState[this.name]
                }
                if (!foundState) {
                    console.log("Failed to find layer named " + this.name)
                    return null
                }
                if (this.level !== null && this.level !== undefined) {
                    globalThis.Module.selectedLevel = this.level
                    // foundState.level = this.level
                } else {
                    globalThis.Module.selectedLevel = null                    
                }
                if (this.colorMap !== null && this.colorMap !== undefined) {
                    foundState.colorMap = this.colorMap
                }
                foundState.cadence = this.cadence
                foundState.renderScale = this.renderScale
                foundState.enabled = true

                break;
        }

        this.state = foundState

        // This creates the controls if they're not there already
        globalThis.Module.updateOverlay()

        this.setImportanceScale(this.importScale)
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
            this.importScale = params['importFactor']
            this.setImportanceScale(this.importScale)
        }
    }

    // Change the level displayed
    setLevel(newLevel) {
        if (globalThis.Module.selectedLevel != newLevel) {
            globalThis.Module.selectedLevel = newLevel
            this.refresh()
        }
    }

    // Force the layer to unload, then reload
    refresh() {
        this.stop()
        globalThis.Module.updateOverlay()
        this.setup({})
    }

    // Stop and clean up layer
    stop() {
        switch (this.name) {
            // Three of these are special
            case "wind_uv":
            case "windUV":
                globalThis.Module.enableWind = false
                break;
            case "temperature":
                globalThis.Module.enableTemp = false
                break;
            case "radar":
                globalThis.Module.enableRadar = false
                break;
            // And the rest more generic
            default:
                if (this.state !== null) {
                    this.state.enabled = false
                }
                break;
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
        globalThis.Module.repaint()
    }

    // Change how the data is loaded based on screen real estate
    // A value greater than 1.0 means it's more important than default, less than 1.0 means less so
    setImportanceScale(importFactor) {
        if (this.state.controller.minImportanceFactor !== undefined && this.state.controller.minImportanceFactor == importFactor) {
            return
        }
        this.state.controller.minImportanceFactor = Number(importFactor)
        globalThis.Module.repaint()
    }

    // Set the transparency/opacity of the layer itself.  1.0 is completely opaque
    setOpacity(opacity) {
        this.state.controller.opacity = opacity
        globalThis.Module.repaint()
    }

    // Return the current color map
    getColorMap() {
        return this.state.controller.colorMap
    }

    // Change the color map being used for display
    setColorMap(colorMap) {
        this.state.controller.colorMap = colorMap
        globalThis.Module.repaint()
    }

    // Query a value at a given location
    queryValue(x,y) {
        var ret = this.state.controller.queryValue(x, y)
        if (!Array.isArray(ret)) {
            ret = [ret]
        }
        return {
            // Can return one or more values
            "value": ret,
            // Will add lat/lon later
        }
    }
}

// Represents an overlay into another map toolkit or
//  a Canvas with WebGL.  This is how you control what
//  Terrier is displaying in our window.
class TerrierOverlay {
    constructor(terrierModule) {
        this.terrierModule = terrierModule
        this.activeLayers = new Set()
    }
    
    // Start the display of a given layer by name.
    // The layer names can be found in the stack contents are things like "temperature" or "cloud_cover"
    // Leave level blank if there is no level information.  These can also be found
    //  in the stack contents.
    // Returns an identifier for the layer
    startLayer(layerName,params) {
        // Wrap the layer around the newly updates state
        var layer = new TerrierLayer(layerName,params,this)

        this.activeLayers.add(layer)

        this.checkCanvas()

        return layer
    }

    // Stop the given layer from displaying
    stopLayer(layer) {
        layer.stop()

        this.activeLayers.delete(layer)

        globalThis.Module.updateOverlay()

        this.checkCanvas()
    }

    // Return the list of currently active layers
    getLayers() {
        if (!this.activeLayers) {
            return []
        }

        return [...this.activeLayers];
    }

    // If we're attached to a canvas, hide it if there are no layers
    checkCanvas() {
        if (!Terrier.webglCanvasMode) {
            return
        }
        if (globalThis.Module.canvas != null) {
            if (this.activeLayers.size == 0) {
                globalThis.Module.canvas.style.visibility = "hidden"
            } else {
                globalThis.Module.canvas.style.visibility = "visible"
            }
        }
    }

    // Add the given raw GeoJSON data
    // Note: Need a way to remove it
    addGeoJSON(geojson) {
        globalThis.Module.overlay.addGeoJSON(geojson)
    }

    // Return the current time in seconds from the epoch (1970)
    getCurrentTime() {
        if (globalThis.Module === undefined) { return 0.0 }

        return globalThis.Module.tracker.curTime / 1000.0
    }

    // Set the current time in seconds from the epoch (1970)
    setCurrentTime(epoch) {
        if (globalThis.Module === undefined) { return }
        // TODO: Cache this if there's no Module yet

        if (globalThis.Module.tracker.curTime != epoch) {
            globalThis.Module.tracker.curTime = epoch * 1000.0
            globalThis.Module.repaint()
        }
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

        return globalThis.Module.tracker.isPlaying
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
        if (globalThis.Module == undefined) { return }
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
        this.numConnections = 8
        this.webglCanvasMode = false
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

    // Create a color map with value and colormap arrays
    createColorMap(values, colors) {
        if (values.length != colors.length) {
            console.log("createColorMap: Values and colors array must be same length.")
            return
        }
        return new globalThis.Module.TrrShaderColorMap(0, false, values, colors)
    }

    // Internal setup logic
    setupModule(initFunc, readyFunc) {
        // Already initialized the module, so just call them back
        if ('Module' in globalThis) {
            if (initFunc !== undefined) {
                initFunc()
            }
            if (readyFunc !== undefined) {
                // Let things settle a beat and then let the dev get set up
                setTimeout( () => {readyFunc(Terrier.ovl) }, 0)
            }

            return
        }

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
            numConnections: Terrier.numConnections,

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
                globalThis.Module.service.apiVersion = 2;
                globalThis.Module.tempCadence = [-24 * 3600, 24 * 3600, 40];
                globalThis.Module.windCadence = [-25 * 3600, 24 * 3600, 40];
                globalThis.Module.radarCadence = [-2 * 3600, 0 * 3600, 40];

                if (globalThis.Module.doMapInit) {
                    initFunc()
                }
            },
            onOverlayInitialized: function() {
                Terrier.isReady = true
                if (readyFunc !== undefined) {
                    // Let things settle a beat and then let the dev get set up
                    setTimeout( () => {readyFunc(Terrier.ovl) }, 0)
                }
                globalThis.Module.onOverlayInitialized = null
            }
        };        
    }

    libraryLoaded = false

    // Internal setup logic
    loadLibrary() {
        if (!this.libraryLoaded) {
            // Have the main WhirlyGlobe web module load itself
            //  this also kicks off Emscriten
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = 'WhirlyGlobeWeb.js';
            s.defer = 'defer';
            document.body.appendChild(s);            
            this.libraryLoaded = true
        }
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
    fetchStackContents(fetchFunc, failFunc) {
        // TODO: We'll move this into the stack at some point
        fetch("https://wetdogmaplibre.s3.us-west-2.amazonaws.com/config/"+this.stackName+"_stack_contents.json")
            .then((response) =>  {
                if (response.ok) {
                    return response.json()
                } else {
                    failFunc()
                }
            })
            .then((data) => {
                Terrier.stackContents = data
                fetchFunc(Terrier.stackContents)
            })
    }

    // Search through the stack contents to return all the various levels for a variable
    //  among all the sources
    variableLevelsForStack(dataType) {
        var levels = new Set([])
        if (!this.stackContents) {
            return levels
        }
        for (const [ modelKey, model ] of Object.entries(this.stackContents)) {
            for (const [ regionKey, region ] of Object.entries(model)) {
                for (const [ typeKey, type ] of Object.entries(region)) {
                    for (const [ _, variable ] of Object.entries(type)) {
                        if (variable.dataType.toLowerCase() == dataType) {
                            variable.levels.forEach( (level) => {
                                levels.add(level)
                            })
                        }
                    }
                }
            }
        }

        return Array.from(levels)
    }

    // Search through the stack contents for the unique variables
    // You can use those to start layers
    variablesForStack() {
        var variables = new Set([])
        for (const [ modelKey, model ] of Object.entries(this.stackContents)) {
            for (const [ regionKey, region ] of Object.entries(model)) {
                for (const [ typeKey, type ] of Object.entries(region)) {
                    for (const [ _, variable ] of Object.entries(type)) {
                        variables.add(variable)
                    }
                }
            }
        }

        return Array.from(variables)
    }

    // Change display to a new stack
    // Note: We're assuming the caller is tearing down their layers
    changeStack(stackName, readyFunc, failedFunc) {
        // If they call it too early, just ignore it
        if (!this.isReady) { return }
        if (this.stackName == stackName) { return }

        this.stackName = stackName
        globalThis.Module.service.stackName = Terrier.stackName;

        this.fetchStackContents( () => {
            readyFunc(Terrier.ovl)
        }, 
        () => {
            failedFunc()
        })
    } 

    // Initialize Terrier and get it ready to use a Leaflet Canvas overlay
    startLeaflet(stackName, canvasLayer, readyFunc) {
        this.stackName = stackName

        // Already started, so just call them back
        if (this.isReady) {
            if (readyFunc !== undefined) {
                readyFunc(this.ovl)
            }
            return
        }

        if (canvasLayer == undefined) {
            console.log('Need to pass the mapCanvas into TerrierInit.  Not starting.')
            return
        }
        this.webglCanvasMode = true

        // Wire ourselves into the canvas layer delegate
        canvasLayer.delegate({
            onLayerDidMount() {
                Terrier.fetchStackContents( () => {
                    Terrier.setupModule(() => {
                        _initMap("webglcanvas", canvasLayer._canvas)
                    }, readyFunc)
                    globalThis.Module.canvas = canvasLayer._canvas,

                    Terrier.loadLibrary()
                }, 
                () => {
                    console.log("Failed to fetch stack contents.  Terrier will not start.")
                })        
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

        this.fetchStackContents( () => {
            this.setupModule(() => {
                _initMapLibre(maplibreMap)
            }, readyFunc)
            this.loadLibrary()
        },
        () => {
            console.log("Failed to fetch stack contents.  Terrier will not start.")
        })
    }

    // Unwire ourselves from whatever library we're wired into
    stop() {
        if (this.webglCanvasMode) {
            _shutdownWebglCanvas()
        }
        this.isReady = false
    }

};

if (!('Terrier' in globalThis)) {
    var Terrier = new TerrierModule()
}

export default Terrier;
