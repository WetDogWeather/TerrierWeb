var Module

/** 
 * The Terrier Layer represents a single data layer, like temperature or
 * wind.  Don't create one of these directly, have the TerrierOverlay do it
 * for you with the startLayer() call.  But once you have a TerrierLayer,
 * you can modify it with this object.
 **/
class TerrierLayer {

    /**
     * @hideconstructor
     */
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

    // Internal param parsing.  Don't call this.
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
        if ('startFrame' in params) {
            this.startFrame = params['startFrame']
        }
        var hasImportScale = false
        if ('importFactor' in params) {
            this.importScale = params['importFactor']
            hasImportScale = true
        }
        if ('loadCallback' in params) {
            this.loadCallback = params['loadCallback']
        }
        if ('source' in params) {
            // model, region, type, variable, level
            this.source = params['source']
            if (!this.source['model'] || 
                !this.source['variable']) {
                    console.log("Missing parameters in source description.")
                    return
                }
        }
        if (!('sources' in params)) {
            params['sources'] = Terrier.sourcesFromLayerName(this.name,this.level)
        }
        let jsonSources = params['sources']
        if (jsonSources == undefined || jsonSources.length == 0) {
            console.log("TerrierLayer: No sources set.  Giving up.")
            return
        }
        let dataType = jsonSources[0].dataType

        // Note: Need to line up the internal types with what Boxer is publishing
        if (dataType == "velocity") {
            dataType = "WindGust"
        }
        // Note: Need to switch this to a slightly tweaked version
        if (dataType == "preciptype") {
            dataType = "WindGust"
        }

        // Convert to TrrDataSources
        var sources = []
        jsonSources.forEach(jsonSource => {
            let source = new globalThis.Module.TrrDataSource(
                jsonSource.source,
                jsonSource.region,
                jsonSource.product,
                jsonSource.variable,
                jsonSource.level,
                jsonSource.interval,
                jsonSource.temporalType,
                jsonSource.dataType,
                jsonSource.depth,
                jsonSource.isGlobal,
                jsonSource.hasMissingValues,
                jsonSource.importanceScale
            )
            sources.push(source)
        })

        // Look for a matching controller state below
        let findControllerState = (name) => {
            for (var key in globalThis.Module.controllerState) {
                if (key.toLowerCase() == name.toLowerCase()) {
                    return globalThis.Module.controllerState[key]
                }
            }
        }

        var foundState = null
        // TODO: Switch to an a/b/c/d endpoint and set this high
        globalThis.Module.numConnections = Terrier.numConnections
        switch (dataType) {
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
                } else {
                    globalThis.Module.selectedLevel = null
                }
                if (this.startFrame !== null && this.startFrame !== undefined) {
                    globalThis.Module.windStartFrame = this.startFrame
                }
                if (this.loadCallback !== null && this.loadCallback !== undefined) {
                    globalThis.Module.windCallback = this.loadCallback
                }
                globalThis.Module.windSources = sources
                foundState = findControllerState("winduv")
                break;
            case "temperature":
                globalThis.Module.enableTemp = true
                globalThis.Module.tempColorMap = this.colorMap ? this.colorMap : Terrier.TEMP_COLORS_NOT_GREY;
                globalThis.Module.tempScale = this.renderScale
                globalThis.Module.tempCadence = this.cadence
                if (this.level !== null && this.level !== undefined) {
                    globalThis.Module.selectedLevel = this.level
                } else {
                    globalThis.Module.selectedLevel = null
                }
                if (this.startFrame !== null && this.startFrame !== undefined) {
                    globalThis.Module.tempStartFrame = this.startFrame
                }
                if (this.loadCallback !== null && this.loadCallback !== undefined) {
                    globalThis.Module.tempCallback = this.loadCallback
                }
                globalThis.Module.tempSources = sources
                foundState = findControllerState("temperature")
                break;
            case "radar":
            case "reflectivity":
                globalThis.Module.enableRadar = true
                globalThis.Module.numConnections = 32
                globalThis.Module.radarColorMap = this.colorMap ? this.colorMap : Terrier.RADAR_COLORS_NOT_GREY;
                globalThis.Module.radarCadence = this.cadence
                if (this.level !== null && this.level !== undefined) {
                    globalThis.Module.selectedLevel = this.level
                } else {
                    globalThis.Module.selectedLevel = null
                }
                if (!hasImportScale) {
                    this.importScale = 16.0
                }
                if (this.startFrame !== null && this.startFrame !== undefined) {
                    globalThis.Module.radarStartFrame = this.startFrame
                }
                if (this.loadCallback !== null && this.loadCallback !== undefined) {
                    globalThis.Module.radarCallback = this.loadCallback
                }
                globalThis.Module.radarScale = this.renderScale
                globalThis.Module.radarSources = sources
                foundState = findControllerState("radar")
                break;
            case "visual":
                globalThis.Module.enableVisual = true
                globalThis.Module.visualSource = this.source
                foundState = findControllerState("visual")
                if (this.startFrame !== null && this.startFrame !== undefined) {
                    globalThis.Module.visualStartFrame = this.startFrame
                }
                if (this.loadCallback !== null && this.loadCallback !== undefined) {
                    globalThis.Module.visualCallback = this.loadCallback
                }
                // Note: Debugging
                globalThis.Module.visualSources = sources
                globalThis.Module.visualCadence = [0,30*60,6]
                break;
            // And the rest more generic
            // TODO: Pass in the colormap
            default:
                // Look for the controller state
                foundState = findControllerState(dataType)
                if (!foundState) {
                    foundState = findControllerState("Visibility");
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
                if (this.startFrame !== null && this.startFrame !== undefined) {
                    foundState.startFrame = this.startFrame
                }
                if (this.loadCallback !== null && this.loadCallback !== undefined) {
                    foundState.callback = this.loadCallback
                }
                foundState.cadence = this.cadence
                foundState.renderScale = this.renderScale
                foundState.enabled = true

                break;
        }

