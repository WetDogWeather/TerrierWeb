import Layer from 'ol/layer/Layer.js';
import {toLonLat} from 'ol/proj';

class OLRealtimeCanvasLayer extends Layer {
    constructor(options) {
      super(options);  

      var canvas = document.createElement("canvas");
      canvas.className  = "myClass";
      canvas.id = "myId";
      this._canvas = canvas;
      canvas.style.visibility = "visible"
    }
  
    getSourceState() {
      return 'ready';
    }

    delegate(newDelegate) {
      this._delegate = newDelegate;
    }

    render(frameState) {
      if (!frameState) {
        if (!this.lastFrameState) {
          return;
        }
        frameState = this.lastFrameState;
      } else {
        this.lastFrameState = frameState;
      }
      // Note: Assuming we're in spherical mercator
      let lonlat = toLonLat(frameState.viewState.center);
      frameState.centerLonLat = lonlat;

      this._canvas.width = frameState.size[0];
      this._canvas.height = frameState.size[1];
      this._canvas.style.position = "absolute";

      if (this._delegate) {
        this._delegate.onRender(frameState);
      }
      return this._canvas;
    }
}
  
const olRealtimeCanvasLayer = function (args) {
    return new OLRealtimeCanvasLayer(args);
};

export default olRealtimeCanvasLayer;
