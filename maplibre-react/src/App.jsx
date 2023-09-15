import { createContext, useState, useEffect } from 'react'

import Header from './components/Header/Header'
import Burger from './components/Header/Burger'
import Dropdown from './components/Dropdown/Dropdown'
import Legend from './components/Legend/Legend'
import MediaControls from './components/Media Controls/MediaControls'
import Map from './components/map.jsx';

import burgerIcon from './assets/menu-burger.png'
import hideIcon from './assets/hide.png'

var init = false;

export const GlobalStateContext = createContext()

function App() {

  const initGlobalState = {
    mapState: 0,                // 0 = temperature, 1 = wind, 2 = radar
    animSpeed: 1,               // 0.0x - 9.9x, always to 1 decimal place
    controlsVisible: true,
    legendVisible: true,
    defaultTime: -1,            // Place to store string of date from curTime. This is set in MediaControls.jsx

    layers: [],
  }

  const [globalState, setGlobalState] = useState(initGlobalState) // Object containing keys / values in initialGlobalState is shared across many components at the same time.

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

            {/* <MediaControls /> */}
          </>
        }
        {globalState.legendVisible 
          && <Legend />
        }
        <Map/>
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