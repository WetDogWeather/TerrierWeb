import { createContext, useState, useEffect } from 'react'

import Header from './components/Header/Header'
import Burger from './components/Header/Burger'
import Dropdown from './components/Dropdown/Dropdown'
import Map from './components/Map/Map'
import Legend from './components/Legend/Legend'
import MediaControls from './components/Media Controls/MediaControls'

export const GlobalStateContext = createContext()

const initGlobalState = {
  mapState: 'none',           // none, temp, wind, or radar
  legendTempUnits: 'K',       // K, C, or F
  animSpeed: 0.5,             // 0x - 10x, to 1 decimal place
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
              <button onClick={() => setGlobalState({...globalState, controlsVisible: false})}>Hide/Unhide Controls</button>
              <Burger icon='Dropdown'>
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