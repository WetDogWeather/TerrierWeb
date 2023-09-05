import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { none } from 'ol/centerconstraint';

import WMTSCapabilities from 'ol/format/WMTSCapabilities.js';
import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS.js';

// The core of this example is from:
//  https://openlayers.org/doc/quickstart.html

const tileServer = "https://truwx.api.wetdogweather.com/"

// This is the important bit, the getCapabilities call
const capURL = tileServer + "geoservice?VERSION=1.1.0&REQUEST=GetCapabilities&SERVICE=WMTS"

// These are used below to animate through the time dimension
var timeDim
var curTimeIdx = 0

// Just an inline function that kicks off the request and then
//  brings up a map with our tile overlay when it's done
fetch(capURL)
  .then(function (response) {
    return response.text();
  })
  .then(function (text) {
    text = text.replaceAll('ows:Identification','ows:Identifier')
    // This will parse our capabilities return (e.g. getCapabilities)
    // It's OpenLayers functionality and appears to be one of the better implementations
    let parser = new WMTSCapabilities();
    var capb = parser.read(text);

    // Rummage through the capabilities looking for a layer source with the matching name
    var selLayer = optionsFromCapabilities(capb, {
      'layer': 'hrrr-conus-sfcf-temperature-2m-16-projected'
    })

    if (typeof selLayer == 'undefined') {
      console.log("Didn't find the layer we wanted.  Giving up.")
      return
    }

    // We need the full time dimension entry to iterate over those
    timeDim = capb.Contents.Layer.find((el) => el.Identifier == selLayer.layer).Dimension[0]
    
    // Form an OL layer around the source
    var wmtsLayer = new WMTS(selLayer)
    wmtsLayer.opaque = false

    // Just creates a map with OpenStreetMap tiles and the layer we found
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

    // Let's update the dimension every so often for a simple animation
    setInterval(()=> {
      let newDim = timeDim.Value[curTimeIdx]
      console.log("Switching time to " + newDim)
      wmtsLayer.updateDimensions({'time': newDim});
      curTimeIdx = curTimeIdx + 1
      if (curTimeIdx >= timeDim.Value.length) {
        curTimeIdx = 0
      }
    }, 10000)

  });
