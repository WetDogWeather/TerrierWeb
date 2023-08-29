
/*
  Generic  Canvas Layer for leaflet 0.7 and 1.0-rc, 1.2, 1.3
  copyright Stanislav Sumbera,  2016-2018, sumbera.com , license MIT
  originally created and motivated by L.CanvasOverlay  available here: https://gist.github.com/Sumbera/11114288  
  
  also thanks to contributors: heyyeyheman,andern,nikiv3, anyoneelse ?
  enjoy !
*/

// -- L.DomUtil.setTransform from leaflet 1.0.0 to work on 0.0.7
//------------------------------------------------------------------------------
L.DomUtil.setTransform = L.DomUtil.setTransform || function (el, offset, scale) {
    var pos = offset || new L.Point(0, 0);

    el.style[L.DomUtil.TRANSFORM] =
        (L.Browser.ie3d ?
            'translate(' + pos.x + 'px,' + pos.y + 'px)' :
            'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
        (scale ? ' scale(' + scale + ')' : '');
};

const FrameCountdown = 4

// -- support for both  0.0.7 and 1.0.0 rc2 leaflet
L.RealtimeCanvasLayer = (L.Layer ? L.Layer : L.Class).extend({ 
    // -- initialized is called on prototype 
    initialize: function (options) {
        this._map    = null;
        this._canvas = null;
        this._frameDraw = null;
        this._delegate = null;
        this._frameUpdateMode = false;
        this._frameCountdown = FrameCountdown
        L.setOptions(this, options);
    },

    delegate :function(del){
        this._delegate = del;
        return this;
    },

    needRedraw: function () {
        this._startFrameUpdate()        
        this._frameUpdateMode = false
        return this;
    },
    
    //-------------------------------------------------------------
    _onLayerDidResize: function (resizeEvent) {
        this._canvas.width = resizeEvent.newSize.x;
        this._canvas.height = resizeEvent.newSize.y;
    },
    //-------------------------------------------------------------
    _updatePosition: function () {
        var topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);        
    },
    _onLayerDidMove: function () {
        this._updatePosition()
        this._startFrameUpdate()
        this._frameUpdateMode = false
    },
    //-------------------------------------------------------------
    getEvents: function () {
        var events = {
            resize: this._onLayerDidResize,
            // movestart: this._onMoveDidStart,
            // moveend: this._onMoveDidEnd,
            move: this._onLayerDidMove,
            zoomstart: this._onZoomDidStart,
            zoomend: this._onZoomDidEnd
        };
        // if (this._map.options.zoomAnimation && L.Browser.any3d) {
        //     events.zoomanim =  this._animateZoom;
        // }

        return events;
    },
    //-------------------------------------------------------------
    onAdd: function (map) {
        this._map = map;
        this._canvas = L.DomUtil.create('canvas', 'leaflet-layer');
        this.tiles = {};

        var size = this._map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;

        var animated = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(this._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));


        map._panes.overlayPane.appendChild(this._canvas);

        map.on(this.getEvents(),this);
        
        var del = this._delegate || this;
        del.onLayerDidMount && del.onLayerDidMount(); // -- callback\
        this._updatePosition();
        this._startFrameUpdate()
        this._frameUpdateMode = false
    },
    
    //-------------------------------------------------------------
    onRemove: function (map) {
        var del = this._delegate || this;
        del.onLayerWillUnmount && del.onLayerWillUnmount(); // -- callback
   
        if (this._frameDraw) {
            L.Util.cancelAnimFrame(this._frameDraw);
        }

        map.getPanes().overlayPane.removeChild(this._canvas);
 
        map.off(this.getEvents(),this);
        
        this._canvas = null;

    },

    //------------------------------------------------------------
    addTo: function (map) {
        map.addLayer(this);
        return this;
    },
    // --------------------------------------------------------------------------------
    LatLonToMercator: function (latlon) {
        return {
            x: latlon.lng * 6378137 * Math.PI / 180,
            y: Math.log(Math.tan((90 + latlon.lat) * Math.PI / 360)) * 6378137
        };
    },

    //------------------------------------------------------------------------------
    drawLayer: function () {
        // -- todo make the viewInfo properties  flat objects.
        var size   = this._map.getSize();
        var bounds = this._map.getBounds();
        var zoom   = this._map.getZoom();

        var center = this.LatLonToMercator(this._map.getCenter());
        var corner = this.LatLonToMercator(this._map.containerPointToLatLng(this._map.getSize()));
   
        var del = this._delegate || this;
        del.onDrawLayer && del.onDrawLayer( {
                                                layer : this,
                                                canvas: this._canvas,
                                                bounds: bounds,
                                                size: size,
                                                zoom: zoom,
                                                center : center,
                                                corner : corner
                                            });
        this._frameDraw = null;

        return false
    },
    // -- L.DomUtil.setTransform from leaflet 1.0.0 to work on 0.0.7
    //------------------------------------------------------------------------------
    _setTransform: function (el, offset, scale) {
        var pos = offset || new L.Point(0, 0);

        el.style[L.DomUtil.TRANSFORM] =
			(L.Browser.ie3d ?
				'translate(' + pos.x + 'px,' + pos.y + 'px)' :
				'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
			(scale ? ' scale(' + scale + ')' : '');
    },

    //------------------------------------------------------------------------------
    _animateZoom: function (e) {
        var scale = this._map.getZoomScale(e.zoom);
        // -- different calc of animation zoom  in leaflet 1.0.3 thanks @peterkarabinovic, @jduggan1 
        var offset = L.Layer ? this._map._latLngBoundsToNewLayerBounds(this._map.getBounds(), e.zoom, e.center).min :
                               this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

        L.DomUtil.setTransform(this._canvas, offset, scale);
    },

    _onMoveDidStart: function (e) {
        this._startFrameUpdate() 
    },

    _onMoveDidEnd: function (e) {
        this._stopFrameUpdate()
    },

    _onZoomDidStart: function (e) {
        this._startFrameUpdate()
    },

    _onZoomDidEnd: function (e) {
        this._stopFrameUpdate()
    },

    // Used internally.  Keeps rendering until frameUpdateMode is turned off
    _registerFrameUpdate: function() {
        if (!this._frameDraw) {
            this._frameDraw = 
            L.Util.requestAnimFrame(() => {
                var success = this.drawLayer()
                var keepDrawing = false
                if (this._frameUpdateMode || !success) {
                    keepDrawing = true
                } else {
                    // Countdown a number of frames after we're 'done'
                    if (this._frameCountdown > 0) {
                        this._frameCountdown = this._frameCountdown - 1
                        keepDrawing = true
                    }
                }
                if (keepDrawing) {
                    this._registerFrameUpdate()
                }
            }, this);
        }
    },

    // If set we're updating each window frame, usually because of an animation
    _startFrameUpdate: function() {
        if (!this._frameUpdateMode) {
            this._frameUpdateMode = true
            this._frameCountdown = FrameCountdown
            this._registerFrameUpdate()
        }
    },  

    _stopFrameUpdate: function() {
        this._frameUpdateMode = false
    }
});

L.realtimeCanvasLayer = function () {
    return new L.RealtimeCanvasLayer();
};
