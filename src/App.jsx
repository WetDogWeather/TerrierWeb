import { createContext, useState, useEffect } from 'react'
import { HelmetProvider, Helmet } from 'react-helmet-async'
import throttle from 'lodash.throttle'

//import Map from './components/Map/Map'
import Header from './components/Header/Header'
import Burger from './components/Header/Burger'
import Dropdown from './components/Dropdown/Dropdown'
import Legend from './components/Legend/Legend'
import MediaControls from './components/Media Controls/MediaControls'

import burgerIcon from './assets/menu-burger.png'
import hideIcon from './assets/hide.png'

import tempIcon from './assets/thermometer.png'
import windIcon from './assets/wind.png'
import radarIcon from './assets/radar.png'

import Layer from './layers/Layer.js'
import { TEMP_COLORS_GREY, TEMP_COLORS_NOT_GREY } from './layers/ColorMaps.js'
import { WIND_COLORS_GREY, WIND_COLORS_NOT_GREY } from './layers/ColorMaps.js'
import { RADAR_COLORS_GREY, RADAR_COLORS_NOT_GREY } from './layers/ColorMaps.js'

export const GlobalStateContext = createContext()

const initGlobalState = {
  mapState: 0,                // 0 = temperature, 1 = wind, 2 = radar
  legendTempUnits: 'K',       // K, C, or F
  animSpeed: 1,               // 0.0x - 9.9x, always to 1 decimal place
  controlsVisible: true,
  initalized: false,

  layers: [new Layer('Temperature', tempIcon, Module, 'tempCtl', 'enableTemp', 'K', TEMP_COLORS_GREY, TEMP_COLORS_NOT_GREY),
  new Layer('Wind', windIcon, Module, 'windCtl', 'enableWind', 'm/s', WIND_COLORS_GREY, WIND_COLORS_NOT_GREY),
  new Layer('Radar', radarIcon, Module, 'radarCtl', 'enableRadar', 'dBz', RADAR_COLORS_GREY, RADAR_COLORS_NOT_GREY)]
}

var init = false;

function App() {

  console.log(' -- App.jsx rendered')

  const [globalState, setGlobalState] = useState(initGlobalState) // Object containing keys / values in initialGlobalState is shared across many components at the same time.

  if (!init) {
    var initializationFunction = (ov) => {
      globalState.layers[0].enable(true);
      setTimeout(() => {
        ["ne_50m_admin_0_countries", "ne_50m_admin_1_states_provinces"].forEach(c =>
          fetch("geojson/" + c + ".geojson").then(result =>
            result.text().then(t => {
              console.debug("Adding " + c + ".geojson")
              ov.addGeoJSON(t);
            })));
      }, 1000);
    };

    // This code might need work
    if (Module.emInitialized == true) {
      console.log('Module.emInitialized is true')
      setTimeout(() => {
        initializationFunction(Module.overlay)
      }, 50)
    } else {
      console.log('Module.emInitialized is false')
      Module.onOverlayInitialized = initializationFunction
    }
    init = true;
  }

  function hidePage() {
    setGlobalState({ ...globalState, controlsVisible: false })
    alert('Press any key to exit fullscreen')
  }

  // When any key on the keyboard is pressed, unhide UI.
  useEffect(() => {
    document.addEventListener('keydown', detectKeyDown, true)
  }, [])
  const detectKeyDown = (e) => {
    setGlobalState(globalState => { return { ...globalState, controlsVisible: true } }) // This nested function prevents the detectKeyDown from reading the default globalState.
  }

  return (
    <>
      <GlobalStateContext.Provider value={[globalState, setGlobalState]}> {/* Every component within these brackets has access to globalState and setGlobalState */}
        {globalState.controlsVisible &&
          <>
            <Header>
              <a href='#' draggable='false' onClick={() => hidePage()}><img draggable='false' src={hideIcon} height='30px' /></a>
              <Burger icon={burgerIcon}>
                <Dropdown />
              </Burger>
            </Header>

            <MediaControls />
          </>
        }
        <Legend />
      </GlobalStateContext.Provider>
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