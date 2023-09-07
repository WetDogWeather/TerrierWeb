### OpenLayers Example From Scratch

This example uses OpenLayers.  Why?  It turns out OpenLayers has a decent WMTS implemention where few other web mapping toolkits do.  But not to worry, it's actually pretty easy to use OpenLayers and you can discard it when you've incorporated the WMTS endpoint into your own apps.

Let's start with the basics.  Go run the [OpenLayers quick start](https://openlayers.org/doc/quickstart.html).  Make sure you see the map and then continue on here.

Now that's done, we'll just add to the main.js file and discuss what each piece does.

First up, we need some additional OpenLayers imports.

    import WMTSCapabilities from 'ol/format/WMTSCapabilities.js';
    import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS.js';

Then some URL pieces we'll use later.  Adjust the stackName to match your own.  This one is pointing at our generic development stack.

    const stackName = "dev"
    const tileServer = "https://" + stackName + ".api.wetdogweather.com/"
    const tileServer = "https://truwx.api.wetdogweather.com/"
    const capURL = tileServer + "geoservice?VERSION=1.1.0&REQUEST=GetCapabilities&SERVICE=WMTS"

And a bit of housekeeping that'll make sense later.

    var timeDim
    var curTimeIdx = 0

Next we'll get rid of the example code OL provided.  This is the "const map" bit.  Just delete that.

And now we get to the good part.  We define an inline function that requests the GetCapabilities and parses it.  The parser is provided by OL, hence the reason we're using that toolkit.

    fetch(capURL)
      .then(function (response) {
        return response.text();
      })
      .then(function (text) {
        let parser = new WMTSCapabilities();
        var capb = parser.read(text);

The Capabilities return is XML and you're welcome to rummage through it yourself.  But we'll let OL do it for us.

    var selLayer = optionsFromCapabilities(capb, {
      'layer': 'hrrr-conus-sfcf-temperature-2m-16-projected'
    })

    if (typeof selLayer == 'undefined') {
      console.log("Didn't find the layer we wanted.  Giving up.")
      return
    }

Now we should have our selected layer.  If you want to look at all the layers, just open up capb in the Javascript console.  All the layers the system knows about are listed, with their various styles and time slices.

Speaking of time, we want to iterate over time slices, so we have to rummage through the original capabilities return to get the list of available times.

    timeDim = capb.Contents.Layer.find((el) => el.Identifier == selLayer.layer).Dimension[0]

Now back to more basic stuff.  We need to define a new layer for OpenLayers, but the capabilities doesn't contain layers, per se, it contains layer sources.

    var wmtsLayer = new WMTS(selLayer)
    wmtsLayer.opaque = false

Do we need to set that to opaque?  Shouldn't, but it seems to help.

And now let's create the map and the overlay.  This is standard OpenLayers stuff.

    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        new TileLayer({
          opacity: 1,
          source: wmtsLayer,
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2
      })
    });

Lastly, we want to mess with the time dimension of the layer source every couple of seconds.  This gives us a slow animation of the available time slices.

    setInterval(()=> {
      let newDim = timeDim.Value[curTimeIdx]
      console.log("Switching time to " + newDim)
      wmtsLayer.updateDimensions({'time': newDim});
      curTimeIdx = curTimeIdx + 1
      if (curTimeIdx >= timeDim.Value.length) {
        curTimeIdx = 0
      }
    }, 2000)

And finally, we have to close out the function.

    });
    
Ideally you'll seem something like this.

![image](https://user-images.githubusercontent.com/101820560/262808345-29930c15-5bd8-4165-b878-4881902df1b7.png)

That's basically it.  All these web mapping toolkits are designed to display a TMS layer pretty simply.  The complexity here is in the time dimension and poking around to figure out the layer names.  In fact, a lot of toolkits don't even explicitly support WMTS and leave it up to the developer to just find the appropriate URL.

The source code in [main.js](main.js) contains much of this information in the comments as well.