        foundState.sources = sources
        this.state = foundState

        if (this.cadence) {
            let now = Date.now()
            this.ovl.setTimeRange(now+this.cadence[0]*1000,now+this.cadence[1]*1000)
        }

        // This creates the controls if they're not there already
        globalThis.Module.updateOverlay()

        this.setImportanceScale(this.importScale)
        this.updateParams(params)        
    }

    /**
     * If you'd like to change parameters with a dictionary, this is
     * the way to do it.  You can also make direct calls to setInterpMode()
     * and other methods directly.  
     * 
     * For a discussion of what the params dictionary contains, look at the
     * startLayer() method in the TerrierOverlay.
     * @param {Dictionary} params A dictionary of parameters values including 'interpMode', 'opacity' and 'importFactor'.
     */
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

    /**
     * Some layers have levels. This might be 'sfc' or '5m' or
     * '100m' or something of that sort.  If the layer does have
     * a level, you can set or change it with this.
     * @param {string} newLevel The level to select for this layer.  
     * The data for that level needs to be available from the source.
     */
    setLevel(newLevel) {
        if (this.level != newLevel) {
            this.level = newLevel
            this.refresh()
        }
    }

    /*
     * Force a reload of the data layer.  You shouldn't need to
     * call this yourself.
     */
    refresh() {
        this.stop()
        globalThis.Module.updateOverlay()
        this.setup({})
    }

    // Don't call this directly.  Use the TerrierOverlay
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
            case "reflectivity":
                globalThis.Module.enableRadar = false
                break;
            // And the rest more generic
            case "visual":
                globalThis.Module.enableVisual = false
                break;
            default:
                if (this.state !== null) {
                    this.state.enabled = false
                }
                break;
        }        
    }

    /**
     * Set the interpolation type for data values.  This is how the
     * data is interpolated between cells as it's being rendered into
     * screen space.  This is separate from applying the color map.
     * Set it to nearest if you'd like to see each cell or you have
     * a data type that can't be interpolated (e.g. precip type).
     * Set it to linear to see bilinear interpolation.
     * Set to cubic for bicubic interpolation.
     * @param {string} type Set the interpolation mode to be used for the layer.
     * This can be 'nearest' to see the data cells themselves.
     * It can be 'linear' for bilinear interpolation, which is the default.
     * It can also be 'cubic' for bicubic interpolation, which is costly, but looks
     * very good for data with blobby structures, like radar.
     */
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

    /**
     * Terrier is fairly parsimonious with its memory and network bandwidth.  By
     * default it will load a very low resolution of your data.  This is how to
     * make it load more based on the screen resolution.
     * 
     * Internally there is a number called 'importance' that is used to decide when
     * a given data tile will be loaded.  We can tweak that number to make things
     * more important.  Without getting into what it actually means, we use a default
     * of 8.  If you want to force near pixel accuracy try 16 or 32.
     * @param {float} importScale The importance scale, or importFactor (sometimes)
     * to adjust the loading logic.
     */
    setImportanceScale(importScale) {
        if (this.state.controller.minImportanceFactor !== undefined && this.state.controller.minImportanceFactor == importScale) {
            return
        }
        this.state.controller.minImportanceFactor = Number(importScale)
        globalThis.Module.repaint()
    }

    /**
     * Much of the time you're overlaying your data layer on top of a map.  As
     * such you don't want it to be completely opaque and hide the map.  You can
     * control that value here.
     * 
     * 0 is completely transparent and 1 is completely opaque.
     * @param {float} opacity 
     */
    setOpacity(opacity) {
        this.state.controller.opacity = opacity
        globalThis.Module.repaint()
    }

    /**
     * Terrier controls its color maps a TrrShaderColorMap object.  You
     * typically pass in a couple of arrays to do this, one for color
     * and one for value, but those are turned into a TrrShaderColorMap which
     * can be queried.
     * @returns TrrShaderColorMap The color map currently being used by
     * this layer.
     **/
    getColorMap() {
        return this.state.controller.colorMap
    }

    /**
     * If you'd like to set the color map directly, which you're allowed to
     * do at run time, you can do so here.  The method is expecting a TrrShaderColorMap
     * object which you'll need to set up yourself.
     * @param {TrrShaderColorMap} colorMap The color map to set for this layer.
     */
    setColorMap(colorMap) {
        if (!colorMap) {
            return
        }
        this.colorMap = colorMap
        this.state.controller.colorMap = colorMap
        globalThis.Module.repaint()
    }

    /**
     * Change the cadence (time range and time steps).
     * If the data has already loaded, this will only change the start/end
     * times of the display.
     */
    setCadence(cadence) {
        if (this.state === undefined || this.state.controller === undefined) {
            return
        }
        this.cadence = cadence
        this.state.controller.cadence = new Module.TrrSourceCadence(...cadence)
    }

    /**
     * Query the data value at a given point.
     * 
     * Terrier renders data and turns it into colors (or other displays) at the last
     * stage.  That makes it possible to query the data values at given point and this
     * is how you do that.
     * 
     * Query the data value at a particular screen location.  Coordinates are at full
     * resolution within the OpenGL context.
     * 
     * @param {float} x Horizontal fraction across the OpenGL window, from 0 to 1.
     * @param {float} y Vertical fraction across the OpenGL window, from 0 to 1.
     * @returns An array with one or two values, depending on what you queried.  Wind returns two.
     */
    queryValue(x,y) {
        if (globalThis.Module === undefined || globalThis.Module.canvas === undefined) {
            return null
        }
        var ret = this.state.controller.queryValue(x / globalThis.Module.canvas.width, y / globalThis.Module.canvas.height)
        if (!Array.isArray(ret)) {
            ret = [ret]
        }
        if (ret[0] > 1e10) {
            return null
        }
        return {
            // Can return one or more values
            "value": ret,
            // Will add lat/lon later
        }
    }
}

