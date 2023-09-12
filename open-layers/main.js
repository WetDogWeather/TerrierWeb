import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { none } from 'ol/centerconstraint';
import WMTSData from './WMTSData.js';
import WMSData from './WMSData.js'
import {Image as ImageLayer } from 'ol/layer.js'

const osmTileLayer = new TileLayer({source: new OSM()});
let layers = [osmTileLayer]

// Set this to WMS or WMTS to trigger the different examples
let service='WMS'
// let service='WMTS'

// Construct the base URL for API queries
const stackName = "truwx-dev"
const tileServer = "https://" + stackName + ".api.wetdogweather.com/"

// This is the important bit, the getCapabilities call
const capURL = tileServer + "geoservice?VERSION=1.1.0&REQUEST=GetCapabilities&SERVICE=" + service

if (service == 'WMS') {
  // Create a layer from WMS data
  let data = new WMSData(capURL);
  let dataLayer = await data.getLayer('truwx-ny-none-temperature-2m-16-projected', 'mp_jet');
  let bbox = data.getBBox();

  const imgLayer = new ImageLayer({
    source: dataLayer,
    extent: bbox
    
  });
  layers.push(imgLayer);
} else {
  // Create a layer from WMTS data
  let data = new WMTSData(capURL);
  let dataLayer = await data.getLayer('truwx-ny-none-temperature-2m-16-projected')
  
  const dataTileLayer =  new TileLayer({opacity: 1.0, source: dataLayer});
  layers.push(dataTileLayer);
}

const map = new Map({
  target: 'map',
  layers: layers,
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});




