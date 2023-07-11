import { createContext, useState, useEffect } from 'react'

import Header from './components/Header/Header'
import Burger from './components/Header/Burger'
import Dropdown from './components/Dropdown/Dropdown'
import Map from './components/Map/Map'
import Legend from './components/Legend/Legend'
import MediaControls from './components/Media Controls/MediaControls'

import burgerIcon from './assets/menu-burger.png' // Maybe move this into the Burger class?
import hideIcon from './assets/hide.png'

export const GlobalStateContext = createContext()

const initGlobalState = {
  mapState: 'none',           // none, temp, wind, or radar
  legendTempUnits: 'K',       // K, C, or F
  animSpeed: 1,             // 0.0x - 9.9x, always to 1 decimal place
  controlsVisible: true
}

function App() {

  const [globalState, setGlobalState] = useState(initGlobalState) // Object containing keys / values in initialGlobalState is shared across many components at the same time.

  // When any key on the keyboard is pressed, unhide UI. (This still needs to be communicated to the user visually)
  useEffect(() => {
    document.addEventListener('keydown', detectKeyDown, true)
  }, [])

  const detectKeyDown = (e) => {
    setGlobalState(globalState => {return {...globalState, controlsVisible: true} }) // This nested function prevents the detectKeyDown from reading the default globalState.
  }

  return (
    <>
      <Map />
      <GlobalStateContext.Provider value={[globalState, setGlobalState]}> {/* Every component within these brackets has access to globalState and setGlobalState */}
        {globalState.controlsVisible &&
          <>
            <Header>
              <a href='#' onClick={() => setGlobalState({...globalState, controlsVisible: false})}><img src={hideIcon} height='50px' /></a>
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