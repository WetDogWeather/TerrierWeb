import React from 'react'

// Wrapper around a Terrier layer
export default class Layer {

    constructor(terrierOvl, displayName, icon, layerName, levels, units, 
                colorsGrey, colorsNotGrey, timeRange, importanceScale, source) {

        // Parameters
        this.terrierOvl = terrierOvl
        this.displayName = displayName;
        this.icon = icon;
        this.layerName = layerName; // 'temperature', 'windUV', or 'radar'
        this.levels = levels ? levels : []
        this.level = !levels || levels.length == 0 ? null : levels[0]
        this.colorsGrey = colorsGrey;
        this.colorsNotGrey = colorsNotGrey;
        this.units = units; // temp = 'K' / 'F' / 'C'    wind = 'm/s'    radar = 'dBz'

        // Default variables
        this.colored = true;
        this.dataSampleType = 1;      // 0 = Nearest, 1 = Linear, 2 = Cubic.
        this.opacity = 192;           // 0 - 255.
        this.minImportance = importanceScale !== undefined ? importanceScale : 8;      // 5 - 100.
        this.renderScale = 0.5;
        this.timeRange = timeRange;

        this.layer = null
        if (source) {
            this.source = source
        } else {
            this.source = null
        }
    }

    enable(onOff) {
        if (onOff) {
            if (this.layer == null) {
                const params = {}
                if (this.level !== undefined) {
                    params['level'] = this.level
                }
                params['renderScale'] = this.renderScale
                params['cadence'] = this.timeRange
                if (this.source) {
                    params['source'] = this.source
                    this.layer = this.terrierOvl.startLayer('visual', params)
                } else {
                    this.layer = this.terrierOvl.startLayer(this.layerName, params)
                }
            }
        } else {
            if (this.layer != null) {
                this.terrierOvl.stopLayer(this.layer)
                this.layer = null
            }
        }
        if (onOff) {
            this.colorUpdate(this.colored);
            this.dataSampleUpdate(this.dataSampleType);
            this.opacityUpdate(this.opacity);
            this.minImportanceUpdate(this.minImportance);
        }
    }

    colorUpdate(isNowColored) {
        var newShaderColorMap;

        if (isNowColored) {
            newShaderColorMap = this.colorsNotGrey;
        } else {
            newShaderColorMap = this.colorsGrey;
        }

        if (this.layer != null) {
            this.layer.setColorMap(newShaderColorMap)
        }

        this.colored = isNowColored;
    }

    dataSampleUpdate(n) {
        this.dataSampleType = n;

        this.layer.setInterpMode(['nearest','linear','cubic'][n])
    }

    opacityUpdate(n) {
        this.opacity = n;

        // TODO: Make this from 0 to 1
        if (this.layer != null) {
            this.layer.setOpacity(n / 255)
        }
    }

    minImportanceUpdate(n) {
        this.minImportance = n;

        if (this.layer != null) {
            this.layer.setImportanceScale(Math.min(32, Math.max(1, n)))
        }
    }

    // Change the level being displayed
    setLevel(newLevel) {
        if (this.layer != null) {
            this.layer.setLevel(newLevel)
        }
        this.level = newLevel
    }

    getDisplayName() {
        return this.displayName;
    }

    getIcon() {
        return this.icon;
    }

    getColorMap() {
        if (this.colored) {
            return this.colorsNotGrey;
        } else {
            return this.colorsGrey;
        }
    }

    getUnits() {
        return this.units;
    }

    // Return available time range
    getTimeRange() {
        return this.timeRange
    }
    
    // Query the given location on the screen for a data value
    queryValue(x,y) {
        if (this.layer == null) {
            return null
        }

        return this.layer.queryValue(x,y)
    }
}