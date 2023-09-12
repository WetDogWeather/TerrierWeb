
import WMTSCapabilities from 'ol/format/WMTSCapabilities.js';
import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS.js';
class WMTSData {
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

    async getLayer(name) {
        const data = await this.responsePromise;
        return await this.process_layer(data, name);
        
    }

    async process_layer(data, name) {
        return new Promise((resolve, reject) => {
            try {
                const layer =  optionsFromCapabilities(data, {'layer': name});
                const wmts = new WMTS(layer);
                resolve(wmts);
            } catch(error) {
                reject(error);
            }
        });    
    }
}

export default WMTSData;