/**
 * Terrier manages its layers through this singleton class.
 * You won't create one of these, but will be given one in the
 * callback for setup from the TerrierModule.
 * 
 * Think of it as the Terrier Overlay on top of your map, whether
 * that's MapLibre or Leaflet or some other.
 * 
 * You can keep the TerrierOverlay around to add and remove layers
 * as needed.
 * @hideconstructor
 */
class TerrierOverlay {
    constructor(terrierModule) {
        this.terrierModule = terrierModule
        this.activeLayers = new Set()
    }
    
    /**
     * Start displaying a layer of the given name/type.  Assuming Terrier recognizes the 
     * name, which will be something like 'temperature', it will fetch the corresponding
     * data manifests and start up the rendering pipeline.
     * 
     * The layerName depends on the contents of your stack and will be something like
     * 'temperature' or 'wind'.  A list of available layer names can be gotten from the
     * fetchStackContents() in the TerrierModule, but you can also hard code those
     * based on what you know is in your stack.  
     * 
     * @param {string} layerName Name of the layer to display, such as 'temperature'.
     * @param {Dictionary} params Parameters that control the display and structural
     * use of the layer.  These include everything you might need to set up the layer
     * including things which can be modified later.  
     * 
     * 'level' selects the level of the data layer, if it has one.  For instance you
     * might have 'sfc', '10m', and '152m' available for 'temperature'.  It depends on
     * your data and you can see the full list from the stack contents, or just hard
     * code it based on what you know is there.  
     * 
     * 'colorMap' sets the color map for the display.  This is a TrrShaderColorMap
     * object which you'll need to create and pass in.  
     * 
     * 'renderScale' sets the scale at which the data is rendered.  Terrier is designed
     * to render data to the screen and then turn that data into colors.  It uses fairly
     * complex shaders to render the data to the screen and will thus try to do less
     * work.  The renderScale is a factor we multiply the WebGL screen size by to
     * downsample the rendering target.  It's 0.25 by default and you can probably leave
     * it alone.  
     * 
     * 'cadence' is an array of 3 values defining the min and max time offsets from now to
     * load for a layer.  The third argument is the number of time slices.  The defaults
     * will be picked up from the stack, so you don't really need to set this, but it
     * can be useful to cut down on loading.  For instance, if you only need the next
     * half hour of data and you know it comes in 5 minute increments you could do:
     * [0,30*60,6].  That will load data from 'now' to a half hour from now and restrict
     * it to at most 6 time slices.
     * 
     * 'importFactor' controls how much data we load for a given area.  Since we're fetching
     * data with a lot of time slices we don't tend to match it pixel for pixel for the screen
     * resolution.  By default this value is 8.  If you want more resolution, set a value up to
     * 32.  If you want less, for some reason, it can go down to 1.
     * 
     * 'startFrame' will set the starting frame to either 'first' or 'last' or 'current.
     * 'current' just sets the current time where 'first' or 'last' will snap to the appropriate
     * frame time.  You would use 'last' for radar, for example to show the most recent radar.
     * 
     * @returns {TerrierLayer} The layer object you can interact with directly to make
     * real-time changes.
     */
    startLayer(layerName,params) {
        // Wrap the layer around the newly updates state
        var layer = new TerrierLayer(layerName,params,this)

        this.activeLayers.add(layer)

        this.checkCanvas()

        return layer
    }

    /**
     * Stop displaying the given layer.  This is the TerrierLayer returned by startLayer().
     * This will not shut down Terrier, however.  You need to do that with the Terrier module.
     * 
     * @param {TerrierLayer} layer The layer to stop displaying.
     */
    stopLayer(layer) {
        layer.stop()

        this.activeLayers.delete(layer)

        globalThis.Module.updateOverlay()

        this.checkCanvas()
    }

    /**
     * Get the list of currently active layers.  These are all TerrierLayer objects.
     * @returns The list of currently active layers.
     */
    getLayers() {
        if (!this.activeLayers) {
            return []
        }

        return [...this.activeLayers];
    }

    /*
     * If we're using a Javascript canvas for display, we may want to hide that canvas
     * if no layers are currently visible.  We use this in package integrations with
     * things like Leaflet.  You probably don't need to call it directly.
     */
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

    /**
     * You can add a bit of GeoJSON over top of the map.  This is largely here
     * for debugging as you probably have a good way to do that with the base 
     * map toolkit.
     * 
     * @param {json} geojson The JSON object for GeoJSON.
     */
    addGeoJSON(geojson) {
        globalThis.Module.overlay.addGeoJSON(geojson)
    }

