import React from 'react'

// Wrapper around a Terrier layer
export default class Layer {

    constructor(terrierOvl, displayName, icon, layerName, level, units, 
                colorsGrey, colorsNotGrey, timeRange, importanceScale) {

        // Parameters
        this.terrierOvl = terrierOvl
        this.displayName = displayName;
        this.icon = icon;
        this.layerName = layerName; // 'temperature', 'windUV', or 'radar'
        this.level = level
        this.colorsGrey = colorsGrey;
        this.colorsNotGrey = colorsNotGrey;
        this.units = units; // temp = 'K' / 'F' / 'C'    wind = 'm/s'    radar = 'dBz'

        // Default variables
        this.colored = true;
        this.dataSampleType = 1;      // 0 = Nearest, 1 = Linear, 2 = Cubic.
        this.opacity = 192;           // 0 - 255.
        this.minImportance = importanceScale !== undefined ? importanceScale : 1;      // 5 - 100.

        this.timeRange = timeRange;

        this.layer = null
    }

    enable(onOff) {
        if (onOff) {
            if (this.layer == null) {
                this.layer = this.terrierOvl.startLayer(this.layerName)
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
            this.layer.setImportanceScale(Math.min(10, Math.max(0.1, n)))
        }
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
}