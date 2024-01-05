### README for Leaflet example

This is a pure Javascript example for integrating Terrier info Leaflet.

To run this one, you'll need to serve this directory with some of web server.  I'll typically just use one integrated into VSCode, but anything will work.

The important bits are in the [startLeafLet](startLeafletMap.js) file.  That's how you kick things off, but you'll also need to include some other things.

More of the files are described in the [Terrier Distribution](../doc/terrier-distribution.md) document.

### Leaflet Utility File

In addition to these general purpose files, we have one specific files for integrating into Leaflet.

        L.RealtimeCanvasLayer.js

The Realtime Canvas layer is a variant of the popular canvas overlay that works a bit better with a WebGL style of rendering.  This is pure Javascript functionality that works with Leaflet directly and it's how we overlay our data on Leaflet.

Just make sure that file finds its way into your distribution app.
