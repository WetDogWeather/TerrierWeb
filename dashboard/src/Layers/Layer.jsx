import React from 'react'

// Wrapper around a Terrier layer
export default class Layer {

    constructor(terrierOvl, arg1, arg2, arg3, arg4, arg5, 
        arg6, arg7, arg8, arg9, arg10) {
        if (arg1 === undefined) {
            console.log("Invalid call to Layer::constructor() in Terrier.")
            return
        }
        if (arg8 !== undefined) {
            var params = {}
            if (arg1 !== undefined) {
                params['displayName'] = arg1
            }
            if (arg2 !== undefined) {
                params['icon'] = arg2
            }
            if (arg3 !== undefined) {
                params['layerName'] = arg3
            }
            if (arg4 !== undefined) {
                params['levels'] = arg4
            }
            if (arg5 !== undefined) {
                params['units'] = arg5
            }
            if (arg6 !== undefined) {
                params['colorsGrey'] = arg6
            }
            if (arg7 !== undefined) {
                params['colorsNotGrey'] = arg7
            }
            if (arg8 !== undefined) {
                params['timeRange'] = arg8
            }
            if (arg9 !== undefined) {
                params['importanceScale'] = arg9
            }
            if (arg10 !== undefined) {
                params['source'] = arg10
            }
            this._constructorNewStyle(terrierOvl, params)
            return
        }

        this._constructorNewStyle(terrierOvl, arg1)
    }

    // Used to parse out params
    _teaseOutParam(params,name,defValue) {
        if (name in params) {
            return params[name]
        }
        return defValue
    }

    _constructorNewStyle(terrierOvl, params) {
        // Parameters
        this.terrierOvl = terrierOvl

        this.displayName = this._teaseOutParam(params,'displayName','unknown')
        this.icon = this._teaseOutParam(params,'icon',null)
        this.layerName = this._teaseOutParam(params,'layerName',this.displayName)
        this.levels = this._teaseOutParam(params,'levels',[])
        if (this.levels == null) {
            this.levels = []
        }
        this.level = this._teaseOutParam(params,'level',null)
        this.colorsGrey = this._teaseOutParam(params,'colorsGrey',null)
        this.colorsNotGrey = this._teaseOutParam(params,'colors',null)
        this.units = this._teaseOutParam(params,'units','C')

        // Default variables
        this.colored = true;
        this.dataSampleType = 1;      // 0 = Nearest, 1 = Linear, 2 = Cubic.
        this.opacity = 192;           // 0 - 255.

        this.minImportance = this._teaseOutParam(params,'importanceScale',4)      // 5 - 100.
        this.renderScale = this._teaseOutParam(params,'renderScale',0.5)
        this.timeRange = this._teaseOutParam(params,'timeRange',null)
        this.startFrame = this._teaseOutParam(params,'startFrame','current')

        this.source = this._teaseOutParam(params,'source',null)
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
                params['startFrame'] = this.startFrame
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