    /**
     * Returns the current time being displayed (in seconds from the 1970 epoch), rather
     * than the current wall clock time.
     * @returns {float}
     */
    getCurrentTime() {
        if (globalThis.Module === undefined || globalThis.Module.tracker === undefined) { return 0.0 }

        return globalThis.Module.tracker.curTime / 1000.0
    }

    /**
     * Set the displayed time (in seconds from the 1970 epoch).  This is the time Terrier
     * will use for calculating the display and is separate from wall clock time.
     * @param {float} epoch Seconds since the 1970 epoch.
     */
    setCurrentTime(epoch) {
        if (globalThis.Module === undefined || globalThis.Module.tracker === undefined) { return }
        // TODO: Cache this if there's no Module yet

        if (globalThis.Module.tracker.curTime != epoch) {
            globalThis.Module.tracker.curTime = epoch * 1000.0
            globalThis.Module.repaint()
        }
    }

    /**
     * Nearest frame mode means we snap to the nearest frame time when setting
     * the value (and tracker) for display.
     * 
     * @returns Return true if nearest frame mode is on
     */
    getNearestFrame() {
        if (globalThis.Module === undefined || globalThis.Module.tracker === undefined) { return true; }
        return globalThis.Module.tracker.nearestFrame
    }

    /**
     * Nearest frame mode means we snap to the nearest frame time when setting
     * the value (and tracker) for display.
     * 
     * @param {double} nearFrame 
     */
    setNearestFrame(nearFrame) {
        if (globalThis.Module === undefined || globalThis.Module.tracker === undefined) { return }

        globalThis.Module.tracker.nearestFrame = nearFrame
    }

    /**
     * Returns the minimum and maximum times available from the data currently loaded.
     * Times are in seconds from the 1970 epoch.
     * @returns An array of 2 floats describing the min and max time.
     */
    getTimeRange() {
        if (globalThis.Module === undefined || globalThis.Module.tracker === undefined) { return [0.0,0.0] }
        return [globalThis.Module.tracker.minTime, globalThis.Module.tracker.maxTime]
    }

    /**
     * Set the min and max epoch (time in ms since 1970) for the current display.
     */
    setTimeRange(minEpoch,maxEpoch) {
        if (globalThis.Module === undefined || globalThis.Module.tracker === undefined) { return }
        globalThis.Module.tracker.setRange(minEpoch,maxEpoch)
    }
    
    /**
     * Terrier likes to control animation itself, rather than depend on an outside
     * app to smoothly run through a time range with setCurrentTime().  The way
     * this works is you call this method and it will start animating.  Then
     * periodically query the current time with getCurrentTime() and update
     * your own controls from that.
     * @param {Dictionary} params This dictionary contains values which control
     * the animation.  
     * 
     * 'period' the number of wall clock seconds to animate from the start of
     * the time range to the end of it.
     * 
     * 'pause' is the number of wall clock seconds to pause at the end of the
     * animation before wrapping around to the start.
     */
    timePlay(params) {
        if (globalThis.Module === undefined || globalThis.Module.tracker === undefined) { return }

        if (!params) {
            params = {}
        }

        if ('period' in params) {
            globalThis.Module.setPlayInterval(params['period'])
        }
        if ('pause' in params) {
            globalThis.Module.setPauseInterval(params['pause'])
        }

        globalThis.Module.play()  
    }

    /**
     * If Terrier is animating the data over time, this returns true.
     */
    isTimePlaying() {
        if (globalThis.Module === undefined || globalThis.Module.tracker === undefined) { return false }

        return globalThis.Module.tracker.isPlaying
    }

