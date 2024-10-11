import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import BaseLayerViewGL2D from "@arcgis/core/views/2d/layers/BaseLayerViewGL2D";
globalThis.BaseLayerViewGL2D  = BaseLayerViewGL2D
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
globalThis.GraphicsLayer = GraphicsLayer
import * as mat4 from "gl-matrix/mat4"
import * as vec3 from "gl-matrix/vec3"
import * as vec4 from "gl-matrix/vec4"
globalThis.mat4 = mat4
globalThis.vec3 = vec3
globalThis.vec4 = vec4
import "./style.css";
import Terrier from "./terrier.js"

const map = new Map({
  basemap: "streets-night-vector",
});

const view = new MapView({
  container: "viewDiv",
  map: map,
  zoom: 8,
  center: [0.1276, 51.5],
});

Terrier.startArcGIS("dev", view, (ovl) => {
  let tempLayer = ovl.startLayer('temperature', {
      // colorMap: {}
      interpMode: 'linear',
      opacity: 0.5,
      // Four hours worth of past radar, maximum of 64 frames
      cadence: [-4*60*60,0,64]
  })

  // setTimeout(() => {
  //   ovl.stopLayer(tempLayer)

  //   setTimeout(() => {
  //     let tempLayer = ovl.startLayer('temperature', {
  //         // colorMap: {}
  //         interpMode: 'linear',
  //         opacity: 0.5,
  //         // Four hours worth of past radar, maximum of 64 frames
  //         cadence: [-4*60*60,0,64]
  //       })
  //     }, 5000)
  // }, 10000)


  // Turn this on to animate over time
  ovl.timePlay({period: 5.0})    
})
