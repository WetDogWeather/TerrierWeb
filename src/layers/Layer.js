// constructor()
// colorUpdate() -- toggles this.colored, then switches colormap (should I change name to toggleColor)?
// 

import Legend from '../components/Legend/Legend'
import { forceUpdate } from 'react'

export default class Layer {
    // include internal name, icon, display name,

    constructor(displayName, icon, module, controlName, enableName, units, colorsGrey, colorsNotGrey) {

        // Parameters
        this.displayName = displayName;
        this.icon = icon;
        this.module = module;
        this.controlName = controlName; // 'tempCtl', 'windCtl', or 'radarCtl'
        this.enableName = enableName;
        this.colorsGrey = colorsGrey;
        this.colorsNotGrey = colorsNotGrey;
        this.units = units; // temp = 'K' / 'F' / 'C'    wind = 'm/s'    radar = 'dBz'

        // Default variables
        this.colored = true;
        this.dataSampleType = 1;      // 0 = Nearest, 1 = Linear, 2 = Cubic.
        this.renderSampleType = 1;    // 0 = Nearest, 1 = Linear, 2 = Cubic.
        this.opacity = 192;           // 0 - 255.
        this.minImportance = 10;      // 5 - 100.
    }

    enable(bool) {
        this.module[this.enableName] = bool;
        this.module.updateOverlay();
        if (bool) {
            this.colorUpdate(this.colored);
            this.dataSampleUpdate(this.dataSampleType);
            this.renderSampleUpdate(this.renderSampleType);
            this.opacityUpdate(this.opacity);
            this.minImportanceUpdate(this.minImportance);
        }
    }

    colorUpdate(isNowColored) {
        var control = this.module[this.controlName]; // Effectively Module.tempCtl / windCtl / radarCtl. 
        var newShaderColorMap;

        if (isNowColored) {
            newShaderColorMap = this.colorsNotGrey;
        } else {
            newShaderColorMap = this.colorsGrey;
        }

        if (control) {
            control.colorMap = newShaderColorMap;
        }

        this.colored = isNowColored;
        //Legend.forceUpdate();
    }

    dataSampleUpdate(n) {
        var control = this.module[this.controlName]; // Effectively Module.tempCtl / windCtl / radarCtl.
        const v = Module.TexInterpType.values[n || 0];
        if (control && control.varInterp != v) {
            control.varInterp = v;
        }
    }

    renderSampleUpdate(n) {
        var control = this.module[this.controlName]; // Effectively Module.tempCtl / windCtl / radarCtl. 
        const v = this.module.TexInterpType.values[n || 0];
        if (control && control.visInterp != v) {
            control.visInterp = v;
        }
    }

    opacityUpdate(n) {
        var control = this.module[this.controlName]; // Effectively Module.tempCtl / windCtl / radarCtl. 
        control.opacity = n / 255;
        this.module.repaint();
    }

    minImportanceUpdate(n) {
        var control = this.module[this.controlName]; // Effectively Module.tempCtl / windCtl / radarCtl. 
        if (control) {
            control.minImportanceFactor = Math.min(10, Math.max(0.5, n));
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
}