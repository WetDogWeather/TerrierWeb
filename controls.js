const initUI = function(scope) {
  const setActive = (e, a) => { (a ? e.classList.add : e.classList.remove).apply(e.classList, ["active"]); }
  scope.pendingInput = false;
  const controlsInterval = 100;
  const updateControlsInterval = 500;
  const importUpdateInterval = 500;

  const premult = (n, a) => {
    return (((n >> 24) & 0xFF) * a) << 24 |
           (((n >> 16) & 0xFF) * a) << 16 |
           (((n >> 8) & 0xFF) * a) << 8 |
           (((n >> 0) & 0xFF) * a);
  }
  scope.tempColors = [
    new Module.TrrShaderColorMap(0, false, [255.372, 316.483], [0xFF000000, 0xFFFFFFFF]),
    new Module.TrrShaderColorMap(0, false, [
      255.372,
      260.928,
      266.483,
      272.039,
      277.594,
      283.15,
      288.706,
      294.261,
      299.817,
      305.372,
      310.928,
      316.483
    ], [
      0xFFFFBFFF,
      0xFFD873DB,
      0xFF913ABB,
      0xFF372398,
      0xFF00B6DC,
      0xFF02D786,
      0xFF40C604,
      0xFFFFFF00,
      0xFFFB7700,
      0xFFD22402,
      0xFFA20902,
      0xFFEED9D8
    ]),
  ];
  scope.windColors = [
    new Module.TrrShaderColorMap(0, false, [0, 40], [0xFF000000, 0xFFFFFFFF]),
    new Module.TrrShaderColorMap(0, false, [0, 5, 10, 15, 20, 25, 30, 35, 40], [
      0xFFAED5FF,
      0xFF86B4E6,
      0xFF66E2D6,
      0xFF00CC05,
      0xFFECF006,
      0xFFFF6B00,
      0xFFE11511,
      0xFFE111C1,
      0xFFFFCEF7
    ])
  ];
  scope.radarColors = [
    new Module.TrrShaderColorMap(0, false, [-30, 5, 70], [0x00000000, 0xFF111111, 0xFFFFFFFF]),
    new Module.TrrShaderColorMap(0, false, [
      -30,-25,-20,-15,-10,-5,0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75
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
    ]),
  ];

  const radioVal = (n,def) => {
    const e = document.getElementsByName(n);
    for(i = 0; i < (e||[]).length; ++i) {
      if (e[i].checked) {
        return e[i].value;
      }
    }
    return def;
  };

  scope.onPlayStop = _debounce(() => {
      Module.togglePlay();
    }, controlsInterval);
  
  scope.setPlayInterval = _debounce((t) => {
      Module.setPlayInterval(120 - t|0 + 1);
      scope.pendingInput = false;
    }, controlsInterval);
  
  scope.updateControls = _debounce(() => {
      Module.updateOverlay();
    }, updateControlsInterval);
  
  const updateTempImport = _debounce((v) => {
      if (Module.tempCtl) {
        Module.tempCtl.minImportanceFactor = Math.min(10, Math.max(0.5, v));
        Module.animateFor(1000);
      }
      scope.pendingInput = false; // assume we're only updating one at a time
    }, importUpdateInterval);
  
  const updateWindImport = _debounce((v) => {
      const factor = Math.min(10, Math.max(0.5, v));
      if (Module.windCtl && Module.windCtl.minImportanceFactor != factor) {
        Module.windCtl.minImportanceFactor = factor;
        Module.animateFor(1000);
      }
      scope.pendingInput = false;
    }, importUpdateInterval);
  
  const updateRadarImport = _debounce((v) => {
    const factor = Math.min(10, Math.max(0.5, v));
    if (Module.radarCtl && Module.radarCtl.minImportanceFactor != factor) {
        Module.radarCtl.minImportanceFactor = factor;
        Module.animateFor(1000);
      }
      scope.pendingInput = false;
    }, importUpdateInterval);

  scope.onSpeedChange = function(c) {
    controls.pendingInput = true;
    controls.setPlayInterval(c.value);
  };

  scope.onTypeChecked = (checked, type) => {
    if (Module.controllerState[type].enabled != checked) {
      Module.controllerState[type].enabled = checked;
      scope.updateControls();
    }
  }

  // Temperature

  scope.onTempCheck = function(c) {
    if (Module.enableTemp != !!c.checked) {
      Module.enableTemp = !!c.checked;
      if (Module.enableTemp) {
        scope.onTempColor(radioVal("tempColor", 0));
      }
      scope.updateControls();
    }
  };
    
  scope.onTempOpacity = function(c) {
    const v = c.value / 255;
    if(Module.tempCtl && Module.tempCtl.opacity != v) {
        Module.tempCtl.opacity = v;
        Module.repaint();
    }
  };
    
  scope.onTempImport = function(c) {
    controls.pendingInput = true;
    updateTempImport(c.value/10);
  };


  scope.onTempVarInterp = function(n) {
    const v = Module.TexInterpType.values[n||0];
    if (Module.tempCtl && Module.tempCtl.varInterp != v) {
      Module.tempCtl.varInterp = v;
      Module.animateFor(1000);
    }
  };

  scope.onTempVisInterp = function(n) {
    const v = Module.TexInterpType.values[n||0];
    if (Module.tempCtl && Module.tempCtl.visInterp != v) {
      Module.tempCtl.visInterp = v;
      Module.animateFor(1000);
    }
  };

  scope.onTempColor = function(map) {
    Module.tempColorMap = scope.tempColors[map];
    if (Module.tempCtl) {
      Module.tempCtl.colorMap = Module.tempColorMap;
      Module.animateFor(1000);
    }
  };

  // Wind
  
  scope.onWindCheck = function(c) {
    if (Module.enableWind != !!c.checked) {
      Module.enableWind = !!c.checked;
      if (Module.enableWind) {
        scope.onWindColor(radioVal("windColor", 0));
      }
      scope.updateControls();
    }
  };
    
  scope.onWindOpacity = function(c) {
    if (Module.windCtl) {
        Module.windCtl.opacity = c.value/255;
        Module.repaint();
    }
  };

  scope.onWindImport = function(c) {
    controls.pendingInput = true;
    updateWindImport(c.value/10);
  };

  scope.onWindVarInterp = function(n) {
    const v = Module.TexInterpType.values[n||0];
    if (Module.windCtl && Module.windCtl.varInterp != v) {
      Module.windCtl.varInterp = v;
      Module.animateFor(1000);
    }
  };

  scope.onWindVisInterp = function(n) {
    const v = Module.TexInterpType.values[n||0];
    if (Module.windCtl && Module.windCtl.visInterp != v) {
      Module.windCtl.visInterp = v;
      Module.animateFor(1000);
    }
  };

  scope.onWindColor = function(map) {
    Module.windColorMap = scope.windColors[map];
    if (Module.windCtl) {
      Module.windCtl.colorMap = Module.windColorMap;
      Module.animateFor(1000);
    }
  };

  // Radar

  scope.onRadarCheck = function(c) {
    if (Module.enableRadar != !!c.checked) {
      Module.enableRadar = !!c.checked;
      if (Module.enableRadar) {
        scope.onRadarColor(radioVal("radarColor", 0));
      }
      scope.updateControls();
    }
  };
    
  scope.onRadarOpacity = function(c) {
    if (Module.radarCtl) {
        Module.radarCtl.opacity = c.value/255;
        Module.repaint();
    }
  };
    
  scope.onRadarImport = function(c) {
    controls.pendingInput = true;
    updateRadarImport(c.value/10);
  };

  scope.onRadarVarInterp = function(n) {
    const v = Module.TexInterpType.values[n||0];
    if (Module.radarCtl && Module.radarCtl.varInterp != v) {
      Module.radarCtl.varInterp = v;
      Module.animateFor(1000);
    }
  }

  scope.onRadarVisInterp = function(n) {
    const v = Module.TexInterpType.values[n||0];
    if (Module.radarCtl && Module.radarCtl.visInterp != v) {
      Module.radarCtl.visInterp = v;
      Module.animateFor(1000);
    }
  }

  scope.onRadarColor = function(map) {
    Module.radarColorMap = scope.radarColors[map];
    if (Module.radarCtl) {
      Module.radarCtl.colorMap = Module.radarColorMap;
      Module.animateFor(1000);
    }
  };

  scope.resetControllers = () => {
    const t = [Module.enableTemp, Module.enableWind, Module.enableRadar];
    if (t.reduce((a,b)=>a||b)) {
      Module.enableTemp = Module.enableWind = Module.enableRadar = false;
      Module.updateOverlay();

      Module.enableTemp = t[0]; Module.enableWind = t[1]; Module.enableRadar = t[2];
      Module.updateOverlay();
    }
  };

  // Fill in levels
  let levelsDropdown = document.getElementById("levels");
  if (levelsDropdown) {
    // Clear previous contents
    levelsDropdown.innerHTML = "";

    // Get available levels
    const levelArr = Module.TrrIController.getAvailableLevels();
    // Find unique values, sort numerically
    Array.from(new Map(levelArr.map(x => [x,null])).keys()).concat([""]).
          sort((a,b) => parseInt(a,10) - parseInt(b,10)).
          forEach(level => {
      const item = document.createElement("option");
      item.value = item.text = item.label = level;
      levelsDropdown.appendChild(item);
    });
    levelsDropdown.value = Module.selectedLevel;
  };

  scope.setLevel = function(selectedLevel) {
    if (Module.selectedLevel != selectedLevel) {
      Module.selectedLevel = selectedLevel;
      scope.resetControllers();
    }
  }

  scope.updateFrameInfo = () => {
    const text = document.getElementById("frameText");
    if (!text) return;

    // Extract from vectors and combine
    const all = [];
    Module.controllers.forEach(ctl => {
      const frames = ctl.getCurFrames();
      const count = frames ? frames.size() : 0;
      for (let i = 0; i < count; ++i) { all.push(frames.get(i)); }
    });

    const frames = all.map(f => {
      const manifest = f.manifest;
      if (manifest) try {
        return [manifest.source, manifest.region, manifest.variable, manifest.level,
                manifest.varKey, f.zoomLevel, f.interpolation, f.totalSlices].concat(
                  f.slices.map(s => new Date(s.forecastEpoch * 1000).toISOString()));
      } finally {
        manifest.delete();
      }
    }).filter(Boolean);

    // todo: better to drive a table...
    const hdr = "source - region - variable - varKey - level - zoom - interpolation - total - from - to\n";
    text.innerHTML = hdr + frames.map(f => f.join(" - ")).join("\n");
    text.setAttribute("rows", frames.length + 2);
    setActive(text, !!frames.length);
  };
  Module.updateFrameInfo = _throttle(scope.updateFrameInfo, 100);

  const buildSpan = (c, s, t) => {
    let r = document.createElement("span");
    if (t) r.innerText = t;
    if (c) r.classList.add(c);
    if (s) r.style = s;
    return r;
  };
  const buildColorMap = (name, map, e) => {
    e.innerHTML = "";
    const values = map.values;
    const colors = map.colors;
    [buildSpan("colormapTitle", "", name)].concat(
      values.map((v,i) => {
        const c = colors[i];
        let s = v+"";
        if (s.match(/\d\.\d{3}/)) {
          s = v.toFixed(2);
        }
        return buildSpan("colormapEntry", "background-color:" + c.str, s);
      })
    ).forEach(s => e.appendChild(s));
  };

  // Polling

  var lastTimeUpdate = 0;
  const slowUpdateInterval = 1000;
  scope.updateSlow = () => {
    const now = (new Date()).getTime();
    if (now < lastTimeUpdate + slowUpdateInterval) return;
    lastTimeUpdate = now;
    if (!Module.controllers || !Module.controllers.length) {
      Module.repaint();
      Module.stopOverlay();
    }
    setActive(document.getElementById("timeline"), (Module.tracker && Module.controllers.length));
    const isPlaying = Module.tracker && Module.tracker.isPlaying;
    document.getElementById("play").value = isPlaying ? "Stop" : "Play";
    if (!Module.tracker) return;
    // Find the span of valid time values across the active controllers
    var totalMin = Number.MAX_VALUE, totalMax = Number.MIN_VALUE;
    Module.controllers.forEach(c => {
        if (c.timeSpanMin < c.timeSpanMax) {
          totalMin = Math.min(c.timeSpanMin, totalMin);
          totalMax = Math.max(c.timeSpanMax, totalMax);
        }
    });
    Module.tracker.setRange((totalMin < totalMax) ? totalMin : now, (totalMin < totalMax) ? totalMax : now);
    // Update importance values, unless they're still dragging the slider around
    if (!scope.pendingInput) {
      let any = false;
      ([["temp", Module.tempCtl],["wind", Module.windCtl],["radar", Module.radarCtl]]).
        concat(Module.controllerState.types.map(x=>[Module.controllerState[x].name, Module.controllerState[x].controller])).
        forEach(v => ((n, ctl) => {
          if (!ctl) return;
          document.querySelectorAll(n+"Import").forEach(e => e.value = ctl?.let(c => c.minImportanceFactor * 10) ?? "");
          document.querySelectorAll(n+"ImportLabel").forEach(e => e.innerText = ctl?.let(c => c.minImportance) ?? "");
          [... document.querySelectorAll("#"+n+"Controls td.conditional")].forEach(e => setActive(e, !!ctl) );
          [... document.querySelectorAll("#"+n+"Colors.conditional")].forEach(e => setActive(e, !!ctl) );
          const colorMap = ctl.colorMap;
          if (colorMap) {
            const colorMapElement = document.getElementById(n+"Colors");
            if (colorMapElement) {
              buildColorMap(n, ctl.colorMap, colorMapElement);
            } else {
              console.log("No color map element for '" + n + "'");
            }
          }
          any ||= !!ctl;
        })(...v)
      );
      setActive(document.querySelector("#controls thead"), any);

      // Update the frame info now and then even if it's not changing, for the zoom levels.
      if (Module.lastRenderTime > new Date().getTime() - 1000) {
        Module.updateFrameInfo();
      }
    }

    const heap = document.getElementById("heapSize");
    if (heap) {
      heap.innerText = "Heap size: " + (Module.HEAP8.length / 1024.0 / 1024.0) + " MiB";
    }
  };
  scope.updateFast = (() => {
    // one-time init
    const curTime = document.getElementById("curTime");
    const minTime = document.getElementById("minTime");
    const maxTime = document.getElementById("maxTime");
    const scrubber = document.getElementById("timeScrubber");
    const speedScrubber = document.getElementById("speedScrubber");
    const spinner = document.getElementById("animatingSpinner");
    const checks  = ["enableTemp","enableWind","enableRadar"].map(s => document.getElementById(s));
    // The actual update function
    return () => {
      const t = Module.tracker;
      setActive(spinner, Module.isRendering(250));
      if (t && t.curTime > 0 && t.minTime < t.maxTime) {
        curTime.innerText = t.curTimeISO;
        minTime.innerText = t.minTimeISO;
        maxTime.innerText = t.maxTimeISO;
        scrubber.value = Module.getTimeFrac() * 10000;
        if (!scope.pendingInput) {
          speedScrubber.value = 120 - t.playIntervalSec|0 + 1;
          checks[0].checked = Module.enableTemp;
          checks[1].checked = Module.enableWind;
          checks[2].checked = Module.enableRadar;
        }
        setTimeout(scope.updateFast, t.isPlaying ? 50 : 200);
        // Repaint one frame now and then in case something changes that we're not controlling
        // or, e.g., a load takes longer than the time passed to `animateFor`
        if (Module.autoRepaint && Module.lastRenderTime + Module.autoRepaint < new Date().getTime()) {
          Module.repaint();
        }
      } else {
        [curTime, minTime, maxTime].forEach(e => e.innerText = "");
        scrubber.value = 0;
        speedScrubber.value = 0;
        setTimeout(scope.updateFast, 250);
      }
      if (Module.emInitialized && Module.canvas) {
        scope.updateSlow();
      }
    }
  })();
};
