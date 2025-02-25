import WMSCapabilities from 'ol/format/WMSCapabilities';
import ImageWMS from 'ol/source/ImageWMS';

class WMSData {
    constructor(capability_file) {
        this.layer = null;
        this.responsePromise = fetch(capability_file)
            .then(function (response) {
                return response.text();
            })
            .then(data => {
                // This will parse our capabilities return (e.g. getCapabilities)
                let parser = new WMSCapabilities();
        
                // Parse capabilities into something we can pick through
                return parser.read(data);
        });
    }
    async getLayer(name, style) {
        const wmsCap = await this.responsePromise;
        let img =  await this.process_layer(wmsCap, name, style);
        return img
        
    }

    getBBox() {
        if (this.layer != null) {
            return this.layer['extent'];
        } else {
            return null;
        }
    }

    async getData() {
        return await this.responsePromise;
    }

    async process_layer(wmsCap, name, style) {
        return new Promise((resolve, reject) => {
            try {
                let layer =  this.optionsFromCapabilities(wmsCap, {'layer': name});
                this.layer = layer;
                const img = new ImageWMS({
                    url: layer['url'],
                    params: {
                        'LAYERS': [layer['layer']],
                        'STYLES': style,
                       //'WIDTH': 128,
                       // 'HEIGHT': 96,
                        //'BBOX': [-8609867,5244179,-8296721,5479007],
                        'TIME': layer['defaultTime'],
                        'TRANSPARENT': true,
                        'CRS': layer['crs']

                    }
                })
                resolve(img);
            } catch(error) {
                reject(error);
            }
        });    
    }

    optionsFromCapabilities(wmsCap, config) {
        const capability =  wmsCap['Capability']
        const  topLayer = capability['Layer'];
        let CRS = topLayer['CRS']
        const layers = topLayer['Layer'];
        const layer = layers.find(function(e) {
            return e['Name'] == config['layer']
        });
        if (!layer) {
            return null;
        }
        if (layer['CRS']) {
            CRS = layer['CRS'];
        }
        let format = this.getFormat(capability);
        let url = this.getUrl(capability);

        let styles = layer['Style'];

        let times = layer['Dimension'][0]['values'];
        let defaultTime = layer['Dimension'][0]['default'];
        let extent = layer['BoundingBox'][0]['extent']
        let geoExtent = layer['EX_GeographicBoundingBox']

        return {
            url: url,
            layer: config['layer'],
            CRS: CRS,
            format: format,
            styles: styles,
            times: times,
            defaultTime: defaultTime,
            extent: extent,
            geoExtent: geoExtent,

        }


     
    }
    getFormat(capability) {
        try {
            return capability['Request']['GetMap']['Format'][0];
        } catch(error) {
            return null;
        }
    }

    getUrl(capability) {
        try {
            return capability['Request']['GetMap']['DCPType'][0]['HTTP']['Get']['OnlineResource'];
        } catch(error) {
            return null;
        }
    }
/*
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
    */
}


export default WMSData;