import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS';

// Helper object to tease details out of the capabilities return
class WMTSData {
    // Pass in the raw capabilities return
    constructor(capability_file) {
    
        this.responsePromise = fetch(capability_file)
            .then(function (response) {
                return response.text();
            })
            .then(data => {
                // This will parse our capabilities return (e.g. getCapabilities)
                let parser = new WMTSCapabilities();
        
                // Parse capabilities into something we can pick through
                return parser.read(data);
        });
    }

    // Look for a name of the given layer
    async getLayer(name, options) {
        const data = await this.responsePromise;
        return await this.process_layer(data, name, options);
    }

    // Look for a layer of the given name (local version)
    async process_layer(data, name,options) {
        return new Promise((resolve, reject) => {
            try {
                const layer = optionsFromCapabilities(data, {'layer': name});

                // We know there's a time dimension available in WDW data sets, so let's find that
                let timeDim = data.Contents.Layer.find((el) => el.Identifier == layer.layer).Dimension[0]
                if (options.style !== undefined) {
                    layer.style = options.style
                }
                if (layer.opacity !== undefined) {
                    layer.opacity = options.opacity
                }

                const wmts = new WMTS(layer, options);
                wmts.timeDim = timeDim
                wmts.curTimeDim = 0
                resolve(wmts);
            } catch(error) {
                reject(error);
            }
        });    
    }
}

export default WMTSData;