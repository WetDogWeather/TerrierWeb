import { createContext, useState, useEffect, useRef, createRef } from 'react'
import Terrier from "../terrier.js"

import Header from './components/Header/Header'
import Burger from './components/Header/Burger'
import Dropdown from './components/Dropdown/Dropdown'
import Legend from './components/Legend/Legend'
import MediaControls from './components/Media Controls/MediaControls'
import Map from './components/map.jsx';
import Layer from './Layers/Layer.jsx'
import TemperatureLayer from './Layers/TemperatureLayer.jsx'

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
  const [animSpeed, setAnimSpeed] = useState(0.0)
  const [timeRange,setTimeRange] = useState([0.0,0.0])
  const [curTime, setCurTime] = useState(Number.NEGATIVE_INFINITY)
  const [terrierOvl, setTerrierOvl] = useState(null)

  // Turn on the layer when someone messes with curLayer
  useEffect(() => {
    for (var layerId=0;layerId<layers.length;layerId++) {
      if (layerId != curLayer) {
        layers[layerId].enable(false)
      }
    }
    if (curLayer >= 0 && curLayer < layers.length) {
      const layer = layers[curLayer]
      layer.enable(true)

      const now = Date.now() / 1000

      // Update the time range
      setTimeRange([now+layer.timeRange[0],now+layer.timeRange[1]])
      if (curTime < layer.timeRange[0]) {
        setCurTime(layer.timeRange[0]+now)
      } else if (curTime >= layer.timeRange[1]) {
        setCurTime(layer.timeRange[1]+now)
      }
    } else {
      // Reset to empty
      setCurTime(Number.NEGATIVE_INFINITY)
      setTimeRange([0.0,0.0])
    }
  },[curLayer])

  // React to curTime changes
  useEffect(() => {
    if (curTime == Number.NEGATIVE_INFINITY) { return }
    if (terrierOvl == undefined) { return }
    terrierOvl.setCurrentTime(curTime)
  },[curTime])

  // Change the layer's color
  const setLayerColor = (layerId, colorMode) => {
    layers[layerId].colorUpdate(colored)
  }

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
    // Set up the layers we know about and enable the first one
    let newLayers = [new TemperatureLayer(ovl, 'Temperature', tempIcon, 'temperature', null, 'K', 
                         Terrier.TEMP_COLORS_GREY, Terrier.TEMP_COLORS_NOT_GREY,
                         [-1*24*60*60,1*24*60*60]),
                    new Layer(ovl, 'Wind', windIcon, 'windUV', null, 'm/s', 
                         Terrier.WIND_COLORS_GREY, Terrier.WIND_COLORS_NOT_GREY,
                         [-1*24*60*60,1*24*60*60]),
                    new Layer(ovl, 'Radar', radarIcon, 'radar', null, 'dBz', 
                         Terrier.RADAR_COLORS_GREY, Terrier.RADAR_COLORS_NOT_GREY,
                         [-1*60*60,0])]
    setLayers(newLayers)
    setCurLayer(0)
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
                <Dropdown layers={layers} curLayer={curLayer} setCurLayer={setCurLayer} 
                          animSpeed={animSpeed} setAnimSpeed={setAnimSpeed} 
                          legendVisible={legendVisible} setLegendVisible={setLegendVisible}
                          setLayerColor={setLayerColor} />
              </Burger>
            </Header>

            {canDisplayMediaControls &&  
              <MediaControls curTime={curTime} setCurTime={setCurTime} timeRange={timeRange} 
                             isPlaying={() => terrierOvl.isTimePlaying()} 
                             setIsPlaying={(enable) => enable ? terrierOvl.timePlay() : terrierOvl.timePlay() }
                             animSpeed={animSpeed} /> }
          </>
        }
        {canDisplayLegend 
          && <Legend colorMap={layers[curLayer].getColorMap()} units={layers[curLayer].getUnits()} />
        }
        <Map ref={map} readyFunc={terrierReady}/>
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