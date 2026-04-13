import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import { none } from 'ol/centerconstraint.js';
import WMTSData from './WMTSData.js';
import WMSData from './WMSData.js'
import {Image as ImageLayer } from 'ol/layer.js'

const osmTileLayer = new TileLayer({source: new OSM()});
let layers = [osmTileLayer]

// Set this to WMS or WMTS to trigger the different examples
// let service='WMS'
let service='WMTS'

// Construct the base URL for API queries
// Note: Our dev stack isn't provisioned for performant WMS queries.  Use your own, which is.
const stackName = "dev"
const tileServer = "https://" + stackName + ".api.wetdogweather.com/"
// const tileServer = "http://ec2-35-94-175-139.us-west-2.compute.amazonaws.com:9009/"

// This is the important bit, the getCapabilities call
const capURL = tileServer + "geoservice?VERSION=1.1.0&REQUEST=GetCapabilities&SERVICE=" + service

if (service == 'WMS') {
  // Create a layer from WMS data
  let data = new WMSData(capURL);
  let dataLayer = await data.getLayer('rtma-conus-wexp-wind_uv-16-epsg_4326');
  let bbox = data.getBBox();

  const imgLayer = new ImageLayer({
    source: dataLayer,
    extent: bbox
    
  });
  layers.push(imgLayer);
} else {
  // Create a layer from WMTS data
  let data = new WMTSData(capURL)
  let dataLayer = await data.getLayer('mrms-conus-mbr-reflectivity-8-epsg_3857',
                  {opacity: 0.5,})
  dataLayer.updateDimensions({'style': 'mp_tab20b'});

  const dataTileLayer =  new TileLayer({opacity: 0.5, source: dataLayer});
  layers.push(dataTileLayer);
  dataLayer.curTimeDim = 0

  setInterval(()=> {
    // Iterate through the list of times available
    // dataLayer.curTimeDim = dataLayer.timeDim.Value.length-1
    setInterval(()=> {
      if (dataLayer.curTimeDim+1 >= dataLayer.timeDim.Value.length) {
        // dataLayer.curTimeDim = 0
      } else {
        dataLayer.curTimeDim = dataLayer.curTimeDim + 1
        let newDim = dataLayer.timeDim.Value[dataLayer.curTimeDim]
        console.log("Switching time to " + newDim)
        dataLayer.updateDimensions({'TIME': newDim});
      }
    }, 1)
  }, 5000)
}

const map = new Map({
  target: 'map',
  layers: layers,
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});




