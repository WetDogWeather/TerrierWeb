### TerrierWeb Repo

This repo contains examples for using Boxer services, sometimes directly and sometimes through the Terrier for Web library.

[Open Layers example](open-layers/readme.md) shows how to directly use WMTS and WMS endpoints through Open Layers.

[Leaflet Example](leaflet/readme.md) integrates Terrier for Web directly on top of Leaflet, directly in Javascript.

[React Leaflet Example](leaflet-react/readme.md) integrates Terrier for Web into React Leaflet.

[MapLibre React](maplibre-react/readme.md) is our test app for Terrier (Web) using MapLibre and React.

The terrier directory contains the files Terrier for Web will need to run on a web site.  These are the Terrier library itself.

Documentation for Terrier can be found in the doc directory.

The rest of this is internal documentation for Wet Dog on keeping the distributions up to date and generating the docs.

#### Generating documentation

Here's how we generate the terrier.js docs in markdown and HTML.

    jsdoc2md terrier/terrier.js -c jsdoc_config.json > doc/Terrier.md
    jsdoc terrier/terrier.js -c jsdoc_config.json

#### Uploading the MapLibre React App

Building and uploading the test app works like so.  Obviously you have to have the right credentials set up with the aws CLI.

    cd maplibre-react
    npm run build
    cd dist
    aws s3 sync . s3://wetdogmaplibre