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
import windIcon from './assets/wind.png'
import radarIcon from './assets/radar.png'
import burgerIcon from './assets/menu-burger.png'
import hideIcon from './assets/hide.png'

export const AppContext = createContext()

function App() {
  const [controlsVisible, setControlsVisible] = useState(true)
  const [legendVisible, setLegendVisible] = useState(true)
  const [legendValue, setLegendValue] = useState(null)
  const [snapFrame, setSnapFrame] = useState(false)
  const [curLayer, setCurLayer] = useState(-1)
  const [layers, setLayers] = useState([])
  const [level, setLevel] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [animSpeed, setAnimSpeed] = useState(4.0)
  const [timeRange,setTimeRange] = useState([0.0,0.0])
  const [curTime, setCurTime] = useState(Number.NEGATIVE_INFINITY)
  const [displayedTime, setDisplayedTime] = useState(Number.NEGATIVE_INFINITY)
  const [terrierOvl, setTerrierOvl] = useState(null)
  const [units, _setUnits] = useState('')
  const [stackName, setStackName] = useState('dev')

  // React to stackName changes
  useEffect(() => {
    // Turn off our layers
    setLayers([])
    setCurLayer(-1)

    Terrier.changeStack(stackName, (ovl) => {
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
  },[curLayer])

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

  // Called by the map component when Terrier has been properly set up
  let terrierReady = (ovl) => {
    setTerrierOvl(ovl)

    // Clean up any existing layers
    layers.forEach( (layer) => {
      layer.enable(false)
    })

    let feetToMeters = 1/3.28084
    let cloudColorMap = Terrier.createColorMap(
      [0.0*feetToMeters,500.0*feetToMeters,
        500.0*feetToMeters,900.0*feetToMeters,
        900.0*feetToMeters,1000.0*feetToMeters,
        1000.0*feetToMeters,3000.0*feetToMeters,
        3000.0*feetToMeters,4000.0*feetToMeters,
        4000.0*feetToMeters,
        5000.0*feetToMeters,6000.0*feetToMeters,
        6000.0*feetToMeters
      ],
      [0xff800000,0xffE63222,
        0xffFFFF55,0xffFFFF55,
        0xffED702E,0xffED702E,
        0xff01007B,0xff01007B,
        0xff75FB4C,0xff75FB4C,
        0xff75FB4C,
        0xff2A6318,0xff2A6318,
        0x00000000
      ])
    let statMileToMeters = 1609.34
    let visColorMap = Terrier.createColorMap(
      [0*statMileToMeters,1*statMileToMeters,
       1*statMileToMeters,3*statMileToMeters,
       3*statMileToMeters,5*statMileToMeters,
       5*statMileToMeters,
       7*statMileToMeters,
       8*statMileToMeters,9*statMileToMeters,
       9*statMileToMeters
      ],
      [0xff800000,0xff800000,
        0xffE63222,0xffE63222,
        0xffFFFF55,0xffFFFF55,
        0xff75FB4C,
        0xff3A8323,
        0xff113208,0xff113208,
        0x00000000
      ])
    let percentColorMap = Terrier.createColorMap(
      [0.0,100.0],
      [0x00666666,0xff666666]
    )
    let hgToPa = 3386.39
    let pressureColorMap = Terrier.createColorMap(
      [29.9*hgToPa,30.4*hgToPa],
      [0x00666666,0xff666666]
    )

    // Set up the layers we know about and enable the first one
    let newLayers = [new Layer(ovl, 
                      {'displayName': 'Temperature',
                      'layerName': 'temperature',
                      'icon': tempIcon,
                      'levels': Terrier.variableLevelsForStack('temperature'),
                      'units': 'C',
                      'colorsGrey': Terrier.TEMP_COLORS_GREY,
                      'colors': Terrier.TEMP_COLORS_NOT_GREY,
                      'timeRange': [-1*24*60*60,1*24*60*60,32]
                      }),
                    new Layer(ovl, 
                      {'displayName': 'Wind',
                      'layerName': 'windUV',
                      'icon': windIcon,
                      'levels': Terrier.variableLevelsForStack('wind_uv'),
                      'units': 'm/s',
                      'colorsGrey': Terrier.WIND_COLORS_GREY,
                      'colors': Terrier.WIND_COLORS_NOT_GREY,
                      'timeRange': [-1*24*60*60,1*24*60*60,32]
                      }),                              
                    new Layer(ovl, 
                      {'displayName': 'WindGust',
                      'layerName': 'WindGust',
                      'icon': windIcon,
                      'levels': Terrier.variableLevelsForStack('wind_speed_gust'),
                      'units': 'm/s',
                      'colorsGrey': Terrier.WIND_COLORS_GREY,
                      'colors': Terrier.WIND_COLORS_NOT_GREY,
                      'timeRange': [-1*24*60*60,1*24*60*60,32]
                      }),                              
                      new Layer(ovl, 
                      {'displayName': 'Radar',
                      'layerName': 'radar',
                      'icon': radarIcon,
                      'levels': Terrier.variableLevelsForStack('radar'),
                      'units': 'dBz',
                      'colorsGrey': Terrier.RADAR_COLORS_GREY,
                      'colors': Terrier.RADAR_COLORS_NOT_GREY,
                      'timeRange': [-4*60*60,0,64],
                      // The load callback lets us insert some logic when the manifest for a
                      //  given data source loads.  You'll see more than one data source, depending
                      //  on what you're displaying.
                      // In this case we want to snap the displayed time range to the available
                      //  data (first and last frame of radar) and then we want to snap current
                      //  time to the last frame.
                      'loadCallback': (manifest) => {
                        // Ignore everything but the biggest region
                        if (manifest.region != 'conus') {
                          return
                        }

                        // The manifest has a list of time slices which we can interrogate
                        let firstSlice = manifest.timeSlices[0]
                        let lastSlice = manifest.timeSlices.slice(-1)[0]

                        // Construct a new relative time range to display
                        // Snap to the available time slices
                        let newTimeRange = [firstSlice.forecastEpoch,lastSlice.forecastEpoch]
                        ovl.setTimeRange(newTimeRange[0]*1000,newTimeRange[1]*1000)
                        setTimeRange(newTimeRange)

                        // And snap to the end for the current time
                        ovl.setCurrentTime(lastSlice.forecastEpoch)
                      }
                      }),
                    // new Layer(ovl, 
                    //   {'displayName': 'Cloud Ceiling',
                    //   'layerName': 'CloudCeiling',
                    //   'icon': windIcon,
                    //   'levels': Terrier.variableLevelsForStack('CloudCeiling'),
                    //   'units': 'm',
                    //   'colorsGrey': cloudColorMap,
                    //   'colors': cloudColorMap,
                    //   'timeRange': [-1*24*60*60,1*24*60*60,64],
                    //   }),                              
                    // new Layer(ovl, 
                    //   {'displayName': 'Cloud Cover',
                    //   'layerName': 'CloudCover',
                    //   'icon': windIcon,
                    //   'levels': Terrier.variableLevelsForStack('CloudCover'),
                    //   'units': '%',
                    //   'colorsGrey': percentColorMap,
                    //   'colors': percentColorMap,
                    //   'timeRange': [-1*24*60*60,1*24*60*60,64],
                    //   }),                              
                    // new Layer(ovl, 
                    // {'displayName': 'Visibility',
                    // 'layerName': 'Visibility',
                    // 'icon': windIcon,
                    // 'levels': Terrier.variableLevelsForStack('Visibility'),
                    // 'units': 'm',
                    // 'colorsGrey': visColorMap,
                    // 'colors': visColorMap,
                    // 'timeRange': [-1*24*60*60,1*24*60*60,64],
                    // }),          
                    // new Layer(ovl, 
                    //   {'displayName': 'Pressure',
                    //   'layerName': 'Pressure',
                    //   'icon': windIcon,
                    //   'levels': Terrier.variableLevelsForStack('Pressure'),
                    //   'units': 'Pa',
                    //   'colorsGrey': pressureColorMap,
                    //   'colors': pressureColorMap,
                    //   'timeRange': [-1*24*60*60,1*24*60*60,64],
                    //   }),          
                    // new Layer(ovl, 
                    //   {'displayName': 'visual',
                    //   'layerName': 'visual',
                    //   'icon': radarIcon,
                    //   'units': 'dBz',
                    //   'importanceScale': 8.0,
                    //   'source': {
                    //     model: 'myradar',
                    //     region: 'global',
                    //     variable: 'reflectivity'
                    //   },
                    //   'loadCallback': (manifest) => {
                    //     // The manifest has a list of time slices which we can interrogate
                    //     let lastSlice = manifest.timeSlices.slice(-1)[0]

                    //     // Construct a new relative time range to display
                    //     // Snap to the current time and the last available time slice
                    //     let now = Date.now()/1000
                    //     let newTimeRange = [now,lastSlice.forecastEpoch]
                    //     ovl.setTimeRange(newTimeRange[0]*1000,newTimeRange[1]*1000)
                    //     setTimeRange(newTimeRange)

                    //     // And snap to the end for the current time
                    //     ovl.setCurrentTime(now)
                    //   }
                    //   })
                    ]
    setLayers(newLayers)
    setCurLayer(0)
    _setUnits(newLayers[0].units)  
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
      setLegendValue(ret['value'])
      console.log("Map clicked %d, %d: " + ret['value'].toString(), x, y)
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
                          stackName={stackName} setStackName={setStackName}
                          units={units} setUnits={setUnits} />
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