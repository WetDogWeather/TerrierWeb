import { createContext, useState, useEffect } from 'react'
import debounce from 'lodash.debounce'

import Header from './components/Header/Header'
import Burger from './components/Header/Burger'
import Dropdown from './components/Dropdown/Dropdown'
import Legend from './components/Legend/Legend'
import MediaControls from './components/Media Controls/MediaControls'

import burgerIcon from './assets/menu-burger.png'
import hideIcon from './assets/hide.png'

import { tempColorUpdate, tempDataSampleUpdate, tempRenderSampleUpdate, tempMinImportanceUpdate, tempOpacityUpdate } from './MapUtils'
import { windColorUpdate, windDataSampleUpdate, windRenderSampleUpdate, windMinImportanceUpdate, windOpacityUpdate } from './MapUtils'
import { radarColorUpdate, radarDataSampleUpdate, radarRenderSampleUpdate, radarMinImportanceUpdate, radarOpacityUpdate } from './MapUtils'


export const GlobalStateContext = createContext()

const initGlobalState = {
  mapState: 'none',           // none, temp, wind, or radar
  tempColored: true,
  tempDataSampleType: 1,      // 0 = Nearest, 1 = Linear, 2 = Cubic.
  tempRenderSampleType: 1,    // 0 = Nearest, 1 = Linear, 2 = Cubic.
  tempOpacity: 192,           // 0 - 255.
  tempMinImportance: 10,      // 5 - 100.
  windColored: true,
  windDataSampleType: 1,      // 0 = Nearest, 1 = Linear, 2 = Cubic.
  windRenderSampleType: 1,    // 0 = Nearest, 1 = Linear, 2 = Cubic.
  windOpacity: 192,           // 0 - 255.
  windMinImportance: 10,      // 5 - 100.
  radarColored: true,
  radarDataSampleType: 1,     // 0 = Nearest, 1 = Linear, 2 = Cubic.
  radarRenderSampleType: 1,   // 0 = Nearest, 1 = Linear, 2 = Cubic.
  radarOpacity: 192,           // 0 - 255.
  radarMinImportance: 10,      // 5 - 100.
  legendTempUnits: 'K',       // K, C, or F
  animSpeed: 1,               // 0.0x - 9.9x, always to 1 decimal place
  controlsVisible: true
}

function App() {

  const [globalState, setGlobalState] = useState(initGlobalState) // Object containing keys / values in initialGlobalState is shared across many components at the same time.

  // When the globalState changes, run the code here.
  useEffect(() => {
    debounceHandler(globalState)
  })

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

// This is poorly implemented. Since the debounce is 1 second, any update to the map will take at least
// 1 second before the update is actually called. I'm not sure how to fix this, I want to get the function
// to run immedietely and then stop all new calls within a 1 second timeframe, but I don't know enough about
// debouncing to get that to work. One solution might be to get only debounce if the mapState changed, but I'm
// unsure if that should be a variable in globalState, which I believe will update the UI several times any time
// the buttons are clicked, which is inefficient.
//
// Should I look into throttling? I don't know what that is but it seems like an alternative to debounce.
// ^ Throttling instead of debouncing looks promising.
const debounceHandler = debounce((globalState) => {
  switch (globalState.mapState) {

    case 'temp':
      Module.enableTemp = true;

      Module.enableWind = false;
      Module.enableRadar = false;

      tempColorUpdate(globalState.tempColored);
      tempDataSampleUpdate(globalState.tempDataSampleType);
      tempRenderSampleUpdate(globalState.tempRenderSampleType);
      tempOpacityUpdate(globalState.tempOpacity);
      tempMinImportanceUpdate(globalState.tempMinImportance);
      break;

    case 'wind':
      Module.enableWind = true;

      Module.enableTemp = false;
      Module.enableRadar = false;

      windColorUpdate(globalState.windColored);
      windDataSampleUpdate(globalState.windDataSampleType);
      windRenderSampleUpdate(globalState.windRenderSampleType);
      windOpacityUpdate(globalState.windOpacity);
      windMinImportanceUpdate(globalState.windMinImportance);
      break;

    case 'radar':
      Module.enableRadar = true;

      Module.enableTemp = false;
      Module.enableWind = false;

      radarColorUpdate(globalState.radarColored);
      radarDataSampleUpdate(globalState.radarDataSampleType);
      radarRenderSampleUpdate(globalState.radarRenderSampleType);
      radarOpacityUpdate(globalState.radarOpacity);
      radarMinImportanceUpdate(globalState.radarMinImportance);
      break;

    default:
      break;
  }
  Module.updateOverlay();
}, 1000);

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