    /**
     * Pause the time animation if it's running.  This does nothing if Terrier is
     * already paused.
     */
    timePause() {
        if (globalThis.Module === undefined || globalThis.Module.tracker === undefined) { return }

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

/**
 * This is the module logic for Terrier and it's where you'll go to
 * start the toolkit running.  If you're overlaying on Leaflet, us the
 * startLeaflet() method to kick off display.  For MapLibre, use
 * startMapLibre().
 * 
 * You won't create one of these, we do that when the JS file is loaded.
 * Then you access the TerrierModule through the 'Terrier' global variable.
 * You use the start methods as defined above and call stop() when you
 * want Terrier to destroy all of its rendering infrastructure. 
 */
class TerrierModule {
    /**
     * @hideconstructor
     */
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
            0x4410E6E7, 0x7710E6E7, 0xBB10E6E7, // Not visible either
            0xFF10E6E7, 0xFF10E6E7, 0xFF069FF3, 0xFF0400F0, 0xFF01FC08, 0xFF02C701, 0xFF068D01, 0xFFF6F602, 
            0xFFE6BA03, 0xFFF79505, 0xFFFE0002, 0xFFD60401, 0xFFBB0200, 0xFFF807F6, 0xFF9A52C8, 0xFFFCFBFA,
        ], [
            false, false, false,
            false, false, false,
            true, true, true, true, true, true,
            true, true, true, true, true, true, true, true,
            true, true, true, true, true, true, true, true
        ]);
        Terrier.SEVERE_HAIL_INDEX_COLORS = new globalThis.Module.TrrShaderColorMap(0, false,
            [0, 5, 10, 20, 30, 40, 50, 60, 80, 100, 150, 250, 500, 1500],
            [0xff06ecec, 0xff00a0f6, 0xff0600f6, 0xff01ff00, 0xff00c801, 0xff009000, 
                0xffffff04, 0xffe7c102, 0xffff9100, 0xffff0100, 0xffc00100, 0xffff01ff, 0xffbe55dc, 0xff7e32a7]);
        Terrier.PROB_SEVERE_HAIL_COLORS = new globalThis.Module.TrrShaderColorMap(0, false,
            [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            [0xff06ecec, 0xff00a0f6, 0xff0600f6, 0xff01ff00, 0xff00c801, 
                0xff009000, 0xffffff04, 0xffe7c102, 0xffff9100, 0xffff0100, 0xffff0100]);
        Terrier.HAIL_SIZE_COLORS = new globalThis.Module.TrrShaderColorMap(0, false,
            [0, 1, 2, 4, 6, 8, 10, 15, 20, 30, 40, 50, 75, 100],
            [0xff06ecec, 0xff00a0f6, 0xff0600f6, 0xff01ff00, 0xff00c801, 0xff009000, 
                0xffffff04, 0xffe7c102, 0xffff9100, 0xffff0100, 0xffc00100, 0xffff01ff, 0xffbe5, 0xff7e32a7]);                
        Terrier.QPE_FFG_RATIO_COLORS = new globalThis.Module.TrrShaderColorMap(0, false,
            [0.0, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.00, 2.25, 2.50, 2.75, 3.00, 3.50, 4.00, 5.00],
            [0xffbebebe, 0xff8c8c8c, 0xff6e6e6e, 0xff505050, 0xff01b500, 0xff009b01, 
                0xffffff04, 0xffffe102, 0xffffc802, 0xffffb400, 0xffffa100, 0xffb40100, 0xffc80200, 
                0xffe20100, 0xffff0100, 0xffff01ff, 0xffd300d2, 0xffaa00ab, 0xff800080]);                
        Terrier.PRECIP_FLAG_COLORS = new globalThis.Module.TrrShaderColorMap(0, false,
            [0, 1, 3, 6, 7, 10, 91, 96],
            [0x00000000, 0xFF0350a5, 0xFFffffff, 0xFFff3332, 0xFF960096, 0xFF6effff, 0xFF00fa00, 0xFF039700]);
        

        // A placeholder for an index value we haven't made a proper colormap for yet
        Terrier.INDEXPLACE_COLORS_NOT_GREY = new globalThis.Module.TrrShaderColorMap(0, false,
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
            [0xFF0000FF, 0xFFFF0000, 0xFF00FF00, 0xFFFFFF00, 0xFF00FFFF, 
                0xFF0000FF, 0xFFFF0000, 0xFF00FF00, 0xFFFFFF00, 0xFF00FFFF,
                0xFF0000FF, 0xFFFF0000, 0xFF00FF00, 0xFFFFFF00, 0xFF00FFFF,
                0xFF0000FF, 0xFFFF0000, 0xFF00FF00, 0xFFFFFF00, 0xFF00FFFF,
                0xFFFFFFFF]);

        let feetToMeters = 1/3.28084
        Terrier.CLOUD_COLORS_NOT_GREY = Terrier.createColorMap(
            [0.0*feetToMeters,500.0*feetToMeters,
            500.0*feetToMeters,900.0*feetToMeters,
            900.0*feetToMeters,1000.0*feetToMeters,
            1000.0*feetToMeters,3000.0*feetToMeters,
            3000.0*feetToMeters,4000.0*feetToMeters,
            4000.0*feetToMeters,
            5000.0*feetToMeters,6000.0*feetToMeters,
            6000.0*feetToMeters
            ],
            [0xff800000,0xffE63222,
            0xffFFFF55,0xffFFFF55,
            0xffED702E,0xffED702E,
            0xff01007B,0xff01007B,
            0xff75FB4C,0xff75FB4C,
            0xff75FB4C,
            0xff2A6318,0xff2A6318,
            0x00000000
            ])
        let statMileToMeters = 1609.34
        Terrier.VISIBILITY_COLORS_NOT_GREY = Terrier.createColorMap(
            [0*statMileToMeters,1*statMileToMeters,
            1*statMileToMeters,3*statMileToMeters,
            3*statMileToMeters,5*statMileToMeters,
            5*statMileToMeters,
            7*statMileToMeters,
            8*statMileToMeters,9*statMileToMeters,
            9*statMileToMeters
            ],
            [0xff800000,0xff800000,
            0xffE63222,0xffE63222,
            0xffFFFF55,0xffFFFF55,
            0xff75FB4C,
            0xff3A8323,
            0xff113208,0xff113208,
            0x00000000
            ])
        Terrier.PERCENT_COLORS_NOT_GREY = Terrier.createColorMap(
            [0.0,100.0],
            [0x00666666,0xff666666]
        )
        let hgToPa = 3386.39
        Terrier.PRESSURE_COLORS_NOT_GREY = Terrier.createColorMap(
            [29.9*hgToPa,30.4*hgToPa],
            [0x00666666,0xff666666]
        )
    }

    /**
     * We use a TrrShaderColorMap object to set and query colormaps, but
     * you don't have to create those directly.  Instead, use this convenience
     * method to do it.  Pass in your array of data values and corresponding
     * colors.  Those need to both be the same length.
     * @param {Array.float} values An array of data values to use in the color map.
     * These are actual data values in the proper units.  That may be Kelvin for temperature,
     * and so forth.  These map directly to the colors array for a given value.
     * @param {Array.int} colors An array of numbers corresponding to RGBA colors.
     * We like to use hex definitions of the form 0xAARRGGBB where A is alpha, R is red,
     * G is green and B is blue.  These are standard in CSS and you can find a good
     * converter online to map from your favorite color system to hex values.
     * @returns TrrShaderColorMap
     */
    createColorMap(values, colors) {
        if (values.length != colors.length) {
            console.log("createColorMap: Values and colors array must be same length.")
            return
        }
        return new globalThis.Module.TrrShaderColorMap(0, false, values, colors)
    }

