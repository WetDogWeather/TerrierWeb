### README for MapLibre Example

This is a pure Javascript example for integrating Terrier info MapLibre.

To run this one, you'll need to serve this directory with some of web server.  I'll typically just use one integrated into VSCode, but anything will work.

The important bits are in the [startMapLibreMap](startMapLibreMap.js) file.  That's how you kick things off, but you'll also need to include some other things.

Those files are described in the [Terrier Distribution](../doc/terrier-distribution.md) document.

### How to Add Terrier

First you have to import Terrier.

    import Terrier from "./terrier/terrier.js"

It will establish itself and start loading its various support code (WebAssembly and such).  The top level object you work with is Terrier.

Once you've got a MapLibre map started, you can integrate Terrier with it and give it your stack name.  'prod' is our stack, but you can use it for testing.

    // Tell Terrier to hook itself into MapLibre
    Terrier.startMapLibre('prod', map, (ovl) => {
        // Now you can display a layer
    })

Once that callback is called, you're good to create layers.  And you'll need that ovl object in any case.

        // Kick off a temperature layer
        let tempLayer = ovl.startLayer('temperature', {
            opacity: 0.5,
        })

        // Animate the results because why not
        ovl.timePlay({period: 10.0})

And that's basically it.  Your layer names are things like 'temperature' and 'wind_uv' and whatever else you may have paid for.  Take a look at the [terrier docs](../doc/Terrier.md) for the full functionality.
