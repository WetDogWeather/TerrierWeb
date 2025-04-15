### Integrating Terrier for Web into OpenLayers

This is a minimal example for integrating Terrier's data display with OpenLayers.  Here's how you create the example from scratch.

## Getting Started

Install OpenLayers first, we recommend the [quick start](https://openlayers.org/doc/quickstart.html).  In fact, that's what we used to create our example.

You'll also need the Terrier library [distribution](terrier-distribution.md) which is described there.

## OpenLayers Files

In addition to the Terrier files, you'll need a specialized OpenLayers Layer class.

        OLRealtimeCanvasLayer.js

The Realtime Canvas layer is an extremely simple OL layer that acts as a bridge between Terrier and a normal OL layer that emits a canvas.

We make extensive use of WebGL, so Terrier is essentially drawing into WebGL on its own and translating the view logic from OL to something it understands.

## Example Files

The index.html is largely unchanged from the OL example.  It will set up a simple page and then call into main.js where the action is.

The main.js file does the real work and is well documented itself, but let's look at some pieces.

At the top we have the standard OpenLayers pieces to import:

        import './style.css';
        import {Map, View} from 'ol';
        import TileLayer from 'ol/layer/Tile';
        import OSM from 'ol/source/OSM';

Then we'll import Terrier and the Realtime Canvas Layer

        import Terrier from "./terrier.js"
        import olRealtimeCanvasLayer from "./OLRealtimeCanvasLayer.js"

Next we create that Canvas Layer, which acts as a shim to get Terrier into OpenLayers.

        // Create the realtime canvas layer to interface to Terrier
        var canvasLayer = olRealtimeCanvasLayer({})

Next up is the map, which is pretty simple.

        // The OpenLayers map with a simple OSM layer and our canvas layer on top
        const map = new Map({
        target: 'map',
        layers: [
            new TileLayer({
            source: new OSM()
            }),
            canvasLayer
        ],
        view: new View({
            center: [0, 0],
            zoom: 2
        })
        });

We want our weather layer on top, so we set the zIndex explicitly.  There may be better ways to do this.

        // Ordering doesn't necessarily imply... order.  So we set that explicitly.
        canvasLayer.setZIndex(99)

Lastly, we kick of Terrier with OpenLayers.  

We need to pass in the stack we're using.  You'll get your own stack if you're one of our customers, but you're welcome to use 'dev' to get started.  Don't deploy with that, we mess with dev at our convenience.

You'll also pass in a working OpenLayers map, the CanvasLayer you created earlier and a callback function that displays whatever weather you're interested in.

        // Call into Terrier with our interface layer and OpenLayers map
        // Terrier will get set up and then call us back for the rest
        Terrier.startOpenLayers("dev", map, canvasLayer, (ovl) => {
            // Standard sources for north america
            let normalSources = ['rtma', 'gfs', 'hrrr']

            // Restrict to continental US
            let region = ['conus']

            // Temperature for just the US
            let sources = Terrier.sourcesForVariable({source: normalSources, region: region, variable: 'temperature', level: '2m'})
            // let sources = Terrier.sourcesForVariable({source: 'mrms', product: 'mcr', variable: 'reflectivity'})

            // Colormaps can be applied separately (and changed later)
            let colorMap = Terrier.colorMapForVariable(sources[0]);

            // For this source, let's look at yesterday through tomorrow
            let cadence = [-1*60*60*24,1*60*60*24,64]

            // Turn on temperature as a layer
            let tempLayer = ovl.startLayer('myLayer', {
                colorMap: colorMap,
                interpMode: 'linear',
                sources: sources,
                opacity: 0.5,
                importFactor: 8.0,
                renderScale: 4.0,
                cadence: cadence
            })

            ovl.timePlay({period: 10.0})
        })

Once you have a working TerrierOverlay (ovl) you can call all the various Terrier methods you find in these examples.  They work exactly the same between the maps we support.
