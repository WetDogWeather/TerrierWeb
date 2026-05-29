import { createContext, useState, useEffect, useRef, createRef } from 'react'
import Terrier from "../terrier.js"

import Header from './components/Header/Header'
import Burger from './components/Header/Burger'
import Dropdown from './components/Dropdown/Dropdown'
import Legend from './components/Legend/Legend'
import MediaControls from './components/Media Controls/MediaControls'
import Map from './components/map.jsx';
import Layer from './Layers/Layer.jsx'

import tempIcon from './assets/thermometer.png'
import cloudIcon from './assets/cloud.png'
import hailIcon from './assets/hail.png'
import wideIcon from './assets/wide.png'
import questionIcon from './assets/question.png'
import percentIcon from './assets/percentage.png'
import visibilityIcon from './assets/visibility.png'
import windIcon from './assets/wind.png'
import gustIcon from './assets/gusts.png'
import radarIcon from './assets/radar.png'
import roundIcon from './assets/round.png'
import burgerIcon from './assets/menu-burger.png'
import hideIcon from './assets/hide.png'

export const AppContext = createContext()

// Try to map an icon to the variable name
function iconForVariable(variable) {
  switch (variable.dataType.toLowerCase()) {
    case "reflectivity":
      return radarIcon;
    case "temperature":
      return tempIcon;
    case "wind_uv":
    case "velocity":
      switch (variable.name.toLowerCase()) {
        case "wind_speed_gust":
          return gustIcon
      }
      return windIcon;
    case "probability":
    case "percentage":
      return percentIcon;
    case "visibility":
      return visibilityIcon;
    case "cloudceiling":
      return cloudIcon;
    case "preciptype":
      return radarIcon;
    case "visual":
      return visibilityIcon;
    case "none":
      if (variable.name.includes("swath")) {
        return wideIcon
      } else if (variable.name.includes("size")) {
        return roundIcon
      } else if (variable.name.includes("hail")) {
        return hailIcon
      }
    }

  return questionIcon
}

// Some variables shouldn't be interpolated.  Mostly types.
function interpForVariable(variable) {
  switch (variable.dataType.toLowerCase()) {
    case "severehailindex":
      return 0
    case "preciptype":
      return 0
    case "none":
      if (variable.name.includes("swath")) {
        return 0
      } else if (variable.name.includes("size")) {
        return 0
      } else if (variable.name.includes("hail")) {
        return 0
      }
      if (variable.name.includes("qpe_ffg")) {
        return 0;
      }
  }
  if (variable.name == 'weather') {
    return 0;
  }

  return 1
}

// Some variables need to be snapped to a frame.  Mostly types.
function snapForVariable(variable) {
  if (variable.name == 'weather') {
      return 1
  }

  return 0
}

// Come up with a good time range for a variable
// This is mostly obvious except for a few weird cases
function  timeRangeForVariable(variable) {
  if (variable.source == 'flashwx') {
    switch (variable.name) {
        case "lightning_probability":
          return [-1*3600,1*3600,48]
        case "lightning_probability_extended":
          return [0,24*3600,48]
        case "lightning_firststrike":
        case "lightning_allclear":
          return [-4*3600,0,48]
        case "golf_playability_index":
          return [-12*3600,48*3600,96]
    }
  }
  if (variable.source == 'airnow') {
    switch (variable.name) {
        case "forecasted_air_quality_index":
          return [-14*24*3600,1*24*3600,32];
    }
}
switch (variable.dataType) {
    case "temperature":
    case "wind_uv":
    case "velocity":
    case "visibility":
    case "cloudceiling":
      return [-1*24*60*60,1*24*60*60,32]
    case "visual":
      return [-2*60*60,1*2*60*60,32]
  }
  switch (variable.temporalType) {
    // Just observed data
    case "observed":
      return [-4*60*60,0,64]
    // Forecast and both we'll do the same
    case "forecast":
    case "both":
      return [-1*24*60*60,1*24*60*60,32]
  }

  return [-1*24*60*60,1*24*60*60,32]
}

