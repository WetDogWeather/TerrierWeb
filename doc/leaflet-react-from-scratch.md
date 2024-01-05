### Integrating Terrier for Web with React Leaflet

This is a very minimal example of integrating Terrier's data display with React Leaflet.  The source code is in this directory, but here's how you would set this one up from scratch or, presumably, how you'd add it to your own React project.

## Getting Started

Install React Leaflet first.  You are probably more familiar with this step than we are, but we just used the [standard instructions](https://react-leaflet.js.org/docs/start-installation/).

Next up, create a small React Leaflet map.  We just used the [basic example](https://react-leaflet.js.org/docs/start-setup/) and built from there.

You'll also need the Terrier library [distribution](terrier-distribution.md) which is described there.

## Leaflet and React files

In addition to these general purpose files, we have two specific files for integrating into Leaflet and React.  There are both in the src/ directory.

        L.RealtimeCanvasLayer.js
        TerrierLayer.jsx

The Realtime Canvas layer is a variant of the popular canvas overlay that works a bit better with a WebGL style of rendering.  This is pure Javascript functionality that works with Leaflet directly and it's how we overlay our data on Leaflet.

Just make sure that file finds its way into your React app.

TerrierLayer.jsx is proper React and we'll discuss it more detail.

## Terrier Layer

This is an example layer that integrates terrier.js into React.  Just copy it into your own project and feel free to change it.  We may try to build a proper React component for Terrier in the future, but this is what we've got now.

First up, we create a Realtime Canvas Layer.  That just interfaces with Leaflet in a way that works a bit better for WebGL.

        var canvasLayer = L.realtimeCanvasLayer()

We'll pass this into the Terrier init function, which is up next.

        Terrier.startLeaflet('dev',canvasLayer, (ovl) => { })

We're passing the stack name first (dev).  If you have your own stack, which you well may, pass in that instead.  This is the endpoint for Boxer calls and will turn into something like dev.api.wetdogweather.com.

The second argument is the canvas layer that Terrier is going to appropriate for WebGL.  You created that earlier.

Last, we've got the callback for when Terrier is setup.  Terrier can take a bit to get going so rather than race it, we just ask it to let us know when it's ready.

When it is ready, we do a bit of setup.  First we ask what's in our stack.

        // Tell us what's in the stack
        ovl.fetchStackContents((contents) => {
            console.log("Stack contains:\n" + contents)
        });

That returns JSON describing the layers, their levels, regions, sources and so forth.  It really does make sense if you look at it.  This contains the names we use in the startLayer() calls.

You can keep that ovl object around or you can get it globally from Terrier.ovl.  This is the main interface to Terrier and you can call a variety of methods on it, which are shown in the example.

For instance, there's an example of setting the current time (in seconds from 1970).

        // To set the time to now + 1hr
        let d = new Date();
        let now = d.getTime() / 1000
        ovl.setCurrentTime(now+1*60*60)

And there some examples of other overlay layers, currently commented out.

        let windLayerID = ovl.startLayer('wind_uv')
        let cloudCeilingId = ovl.startLayer('cloud_ceiling')

Keep those identifiers around to call olv.stopLayer().

There's also some GeoJSON display, where it does this.

        // Toss in country/state outlines
        ["ne_50m_admin_0_countries", "ne_50m_admin_1_states_provinces"].forEach(c =>
            fetch("geojson/" + c + ".geojson").then(result =>
                result.text().then(t => {
                    console.debug("Adding " + c + ".geojson")
                    ovl.addGeoJSON(t)
                })))                

What we're doing here is overlaying a couple of GeoJSON files on the map for debugging.  This way we know the rendering is working, even if the stack configuration is wrong.  Once you get your app working, you'll want to remove this and the geojson symlink we have in that directory.

## Integrating TerrierLayer

If you have a standard App.jsx from the React Leaflet example, it's pretty easy to add the Terrier Layer.  You just put it in as a second child of MapContainer.  Like so.

        function App() {
        const [count, setCount] = useState(0)
        const position = [51.505, -0.09];

        return (
            <MapContainer
            center={position}
            zoom={3}
            scrollWheelZoom={true}
            style={{ minHeight: "100vh", minWidth: "100vw" }}
            zoomAnimation={false}
            zoomAnimationThreshold={0.0}
            >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <TerrierLayer></TerrierLayer>
            </MapContainer>
        );
        }

Now do the usual 'npm run dev' and you should be able to see your web page.

For distribution you'll need the terrier directory files listed above on your host.
