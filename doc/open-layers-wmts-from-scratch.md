### OpenLayers Example From Scratch

This example uses OpenLayers.  Why?  It turns out OpenLayers has a decent WMTS implemention where few other web mapping toolkits do.  But not to worry, it's actually pretty easy to use OpenLayers and you can discard it when you've incorporated the WMTS endpoint into your own apps.

Let's start with the basics.  Go run the [OpenLayers quick start](https://openlayers.org/doc/quickstart.html).  Make sure you see the map and then continue on here.

Now that's done, we'll just add to the main.js file and discuss what each piece does.

For the OpenLayers imports we'll want at least these.  The example should load some of these, but make sure you've got them all.

    import {Map, View} from 'ol';
    import TileLayer from 'ol/layer/Tile';
    import OSM from 'ol/source/OSM';
    import {Image as ImageLayer } from 'ol/layer.js'

In addition to those standard pieces, we have some utility JS to aid in parsing the Capabilities.

    import WMTSData from './WMTSData.js';
    import WMSData from './WMSData.js'

Let's start with the base layer.  This will be the OSM layer we put underneath everything.

    const osmTileLayer = new TileLayer({source: new OSM()});
    let layers = [osmTileLayer]

Then we decide if we're doing WMS or WMTS.  It's displaying the same data in different ways, so we have to choose.

    let service='WMS'
    // let service='WMTS'

Now we construct the capabilities URL.  This will tell us what's in the stack.  If you have  your own stack, substitute that in here.

    const stackName = "dev"
    const tileServer = "https://" + stackName + ".api.wetdogweather.com/"
    const capURL = tileServer + "geoservice?VERSION=1.1.0&REQUEST=GetCapabilities&SERVICE=" + service

Next up is the WMS fetch and display logic.  We create a WMSData object to tease out the layers in a useful way and then find the appropriate layer when the capabilities have returned.  We display it with an available style.

    if (service == 'WMS') {
      // Create a layer from WMS data
      let data = new WMSData(capURL);
      let dataLayer = await data.getLayer('hrrr-conus-sfcf-temperature-2m-16-projected', 'mp_jet');
      let bbox = data.getBBox();

      const imgLayer = new ImageLayer({
        source: dataLayer,
        extent: bbox
        
      });
      layers.push(imgLayer);
    }

If we're doing the WMTS example, this is the relevant code.  Same idea, we have a WMTSData object tease the specifics out of the capabilities return.

    else {
      // Create a layer from WMTS data
      let data = new WMTSData(capURL);
      let dataLayer = await data.getLayer('hrrr-conus-sfcf-temperature-2m-16-projected')
      
      const dataTileLayer =  new TileLayer({opacity: 1.0, source: dataLayer});
      layers.push(dataTileLayer);
    }

Lastly, we stand up the map with the layers we've defined.

    const map = new Map({
      target: 'map',
      layers: layers,
      view: new View({
        center: [0, 0],
        zoom: 2
      })
    });

If your WMTS layer has time available it will expose that as a dimension and you can iterate through the relevant 

Speaking of time, we want to iterate over time slices, so we have to rummage through the original capabilities return to get the list of available times.

    timeDim = capb.Contents.Layer.find((el) => el.Identifier == selLayer.layer).Dimension[0]


Lastly, we might want to mess with the time dimension of the layer source every couple of seconds.  This gives us a slow animation of the available time slices.  The curTimeDim and timeDim fields are something we stuck on the WMTS.

    setInterval(()=> {
      let newDim = dataLayer.timeDim.Value[dataLayer.curTimeDim]
      console.log("Switching time to " + newDim)
      dataLayer.updateDimensions({'time': newDim});
      dataLayer.curTimeDim = dataLayer.curTimeDim + 1
      if (dataLayer.curTimeDim >= dataLayer.timeDim.Value.length) {
        dataLayer.curTimeDim = 0
      }
    }, 2000)
    
Ideally you'll seem something like this.

![image](https://user-images.githubusercontent.com/101820560/262808345-29930c15-5bd8-4165-b878-4881902df1b7.png)

There's some helper code in WMTSData.js and WMSData.js.  If you're going to work with OpenLayers it may be worth a look.  If you're just testing out the WMS and WTMS capabilities, then no need.

That's basically it.  All these web mapping toolkits are designed to display a TMS layer pretty simply.  The complexity here is in the time dimension and poking around to figure out the layer names.  In fact, a lot of toolkits don't even explicitly support WMTS and leave it up to the developer to just find the appropriate URL.

The source code in [main.js](main.js) contains much of this information in the comments as well.