    // Internal setup logic
    setupModule(initFunc, readyFunc) {
        console.log("setupModule() called.")
        Terrier.initFunc = initFunc
        Terrier.readyFunc = readyFunc

        // Already initialized the module, so just call them back
        if ('Module' in globalThis) {
            if ('_initMap' in globalThis) {
                // This is the normal case where the Module is properly set up
                if (initFunc !== undefined) {
                    Terrier.initFunc()
                }
                if (readyFunc !== undefined) {
                    // Let things settle a beat and then let the dev get set up
                    setTimeout( () => {Terrier.readyFunc(Terrier.ovl) }, 0)
                }
            } else {
                // This happens if they somehow do two start-map actions in a row
                // The right thing will happen here which is the new initFunc and readyFunc will be called
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
                    Terrier.initFunc()
                }
            },
            onOverlayInitialized: function() {
                Terrier.isReady = true
                if (readyFunc !== undefined) {
                    // Let things settle a beat and then let the dev get set up
                    setTimeout( () => {Terrier.readyFunc(Terrier.ovl) }, 0)
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

    /**
     * Given a variable, usually returned from a call to Terrier,
     * we will try to figure out what colormap might work for it.
     * You can always substitute your own, these are just default.
     * 
     * @param {Dictionary} variable 
     * @returns A trrColorMap you can pass to the Layer creation.
     */
    colorMapForVariable(variable) {
        switch (variable.dataType.toLowerCase()) {
            case "reflectivity":
                return Terrier.RADAR_COLORS_NOT_GREY;
            case "temperature":
                return Terrier.TEMP_COLORS_NOT_GREY;
            case "wind_uv":
            case "velocity":
                return Terrier.WIND_COLORS_NOT_GREY;
            case "probability":
                if (variable.name == "probability_severe_hail") {
                    return Terrier.PROB_SEVERE_HAIL_COLORS;
                }
            case "percentage":
                return Terrier.PERCENT_COLORS_NOT_GREY;
            case "visibility":
                return Terrier.VISIBILITY_COLORS_NOT_GREY;
            case "cloudceiling":
                return Terrier.CLOUD_COLORS_NOT_GREY;
            case "preciptype":
                return Terrier.PRECIP_FLAG_COLORS;
            case "severehailindex":
                return Terrier.SEVERE_HAIL_INDEX_COLORS;
            case "size":
                return Terrier.HAIL_SIZE_COLORS;
            case "none":
                if (variable.name.includes("hail_swath")) {
                    return Terrier.HAIL_SIZE_COLORS;
                }
                // The way dataType is set up isn't quite right.
                if (variable.name.includes("qpe_ffg")) {
                    return Terrier.QPE_FFG_RATIO_COLORS;
                }
            default:
                return Terrier.INDEXPLACE_COLORS_NOT_GREY
                break;
        }
        // Don't know what it is.  Obviously not the best.
        return null
    }

    /**
     * Boxer stacks know what is in them and we can ask for that information to figure
     * out which layers to display and what levels they may have.  We don't get that
     * information by default, but if you ask for it, Terrier will fetch it and
     * call you back with the results.  
     * 
     * The return data is JSON and looks like this:
     * ```
     * {"<src>" :  
     *    {"<region>":  
     *     {"<products>": [],  
     *      "<levels>": [],  
     *      "temporalType": "observed", "forecast", "both",  
     *      "dataType": "wind_uv", "wind_speed", "wind_speed_gust", "temperature",  
     *                  "radar", "precip_rate", "precip_type", "cloud_cover", "cloud_ceiling",  
     *                  "pressure", "visibility"}}}
     * ```
     *
     * Using this is by no means required.  It's useful if you have a lot of flexible
     * data and obviously we like it for monitoring what's going in a stack.  But
     * if you already know your variable names (e.g. temperature) then you can
     * just use those.
     * 
     * @param {function} fetchFunc After the contents have been fetched from Boxer,
     * Terrier will call this function back with those JSON results.
     * @param {function} failFunc If the contents fetch fails for some reason,
     * this function will be called back with that information.
     */
    fetchStackContents(fetchFunc, failFunc) {
        // TODO: We'll move this into the stack at some point
        var endpoint = ''
        if (this.stackName.includes('localhost')) {
            endpoint = "http://" + this.stackName
        } else {
            if (this.stackName.includes('http')) {
                endpoint = this.stackName
            } else {
                endpoint = "https://"+this.stackName+".api.wetdogweather.com"
            }
        }

        fetch(endpoint + "/manifest/v2/getvisualvarkeys")
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
    /**
     * Search through the stack contents and return all the various levels for a given
     * variable.  For example you might pass in 'temperature' and get back ['sfc','10m','152m'].
     * The actual list depends on your stack and data and you need to have already called
     * fetchStackContents() at least once.
     * @param {string} dataType Data type to get the levels for.
     * @returns {Array.string} Levels supported for the data type
     */
    variableLevelsForStack(dataType) {
        var levels = new Set([])
        if (!this.stackContents) {
            return Array.from(levels)
        }
        this.stackContents.sources.forEach( source =>
            source.regions.forEach( region =>
                region.products.forEach( product =>
                    product.variables.forEach( variable => {
                            if (variable.dataType.toLowerCase() == dataType) {
                                variable.levels.forEach( (level) => {
                                    levels.add(level)
                                })
                            }
                        }
                    )
                )
            )            
         )

        return Array.from(levels)
    }

    /**
     * The unique variable types for a given stack.  This is essentially all
     * the layerNames you might pass in when starting a new layer.
     * @returns {Dict} All the valid layer names for a stack with values that describe the variable.
     */
    variablesForStack() {
        var variables = {}
        if (!this.stackContents) {
            return Array.from(variables)
        }
        this.stackContents.sources.forEach( source =>
            source.regions.forEach( region =>
                region.products.forEach( product =>
                    product.variables.forEach( variable =>
                        variables[variable.name] = variable
                    )
                )
            )            
         )

        return variables
    }

    /**
     * Returns a list of region names available in the stack.
     * These can be used to filter variables later.
     */
    regionsForStack() {
        var regions = new Set([])
        if (!this.stackContents) {
            return Array.from(regions)
        }
        this.stackContents.sources.forEach( source =>
            source.regions.forEach( region =>
                regions.add(region.name)
            )            
         )        
         return Array.from(regions)
    }

    /**
     * Returns a list of sources available in the stack.  These can be
     * used to filter in other query functions.
     */
    sourcesForStack() {
        var sources = new Set([])
        if (!this.stackContents) {
            return Array.from(sources)
        }
        this.stackContents.sources.forEach( source =>
            sources.add(source.name)
         )        
         return Array.from(sources)
    }

    /**
     * Construct a list of sources that match certain criteria.  These can be source,
     * region, or product which can take a list of string or one or no strings to match.
     * The variable entry must be set as this is the variable you'll match to from 
     * all available sources.
     * level can be set, as can interval, but only to one string.  If none is provided
     * and the source has multiple of those, we'll just pick the first.
     * 
     * The simplest example is to pass in {variable: 'temperature', level: '2m'} and you'll
     * get a list of 2m temperature for all sources.
     * 
     * You can also just pass in a string for params and we'll turn that into a proper search.
     *  
     * @param {Dictionary} params A dictionary optionally containing match parameters, but must have 'variable'
     * @returns A list of disambiguated sources to add to a display.
     */
    sourcesForVariable(params) {        
        var sources = new Array()
        if (!this.stackContents) {
            return sources
        }
        if (typeof params == "string") {
            params = {'variable': params}
        }
        if (!('variable' in params)) {
            console.log("Must at least match to variable name in sourcesForVariable.")
            return
        }
        var variableMatch = params['variable']
        if (typeof variableMatch != "string") {
            console.log("Must specify variable as single string.")
            return
        }
        var sourceMatch = 'source' in params ? params['source'] : null
        if (typeof sourceMatch == "string") {
            sourceMatch = [sourceMatch]
        }
        var regionMatch = 'region' in params ? params['region'] : null
        if (typeof regionMatch == "string") {
            regionMatch = [regionMatch]
        }
        var productMatch = 'product' in params ? params['product'] : null
        if (typeof productMatch == "string") {
            productMatch = [productMatch]
        }
        var levelMatch = 'level' in params ? params['level'] : null
        var intervalMatch = 'interval' in params ? params['interval'] : null
        this.stackContents.sources.forEach( source => {
            var sourceMatched = true
            if (sourceMatch) {  
                sourceMatched = false
                sourceMatch.forEach( match => {
                    if (match.toLowerCase() == source.name.toLowerCase()) {
                        sourceMatched = true
                    }
                })              
            }

            if (sourceMatched) {
                source.regions.forEach( region => {
                    var regionMatched = true
                    if (regionMatch) {  
                        regionMatched = false
                        regionMatch.forEach( match => {
                            if (match.toLowerCase() == region.name.toLowerCase()) {
                                regionMatched = true
                            }
                        })              
                    }
        
                    if (regionMatched) {
                        for (const product of region.products) {
                            var productMatched = true
                            if (productMatch) {  
                                productMatched = false
                                productMatch.forEach( match => {
                                    if (match.toLowerCase() == product.name.toLowerCase()) {
                                        productMatched = true
                                    }
                                })              
                            }    

                            if (productMatched) {
                                var foundVariable = false
                                product.variables.forEach( variable => {
                                    var variableMatched = true
                                    if (variableMatch) {  
                                        variableMatched = false
                                        if (variableMatch.toLowerCase() == variable.name.toLowerCase()) {
                                            variableMatched = true
                                        }
                                    }    
                                    if (variableMatched) {
                                        var levelMatched = true
                                        var levelName = variable.levels.length > 0 ? variable.levels[0] : "none"
                                        if (levelMatch) {
                                            levelMatched = false
                                            variable.levels.forEach(level => {
                                                if (levelMatch.toLowerCase() == level.toLowerCase()) {
                                                    levelMatched = true
                                                    levelName = levelMatch.toLowerCase()
                                                }
                                            })
                                        }
                                        var intervalMatched = true
                                        var intervalName = variable.intervals.length > 0 ? variable.intervals[0] : "none"
                                        if (intervalMatch) {
                                            intervalMatched = false
                                            variable.intervals.forEach(interval => {
                                                if (intervalMatch.toLowerCase() == interval.toLowerCase()) {
                                                    intervalMatched = true
                                                    intervalName = intervalMatch.toLowerCase()
                                                }
                                            })
                                        }
                                        if (levelMatched && intervalMatched) {
                                            foundVariable = true
                                            sources.push({
                                                source: source.name,
                                                region: region.name,
                                                product: product.name,
                                                name: variable.name,
                                                variable: variable.name,
                                                level: levelName,
                                                interval: intervalName,
                                                temporalType: variable.temporalType,
                                                dataType: variable.dataType,
                                                depth: variable.bits,
                                                isGlobal: region.isglobal,
                                                hasMissingValues: variable.hasEmptyVals,
                                                importanceScale: 1.0,
                                                drawOrder: source.order
                                            })
                                        }
                                    }
                                })

                                if (foundVariable) {
                                    break
                                }
                            }
                        }
                    }
                })            
            }
        })

        return sources
    }

    /**
     * Pass in a generic name like 'windUV' or 'temperature' and we'll pass back
     * a direct list of sources to display.  These are the more generic names we
     * used to use before we switched over to a list of sources from the stack.
     * @param {string} layerName 
     */
    sourcesFromLayerName(layerName,level) {
        var params = {}
        if (level !== undefined) {
            params['level'] = level
        }
        switch (layerName) {
            case "wind_uv":
            case "windUV":
                params['variable'] = 'wind_uv'
                break;
            case "temperature":
                params['variable'] = 'temperature'
                break;
            case "radar":
                break;
            case "visual":
                // TODO: Fix this one
                break;
            default:
                params['variable'] = layerName
                break;
        }
        return this.sourcesForVariable(params)
    }
    
    /**
     * Normally you pass in the stack name on startup and then use just that
     * stack.  This will let you point to another stack.  As a developer, you
     * probably won't use this, but we do use it in our testing.
     * 
     * @param {string} stackName Name of the stack to use.  This is provided
     * to you as a developer.  Your company will typically have one production
     * and one development stack.
     * @param {function(TerrierOverlay): void} readyFunc Once we've communicated with the stack, Terrier
     * calls this function back with the TerrierOverlay object.  You can use that start
     * and stop layers.
     * @param {function(): void} failedFunc If the stack can't be reached, for whatever
     * reason, we call this function with no arguments.
     */
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

    /**
     * If you're using Leaflet as your base map package, this is the method
     * to call to kick off Terrier.  The system does a lot on initialization,
     * including load its WebAssembly and start up WebGL.  Call this when
     * you're ready to go and have the canvas layer from Leaflet.
     * 
     * @param {string} stackName Name of the Boxer stack you're communicating with.
     * You'll typically have one production and one development stack as an enterprise
     * user.
     * @param {Canvas} canvasLayer The Canvas layer to attach to within Leaflet.
     * See the Leaflet example for details on this.
     * @param {function(TerrierOverlay): void} readyFunc When Terrier is properly initialized it will
     * call this function back with the TerrierOverlay you can use to start new
     * layer displays.
     */
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
                        if (!canvasLayer._canvas || !_initMap) {
                            console.log("Failed to start on Leaflet canvas.  Skipping.")
                            return
                        }
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

    /**
     * If you're using MapLibre as your base map package, this is the method
     * to call to kick off Terrier.  The system does a lot on initialization,
     * including load its WebAssembly.  
     * 
     * MapLibreGL (and MapboxGL) integration is very smooth since
     * both the base toolkit and Terrier are using WebGL.  If you have a choice,
     * this is the better integration to use.
     * 
     * @param {string} stackName Name of the Boxer stack you're communicating with.
     * You'll typically have one production and one development stack as an enterprise
     * user.
     * @param {maplibreMap} maplibreMap The main MapLibre object.  See the MapLibre
     * example for details.
     * @param {function(TerrierOverlay): void} readyFunc When Terrier is properly initialized it will
     * call this function back with the TerrierOverlay you can use to start new
     * layer displays.
     */
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

    /**
     * If you're using ArcGIS Maps SDK for JavaScript as your base map package, this is the method
     * to call to kick off Terrier.  The system does a lot on initialization,
     * including load its WebAssembly.  
     * 
     * ArcGIS Maps SDK integration is very smooth since
     * both the base toolkit and Terrier are using WebGL.
     * 
     * @param {string} stackName Name of the Boxer stack you're communicating with.
     * You'll typically have one production and one development stack as an enterprise
     * user.
     * @param {Map} arcgisMAp The main Map object.  See the ArcGISMaps example
     * for details.
     * @param {function(TerrierOverlay): void} readyFunc When Terrier is properly initialized it will
     * call this function back with the TerrierOverlay you can use to start new
     * layer displays.
     */
    startArcGIS(stackName, arcGISMapView, readyFunc) {
        this.stackName = stackName
        if (arcGISMapView == undefined) {
            console.log('Need to pass the ArcGIS map into TerrierInit.  Not starting.')
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
                _initArcGIS(arcGISMapView)
            }, readyFunc)
            this.loadLibrary()
        },
        () => {
            console.log("Failed to fetch stack contents.  Terrier will not start.")
        })
    }


    /**
     * If you want Terrier completely stopped, this is what you can call.
     * If you want to shutdown a layer, just call the corresponding method
     * on the TerrierOverlay.
     */
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

/**
 * This is the main access to the Terrier module.  Once you've loaded the terrier.js
 * file, just access Terrier through this.
 */
export default Terrier;
