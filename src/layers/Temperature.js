export const COLORS_GREY = new Module.TrrShaderColorMap(0, false, [255.372, 316.483], [0xFF000000, 0xFFFFFFFF]);
export const COLORS_NOT_GREY = new Module.TrrShaderColorMap(0, false,
    [255.372, 260.928, 266.483, 272.039, 277.594, 283.15, 288.706, 294.261, 299.817, 305.372, 310.928, 316.483],
    [0xFFFFBFFF, 0xFFD873DB, 0xFF913ABB, 0xFF372398, 0xFF00B6DC, 0xFF02D786, 0xFF40C604, 0xFFFFFF00, 0xFFFB7700, 0xFFD22402, 0xFFA20902, 0xFFEED9D8]);

var layer = {
    colored: true,
    dataSampleType: 1,      // 0 = Nearest, 1 = Linear, 2 = Cubic.
    renderSampleType: 1,    // 0 = Nearest, 1 = Linear, 2 = Cubic.
    opacity: 192,           // 0 - 255.
    minImportance: 10,      // 5 - 100.
    colorUpdate: function () {
        var newShaderColorMap;

        if (this.colored) {
            newShaderColorMap = COLORS_NOT_GREY;
        } else {
            newShaderColorMap = COLORS_GREY;
        }

        Module.tempColorMap = newShaderColorMap;
        if (Module.tempCtl) {
            Module.tempCtl.colorMap = Module.tempColorMap;
            Module.animateFor(1000);
        }
    },
    dataSampleUpdate: function () {

    },
    renderSampleUpdate: function () {

    },
    opacityUpdate: function () {

    },
    minImportanceUpdate: function () {

    }
}
export default layer;


















class TemperatureLayer {
    COLORS_GREY = new Module.TrrShaderColorMap(0, false, [255.372, 316.483], [0xFF000000, 0xFFFFFFFF]);
    COLORS_NOT_GREY = new Module.TrrShaderColorMap(0, false,
        [255.372, 260.928, 266.483, 272.039, 277.594, 283.15, 288.706, 294.261, 299.817, 305.372, 310.928, 316.483],
        [0xFFFFBFFF, 0xFFD873DB, 0xFF913ABB, 0xFF372398, 0xFF00B6DC, 0xFF02D786, 0xFF40C604, 0xFFFFFF00, 0xFFFB7700, 0xFFD22402, 0xFFA20902, 0xFFEED9D8]);


    test() {
        console.log('test successfully ran')
    }
}

//
//  UPDATE FUNCTIONS
//

export function tempColorUpdate(isColored) {
    var newShaderColorMap;

    if (isColored) {
        newShaderColorMap = COLORS_NOT_GREY;
    } else {
        newShaderColorMap = COLORS_GREY;
    }

    Module.tempColorMap = newShaderColorMap;
    if (Module.tempCtl) {
        Module.tempCtl.colorMap = Module.tempColorMap;
        Module.animateFor(1000);
    }
}

export function tempDataSampleUpdate(n) {
    const v = Module.TexInterpType.values[n || 0];
    if (Module.tempCtl && Module.tempCtl.varInterp != v) {
        Module.tempCtl.varInterp = v;
        Module.animateFor(1000);
    }
}

export function tempRenderSampleUpdate(n) {
    const v = Module.TexInterpType.values[n || 0];
    if (Module.tempCtl && Module.tempCtl.visInterp != v) {
        Module.tempCtl.visInterp = v;
        Module.animateFor(1000);
    }
}

export function tempOpacityUpdate(n) {
    if (Module.tempCtl) {
        Module.tempCtl.opacity = n / 255;
        Module.repaint();
    }
}

export function tempMinImportanceUpdate(n) {
    if (Module.tempCtl) {
        Module.tempCtl.minImportanceFactor = Math.min(10, Math.max(0.5, n));
        Module.animateFor(1000);
    }
}