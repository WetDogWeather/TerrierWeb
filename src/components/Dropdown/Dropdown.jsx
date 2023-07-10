import { createContext, useContext, useState } from 'react'
import { GlobalStateContext } from '../../App'

import DropdownButton from './DropdownButton'
import DropdownContent from './DropdownContent'
import './dropdown.css'

export const DropdownStateContext = createContext()


function Dropdown(props) {

    const [globalState, setGlobalState] = useContext(GlobalStateContext)
    const [dropdownState, setDropdownState] = useState( (globalState.mapState == 'none') ? 'temp' : globalState.mapState )

    function updateTempUnits(val) {
        setGlobalState({...globalState, legendTempUnits: val})
    }

    const updateAnimSpeed = (e) => {
        var newSpeed = e.target.value / 10
        console.log(newSpeed)
        setGlobalState({...globalState, animSpeed: newSpeed})
    }

    return (
        <>
            <DropdownStateContext.Provider value={[dropdownState, setDropdownState]}>
                <nav className='dropdown'>
                    <ul className='dropdown-nav'>
                        <DropdownButton icon='T' newDropdownState='temp' newDisplayState='temp'>
                            <DropdownContent>
                                <h1>Temperature</h1>
                            </DropdownContent>
                        </DropdownButton>
                        <DropdownButton icon='W' newDropdownState='wind' newDisplayState='wind' >
                            <DropdownContent>
                                <h1>Wind</h1>
                            </DropdownContent>
                        </DropdownButton>
                        <DropdownButton icon='R' newDropdownState='radar' newDisplayState='radar'>
                            <DropdownContent>
                                <h1>Radar</h1>
                            </DropdownContent>
                        </DropdownButton>
                        <DropdownButton icon='S' newDropdownState='settings'>
                            <DropdownContent>
                                <h1>Settings</h1>
                                <br />
                                <input type='radio' id='kelvin' name='temp-units' onClick={() => updateTempUnits('K')} defaultChecked={globalState.legendTempUnits == 'K'}/>
                                <label for='kelvin'>Kelvin</label><br />
                                <input type='radio' id='celsius' name='temp-units' onClick={() => updateTempUnits('C')} defaultChecked={globalState.legendTempUnits == 'C'}/>
                                <label for='celsius'>Celsius</label><br />
                                <input type='radio' id='fahrenheit' name='temp-units' onClick={() => updateTempUnits('F')} defaultChecked={globalState.legendTempUnits == 'F'}/>
                                <label for='fahrenheit'>Fahrenheit</label><br />
                                <br />
                                <p>Animation Speed</p>
                                <input type='range' id='animation-speed' min='0' max='100' value={globalState.animSpeed * 10} onChange={(e) => updateAnimSpeed(e)}/>
                            </DropdownContent>
                        </DropdownButton>
                    </ul>
                </nav>
            </DropdownStateContext.Provider>
        </>
    )
}

export default Dropdown