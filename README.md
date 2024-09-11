### Terrier for Web Repo

This repo contains examples for using Boxer services, sometimes directly and sometimes through the Terrier for Web library.

#### Documentation

We provide a set of tutorials, which you can get to in their respective directories below.  Pick out the one you want and look at the readme file.  There will be a "from scratch" file detailing how to make a basic version of that variant and you can go from there.

For reference documentation, we have the full [Terrier for Web](doc/Terrier.md) library.  There's an [HTML version](doc/index.html) which is much prettier.  These are all the interfaces you can use in Javascript.  Please don't dig below that level as we reserve the right to change the WebAssembly and JS internals at any time.

<img width="1159" alt="Screenshot 2024-01-05 at 3 54 52 PM" src="https://github.com/WetDogWeather/TerrierWeb/assets/101820560/0fa35058-1bbf-459b-9641-124fd275b64a">

#### Tutorials for Terrier

We prefer you use Terrier to access data in your Boxer stack.  That's the default and it's going to be much more performant than the alternatives.   It does require using the Terrier toolkit and integrating it with a base map toolkit.  That's what these examples are for.

[Leaflet Example](leaflet-example/README.md) integrates Terrier for Web directly on top of Leaflet, directly in Javascript.

[React Leaflet Example](leaflet-react-example/README.md) integrates Terrier for Web into Leaflet for React.

[MapLibre Example](maplibre-example/README.md) integrates Terrier directly into MapLibre, purely with Javascript.

[ArcGIS Maps Example](ArcGISMaps/README.md) integrates Terrier directly into ArcGIS Maps SDK for JavaScript, purely with Javascript.

#### Tutorial for Static Map Tiles

If you've paid for the static tile service add-on for Boxer, then you can access map tiles directly or through WMTS.  What follows is an Open Layers example for doing just that, but your favorite map toolkit will also have a way of doing this.  It just turns out Open Layers is one of the few to handle WMTS explicitly.

[Open Layers example](open-layers-example/README.md) shows how to directly use WMTS and WMS endpoints through Open Layers.

There's also a WMS example in there... but WMS is kind of awful.  Please only use it if you absolutely have to.

The terrier directory contains the files Terrier for Web will need to run on a web site.  These are the Terrier library itself.  The examples talk about which ones you'll need on your site.

#### Terrier for Web Dashboard App

We have an example web app that doubles as our dashboard for testing Boxer stacks.  This will display all the sources for wind, temperature, and radar.  We also have ways of making it display other variables for debugging purposes.

Feel free to use this an example and borrow any of the code from it that you find useful.  Remember that you must use data from your own Boxer stack and don't point to our production, dev, or anyone else's stack.

[The Dashboard](dashboard/README.md) is our test app for Terrier (Web) using MapLibre and React.

The rest of this readme is internal documentation for Wet Dog on keeping the distributions up to date and generating the docs.

#### Generating documentation

Here's how we generate the terrier.js docs in markdown and HTML.

    jsdoc2md terrier/terrier.js -c jsdoc_config.json > doc/Terrier.md
    jsdoc terrier/terrier.js -c jsdoc_config.json

#### Uploading the Dashboard App

Building and uploading the test app works like so.  Obviously you have to have the right credentials set up with the aws CLI.

    cd dashboard
    npm run build
    cd dist
    aws s3 sync . s3://wetdogmaplibre
