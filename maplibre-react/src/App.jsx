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
  const [curLayer, setCurLayer] = useState(-1)
  const [layers, setLayers] = useState([])
  const [level, setLevel] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [animSpeed, setAnimSpeed] = useState(4.0)
  const [timeRange,setTimeRange] = useState([0.0,0.0])
  const [curTime, setCurTime] = useState(Number.NEGATIVE_INFINITY)
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
      setTimeRange([now+layer.timeRange[0],now+layer.timeRange[1]])
      if (curTime < layer.timeRange[0]+now) {
        setCurTime(layer.timeRange[0]+now)
      } else if (curTime >= layer.timeRange[1]+now) {
        setCurTime(layer.timeRange[1]+now)
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

  // React to curTime changes
  useEffect(() => {
    if (curTime == Number.NEGATIVE_INFINITY) { return }
    if (terrierOvl == undefined) { return }
    terrierOvl.setCurrentTime(curTime)
  },[curTime])

  // React to isPlaying changes
  useEffect(() => {
    if (terrierOvl == undefined) { return }
    if (isPlaying) {
      terrierOvl.timePlay({'period': 30.0 / animSpeed})
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
    if (!isPlaying) { return }
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

    let feetToMeters = 3.28084
    let cloudColorMap = Terrier.createColorMap(
      [0.0*feetToMeters,500.0*feetToMeters,900.0*feetToMeters,1000.0*feetToMeters,300.0*feetToMeters,4000.0*feetToMeters,5000.0*feetToMeters],
      [0xff800000,0xffff0000,0xffffff00,0xffff6600,0xff000080,0xff003300,0xff006400])

    // Set up the layers we know about and enable the first one
    let newLayers = [new Layer(ovl, 'Temperature', tempIcon, 'temperature', 
                        Terrier.variableLevelsForStack('temperature'), 
                        'C', Terrier.TEMP_COLORS_GREY, Terrier.TEMP_COLORS_NOT_GREY,
                        [-1*24*60*60,1*24*60*60,32]),
                    new Layer(ovl, 'Wind', windIcon, 'windUV', 
                        Terrier.variableLevelsForStack('wind_uv'), 
                        'm/s', Terrier.WIND_COLORS_GREY, Terrier.WIND_COLORS_NOT_GREY,
                          [-1*24*60*60,1*24*60*60,32]),
                    // new Layer(ovl, 'Wind Gust', windIcon, 'WindGust', 
                    //     Terrier.variableLevelsForStack('windgust'), 
                    //     'm/s', Terrier.WIND_COLORS_GREY, Terrier.WIND_COLORS_NOT_GREY,
                    //       [-1*24*60*60,1*24*60*60,64]),
                    new Layer(ovl, 'Radar', radarIcon, 'radar', 
                        Terrier.variableLevelsForStack('radar'), 
                        'dBz', Terrier.RADAR_COLORS_GREY, Terrier.RADAR_COLORS_NOT_GREY,
                          [-2*60*60,0,64], 30),
                    // new Layer(ovl, 'Cloud Ceiling', windIcon, 'CloudCeiling', 
                    //     Terrier.variableLevelsForStack('CloudCeiling'), 
                    //     'm', cloudColorMap, cloudColorMap,
                    //     [-1*24*60*60,1*24*60*60,64]),
                    // new Layer(ovl, 'Visibility', windIcon, 'Visibility', 
                    //     Terrier.variableLevelsForStack('Visibility'), 
                    //     'm', cloudColorMap, cloudColorMap,
                    //     [-1*24*60*60,1*24*60*60,64]),
                    // new Layer(ovl, 'visual', radarIcon, 'visual', 
                    //     null, 
                    //     'dBz', null, null,
                    //     [0.0,60*60,12],
                    //     8.0,
                    //     {
                    //       model: 'myradar',
                    //       region: 'global',
                    //       variable: 'reflectivity'
                    //     })
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
                          animSpeed={animSpeed} setAnimSpeed={setAnimSpeed}
                          stackName={stackName} setStackName={setStackName}
                          units={units} setUnits={setUnits} />
              </Burger>
            </Header>

            {canDisplayMediaControls &&  
              <MediaControls curTime={curTime} setCurTime={setCurTime} timeRange={timeRange} 
                             isPlaying={isPlaying} 
                             setIsPlaying={setIsPlaying}
                             animSpeed={animSpeed} /> }
          </>
        }
        {canDisplayLegend 
          && <Legend colorMap={layers[curLayer].getColorMap()} units={units} />
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