function App() {
  const [controlsVisible, setControlsVisible] = useState(true)
  const [legendVisible, setLegendVisible] = useState(true)
  const [legendValue, setLegendValue] = useState(null)
  const [snapFrame, setSnapFrame] = useState(false)
  const [curLayer, setCurLayer] = useState(-1)
  const [layers, setLayers] = useState([])
  const [level, setLevel] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [displayAllLayers,setDisplayAllLayers] = useState(false)
  const [sources,setSources] = useState(["All"])
  const [regions,setRegions] = useState(["All"])
  const [basemaps,setBasemaps] = useState([""])
  const [source,_setSource] = useState("All")
  const [region,_setRegion] = useState("All")
  const [animSpeed, setAnimSpeed] = useState(4.0)
  const [timeRange,setTimeRange] = useState([0.0,0.0])
  const [curTime, setCurTime] = useState(Number.NEGATIVE_INFINITY)
  const [displayedTime, setDisplayedTime] = useState(Number.NEGATIVE_INFINITY)
  const [terrierOvl, setTerrierOvl] = useState(null)
  const [units, _setUnits] = useState('')
  const [stackName, setStackName] = useState('dev')
  const [baseMapName, setBaseMapName] = useState('alidade_smooth')

  function setRegion(newRegion) {
    _setRegion(newRegion)
  }

  function setSource(newSource) {
    _setSource(newSource)
  }

  // React to stackName changes
  useEffect(() => {
    // Turn off our layers
    setLayers([])
    setCurLayer(-1)

    Terrier.changeStack(stackName, "placeholderkey", (ovl) => {
      terrierReady(ovl)
    }, () => {
      console.log("Stack name was invalid.  Terrier won't work.")
    })
  }, [stackName])


  // Turn on the layer when someone messes with curLayer
  useEffect(() => {
    // Turn everything off
    for (var layerId=0;layerId<layers.length;layerId++) {
      if (layerId != curLayer) {
        layers[layerId].enable(false)
      }
    }

    const now = Date.now() / 1000

    // Then turn ours on
    if (curLayer >= 0 && curLayer < layers.length) {
      const layer = layers[curLayer]
      layer.enable(true)

      // Update the time range
      let timeRange = layer.layer.ovl.getTimeRange()
      if (timeRange[0] != timeRange[1]) {
        timeRange[0] = timeRange[0]/1000-now
        timeRange[1] = timeRange[1]/1000-now
      } else {
        timeRange = layer.timeRange
      }
      setTimeRange([now+timeRange[0],now+timeRange[1]])
      if (curTime < timeRange[0]+now) {
        setCurTime(timeRange[0]+now)
      } else if (curTime >= timeRange[1]+now) {
        setCurTime(timeRange[1]+now)
      }

      // And update the units of whatever is being displayed
      _setUnits(layer.units)
      setLevel(null)
    } else {
      // Reset to empty
      setCurTime(now)
      setTimeRange([0.0,0.0])
      _setUnits('')
      setLevel(null)
    }
  },[curLayer, layers])

  // React to level changes
  useEffect(() => {
    if (curLayer >= 0 && curLayer < layers.length) {
      layers[curLayer].setLevel(level)
    }
  },[level])

  // Change frame snapping
  useEffect(() => {
    if (terrierOvl) {
      terrierOvl.setNearestFrame(snapFrame)
    }
  },[snapFrame])

  // React to curTime changes
  useEffect(() => {
    if (curTime == Number.NEGATIVE_INFINITY) { return }
    if (terrierOvl == undefined) { return }
    terrierOvl.setCurrentTime(curTime)
    setDisplayedTime(terrierOvl.getCurrentTime)
  },[curTime])

  // React to isPlaying changes
  useEffect(() => {
    if (terrierOvl == undefined) { return }
    if (isPlaying) {
      terrierOvl.timePlay({'period': 30.0 / animSpeed, 'pause': 1.0})
    } else {
      terrierOvl.timePause()
      // We were animating, so update our curTime from Terrier
      setCurTime(terrierOvl.getCurrentTime())
    }
  },[isPlaying,animSpeed])

  // Add an interval callback to update the curTime periodically when isPlaying is on
  // TODO: Turn this off when we don't need it
  const updatePlayTime = () => {
    if (terrierOvl == undefined) { return }
    // if (!isPlaying) { return }
    const newTime = terrierOvl.getCurrentTime()
    if (curTime != newTime) {
      // TODO: Check that we're not creating a slow recursion here
      setCurTime(newTime)
    }
  }
  useEffect(() => {
      const interval = setInterval(() => updatePlayTime(), 100);
      return () => {
        clearInterval(interval);
      };
  }, [terrierOvl,isPlaying,curTime]);

  const map = createRef();

  function hidePage() {
    setControlsVisible(false)
    alert('Press any key to exit fullscreen')
  }

  // When any key on the keyboard is pressed, unhide UI.
  const detectKeyDown = (e) => {
    setControlsVisible(true)
  }
  useEffect(() => {
    document.addEventListener('keydown', detectKeyDown, true)

    return () => {
      document.removeEventListener('keydown', detectKeyDown)
    }
  }, [])

  // Rerun this whenever the source, region, or visible layers changes
  useEffect(() => {
    if (terrierOvl === undefined) {
      return
    }

    // Clean up any existing layers
    // Note: Should make this more intelligent
    layers.forEach( (layer) => {
      layer.enable(false)
    })
    
    // We can have a simple list of variables or absolutely everything
    var variables = Terrier.variablesForStack()
    if (!displayAllLayers) {
      const toInclude = ["temperature", "wind_uv", "wind_speed_gust", "reflectivity", "visibility", "cloud_ceiling", "visual radar"]
      var newVariables = {}
      for (const [name, variable] of Object.entries(variables)) {
        toInclude.forEach((match) => {
          if (name.includes(match)) {
            newVariables[name] = variable
          }
        })
      }
      variables = newVariables
    }

    // Fake color map used for debugging
    function getRandomColor() {
      var letters = '0123456789ABCDEF';
      var color = '0xFF';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    function fakeColorMap() {
      var reflVal = []
      var colors = []
      var cmDisp = []
      for (let ii = 0; ii < 64; ii++) {
        reflVal.push(0.0 + ii)
        colors.push(getRandomColor())
        cmDisp.push(true)
      }
        return Terrier.createColorMap(reflVal, colors, cmDisp);
    }

    var newLayers = []
    for (let varName in variables) {
      let variable = variables[varName]
      var newLayer = null
      var sources = null
      // We can filter by region or source, optionally
      var searchParams = {variable: variable.name}
      // Filter to only a familiar set of sources that work well together
      var radarOnly = true
      if (!displayAllLayers) {
        if (variable.dataType != 'visual') {
          if (varName == 'reflectivity') {
            // Note: We can set radarOnly here to just see radar data
            if (radarOnly) {
              var radarRegion = region
              if (region == "All") {
                radarRegion = "conus"
              }

              // For radar we also want advected
              let mrms_refl = Terrier.sourcesForVariable({source:'mrms',
                                                          region:radarRegion,
                                                          product:'mcr',
                                                          variable:'reflectivity'})
              mrms_refl.forEach((src) => {
                  src['cadence'] = [-7200,-120,50]
                  src['enableForRange'] = [false,false]
              })
              
              let advect_mrms_refl = Terrier.sourcesForVariable({source:'mrms',
                                                          region:radarRegion,
                                                          product:'mcr',
                                                          variable:'reflectivity_advected'})
              advect_mrms_refl.forEach((src) => {
                  src['cadence'] = [-120,3600,15]
                  src['enableForRange'] = [true,false]
              })
              sources = mrms_refl.concat(advect_mrms_refl)

            } else {
              searchParams['source'] = ["gfs", "mrms", "hrrr"]
              searchParams['product'] = ["mbr", "atmos"]
            }
          } else {
            // Filtering down to these three sources will satisfy most people
            searchParams['source'] = ["gfs", "rtma", "hrrr"]
          }
        }
      }
      if (region != 'All') {
        searchParams['region'] = region
      }
      if (source != 'All') {
        searchParams['source'] = source
      }

      // We treat these variables as individual sources
      if (varName.includes('visual radar')) {
        searchParams['variable'] = 'radar'
        searchParams['source'] = variable.source.name
      }
      if (!sources) {
        sources = Terrier.sourcesForVariable(searchParams)
      }

      // For reflectivity we have the option of adding a temperature source for precip type
      var temperatureSources = null
      if (varName.includes('reflectivity')) {
        temperatureSources = Terrier.sourcesForVariable(
          {"source": ["gfs","hrrr"],
            "level": "2m",
           "variable": "temperature",
          })
      }

      // This can happen if we're filtering other things
      if (sources.length == 0) {
        continue
      }
      let colorMap = Terrier.colorMapForVariable(sources[0])
      let snowColorMap = Terrier.SNOW_COLORS_NOT_GREY
      let icon = iconForVariable(sources[0])
      let timeRange = timeRangeForVariable(sources[0])
      let levels = Terrier.variableLevelsForStack(sources[0].name)
      let interp = interpForVariable(sources[0])
      let snap = snapForVariable(sources[0])
      switch (variable.dataType) {
      case 'wind_uv':
        newLayer = new Layer(terrierOvl, 
            {'displayName': variable.name,
            'layerName': variable.name,
            'icon': icon,
            'sources': sources,
            'levels': levels,
            'units': variable.units,
            'colorsGrey': colorMap,
            'colors': colorMap,
            'arrows': {
              'cutoff': 1.0,
              'speed': [2.57, 40.0],
              'size': [[10,20],[40,80]],
              'layout': [80,80],
              'colors': [0xAA000000,0xFF000000],
            },
            'timeRange': timeRange,
            'interpMode': interp
            })                        
      break;
      case 'reflectivity':
        if (radarOnly) {
          timeRange = [-2*60*60,1*60*60,64]
        } else {
          timeRange = [-4*60*60,4*60*60,64]
        }
        newLayer = new Layer(terrierOvl, 
          {'displayName': variable.name,
          'layerName': variable.name,
          'icon': radarIcon,
          'sources': sources,
          // Turn this on to display snow
          'temperatureSources': temperatureSources,
          'levels': levels,
          'units': 'dBz',
          'colorsGrey': colorMap,
          'colors': colorMap,
          'snowColors': snowColorMap,
          'importanceScale': 16.0,
          'timeRange': timeRange,
          // The load callback lets us insert some logic when the manifest for a
          //  given data source loads.  You'll see more than one data source, depending
          //  on what you're displaying.
          // In this case we want to snap the displayed time range to the available
          //  data (first and last frame of radar) and then we want to snap current
          //  time to the last frame.
          'loadCallback': (manifest) => {
            // if (radarOnly) {
            //   // Ignore everything but the biggest region
            //   if (manifest.region != 'conus') {
            //     return
            //   }

            //   // The manifest has a list of time slices which we can interrogate
            //   let firstSlice = manifest.timeSlices[0]
            //   let lastSlice = manifest.timeSlices.slice(-1)[0]

            //   // Construct a new relative time range to display
            //   // Snap to the available time slices
            //   let newTimeRange = [firstSlice.forecastEpoch,lastSlice.forecastEpoch]
            //   terrierOvl.setTimeRange(newTimeRange[0]*1000,newTimeRange[1]*1000)
            //   setTimeRange(newTimeRange)

            //   // And snap to the end for the current time
            //   terrierOvl.setCurrentTime(lastSlice.forecastEpoch)
            // }
          }
          })
        break;
        case 'visual':
          // We can use defaults in most cases to display these
          newLayer = new Layer(terrierOvl, 
            {'displayName': variable.name,
            'layerName': variable.name,
            'icon': icon,
            'sources': sources,
            'levels': levels,
            'units': variable.units,
            'colorsGrey': colorMap,
            'colors': colorMap,
            'timeRange': timeRange,
            'interpMode': interp,
            // The load callback lets us insert some logic when the manifest for a
            //  given data source loads.  You'll see more than one data source, depending
            //  on what you're displaying.
            // In this case we want to snap the displayed time range to the available
            'loadCallback': (manifest) => {
                // The manifest has a list of time slices which we can interrogate
                let firstSlice = manifest.timeSlices[0]
                let lastSlice = manifest.timeSlices.slice(-1)[0]
                // Construct a new relative time range to display
                // Snap to the available time slices
                let newTimeRange = [firstSlice.forecastEpoch,lastSlice.forecastEpoch]
                terrierOvl.setTimeRange(newTimeRange[0]*1000,newTimeRange[1]*1000)
                setTimeRange(newTimeRange)
                // And snap to the end for the current time
                terrierOvl.setCurrentTime(lastSlice.forecastEpoch)
            }
          })                        
        break;
        default:
          // We can use defaults in most cases to display these
          newLayer = new Layer(terrierOvl, 
            {'displayName': variable.name,
            'layerName': variable.name,
            'icon': icon,
            'sources': sources,
            'levels': levels,
            'units': variable.units,
            'colorsGrey': colorMap,
            'colors': colorMap,
            'timeRange': timeRange,
            'interpMode': interp,
            'snapToFrame': snap
            })                        
            break;
      }
      if (newLayer) {
        newLayers.push(newLayer);
      }
    }

    setLayers(newLayers)
    if (newLayers.length > 0) {
      setCurLayer(0)
      _setUnits(newLayers[0].units)    
    }
  }, [displayAllLayers, source,sources,region,regions])

  // Called by the map component when Terrier has been properly set up
  let terrierReady = (ovl) => {
    setTerrierOvl(ovl)

    // Clean up any existing layers
    layers.forEach( (layer) => {
      layer.enable(false)
    })

    // let radarSources = Terrier.sourcesForVariable({product: 'mbr',
    //   level: '500m',
    //   variable: 'reflectivity'})
    // let temperatureSources = Terrier.sourcesForVariable({level: '2m',
    //   variable: 'temperature'})

    setSources(["All"].concat(Terrier.sourcesForStack()))
    setRegions(["All"].concat(Terrier.regionsForStack()))
    setBasemaps(["alidade_smooth","alidade_smooth_dark","alidade_satellite","outdoors","stamen_toner","stamen_terrain","osm_bright"])

    const now = Date.now() / 1000
    setCurTime(now)
  }

  // Called when the user clicks on the map
  const onMapClick = (e) => {
    const layers = Terrier.ovl.getLayers()
    if (layers.length > 0) {
      const layer = layers[0]
      const x = window.devicePixelRatio * e.point.x
      const y = window.devicePixelRatio * e.point.y
      const ret = layer.queryValue(x, y)
      if (ret != null) {
        setLegendValue(ret['value'])
        console.log("Map clicked at pix:(%d,%d), geo:(%f,%f) " + ret['value'].toString(), x, y, ret['lon'], ret['lat'])
      } else {
        setLegendValue(null)
        console.log("No data at %d, %d: ", x, y)
      }
}
  }

  // Change the units on the currently displayed layer
  let setUnits = (layer, newUnits) => {
    layer.units = newUnits
    _setUnits(layer.units)
  }

  // Decide if we can actually display a legend or the media controls
  const canDisplayLegend = legendVisible && curLayer >= 0 && curLayer < layers.length
  const canDisplayMediaControls = curTime != Number.NEGATIVE_INFINITY && layers.length > 0 && curLayer >= 0 && curLayer < layers.length

  return (
    <>
        {controlsVisible &&
          <>
            <Header>
              <a href='#' draggable='false' onClick={() => hidePage()}><img draggable='false' src={hideIcon} height='30px' /></a>
              <Burger icon={burgerIcon}>
                <Dropdown layers={layers} 
                          curLayer={curLayer} setCurLayer={setCurLayer} 
                          level={level} setLevel={setLevel}
                          legendVisible={legendVisible} setLegendVisible={setLegendVisible}
                          snapFrame={snapFrame} setSnapFrame={setSnapFrame}
                          animSpeed={animSpeed} setAnimSpeed={setAnimSpeed}
                          displayAllLayers={displayAllLayers} setDisplayAllLayers={setDisplayAllLayers}
                          source={source} sources={sources} setSource={setSource}
                          region={region} regions={regions} setRegion={setRegion}
                          stackName={stackName} setStackName={setStackName}
                          units={units} setUnits={setUnits}
                          baseMapName={baseMapName} basemaps={basemaps} setBaseMapName={setBaseMapName} />
              </Burger>
            </Header>

            {canDisplayMediaControls &&  
              <MediaControls curTime={displayedTime} setCurTime={setCurTime} timeRange={timeRange} 
                             isPlaying={isPlaying} 
                             setIsPlaying={setIsPlaying}
                             animSpeed={animSpeed} /> }
          </>
        }
        {canDisplayLegend 
          && <Legend colorMap={layers[curLayer].getColorMap()} units={units} value={legendValue}/>
        }
        <Map ref={map} 
             stackName={stackName} 
             readyFunc={terrierReady} 
             fullScreen={!controlsVisible}
             mapName={baseMapName}
             onClick={onMapClick} />
    </>
  )
}

export default App

/*
ICON LINKS
https://www.flaticon.com/free-icon/fullscreen_161728?term=fullscreen&page=1&position=5&origin=search&related_id=161728
https://www.flaticon.com/free-icon/thermometer_808602
https://www.flaticon.com/free-icon/wind_2011448
https://www.flaticon.com/free-icon/radar_614511
https://www.flaticon.com/free-icon-font/menu-burger_3917762
https://www.flaticon.com/free-icon/settings_3524659?term=settings&page=1&position=5&origin=search&related_id=3524659
*/