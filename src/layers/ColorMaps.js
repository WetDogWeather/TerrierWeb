//import '../../WhirlyGlobeWeb'

export const TEMP_COLORS_GREY = new Module.TrrShaderColorMap(0, false, [255.372, 316.483], [0xFF000000, 0xFFFFFFFF]);
export const TEMP_COLORS_NOT_GREY = new Module.TrrShaderColorMap(0, false,
    [255.372, 260.928, 266.483, 272.039, 277.594, 283.15, 288.706, 294.261, 299.817, 305.372, 310.928, 316.483],
    [0xFFFFBFFF, 0xFFD873DB, 0xFF913ABB, 0xFF372398, 0xFF00B6DC, 0xFF02D786, 0xFF40C604, 0xFFFFFF00, 0xFFFB7700, 0xFFD22402, 0xFFA20902, 0xFFEED9D8]);

export const WIND_COLORS_GREY = new Module.TrrShaderColorMap(0, false, [0, 40], [0xFF000000, 0xFFFFFFFF]);
export const WIND_COLORS_NOT_GREY = new Module.TrrShaderColorMap(0, false,
    [0, 5, 10, 15, 20, 25, 30, 35, 40],
    [0xFFAED5FF, 0xFF86B4E6, 0xFF66E2D6, 0xFF00CC05, 0xFFECF006, 0xFFFF6B00, 0xFFE11511, 0xFFE111C1, 0xFFFFCEF7]);

export const RADAR_COLORS_GREY = new Module.TrrShaderColorMap(0, false, [-30, 5, 70], [0x00000000, 0xFF111111, 0xFFFFFFFF]);
export const RADAR_COLORS_NOT_GREY = new Module.TrrShaderColorMap(0, false, [
    -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75
], [
    0x00000000,   // Not actually present in the data
    0x00000000,   // "
    0x11FFFFFF,   // Data present but no returns
    0x4410E6E7,
    0x7710E6E7,
    0xBB10E6E7,
    0xFF10E6E7,
    0xFF10E6E7,
    0xFF069FF3,
    0xFF0400F0,
    0xFF01FC08,
    0xFF02C701,
    0xFF068D01,
    0xFFF6F602,
    0xFFE6BA03,
    0xFFF79505,
    0xFFFE0002,
    0xFFD60401,
    0xFFBB0200,
    0xFFF807F6,
    0xFF9A52C8,
    0xFFFCFBFA,
]);