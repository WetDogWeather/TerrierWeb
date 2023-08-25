// Initialize Terrier and get it ready for use
export default function TerrierInit(mapCanvas) {
    if (mapCanvas == undefined) {
        console.log('Need to pass the mapCanvas into TerrierInit.  Not starting.')
        return
    }

    // Emscripten is expecting this global Module to be defined
    //  and it will merge these contents with its own
    globalThis.Module = {
        preRun: [],
        postRun: [],
        emInitialized: false, // Set when the Emscripten runtime is loaded
        doMapInit: true,      // MapLibre not currently deferred, can we do that?
        noInitialRun: true,   // don't call main
        noExitRuntime: true,  // Keep the Emscripten runtime from shutting down after async
        // calls because we aren't using the main loop mechanism.
        canvas: mapCanvas,
        autoRepaint: 2000,    // draw a frame every few seconds even if nothing changed
        debugLayers: false,
        debugTracker: false,
        debugJSFetch: false,
        debugTemp: false,
        debugWind: false,
        debugRadar: false,
      
        print: (function () {
          return function (text) {
            if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
            text = text.replace(/&/g, "&amp;");
            text = text.replace(/</g, "&lt;");
            text = text.replace(/>/g, "&gt;");
            text = text.replace('\n', '<br>', 'g');
            console.log(text);
          };
        })(),
        setStatus: function (text) {
          //console.log("Module.setStatus: '" + text + "'");
        },
        totalDependencies: 0,
        monitorRunDependencies: function (left) {
          //console.log("Module.monitorRunDependencies(" + left + ")");
        },
        onRuntimeInitialized: function () {
          console.log("Runtime Initialized");
          if (window.mobile) {
            const text = document.getElementById("frameText");
            text.innerHTML = "Mobile not supported";
            text.setAttribute("rows", 2);
            text.classList.add("active");
            return;
          }
          Module.emInitialized = true;
          _postLoadInit();
      
          Module.service = new Module.TrrService();
          Module.service.stackName = "dev";
          Module.service.apiVersion = 1;
          Module.tempCadence = [-24 * 3600, 24 * 3600, 40];
          Module.windCadence = [-25 * 3600, 24 * 3600, 40];
          Module.radarCadence = [-48 * 3600, 0 * 3600, 40];
      
          if (Module.doMapInit) {
            _initMap("webglcanvas", mapCanvas)
          }
        },
      };

    // Have the main WhirlyGlobe web module lot itself
    //  this also kicks off Emscriten
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = 'WhirlyGlobeWeb.js';
    s.defer = 'defer';
    document.body.appendChild(s);
}
