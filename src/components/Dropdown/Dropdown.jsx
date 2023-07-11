import { createContext, useContext, useState } from 'react'
import { GlobalStateContext } from '../../App'

import DropdownButton from './DropdownButton'
import DropdownContent from './DropdownContent'
import './dropdown.css'

import tempIcon from '../../assets/thermometer.png'
import windIcon from '../../assets/wind.png'
import radarIcon from '../../assets/radar.png'
import settingsIcon from '../../assets/settings.png'

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
                        <DropdownButton icon={tempIcon} newDropdownState='temp' newDisplayState='temp'>
                            <DropdownContent>
                                <h1>Temperature</h1>
                            </DropdownContent>
                        </DropdownButton>
                        <DropdownButton icon={windIcon} newDropdownState='wind' newDisplayState='wind' >
                            <DropdownContent>
                                <h1>Wind</h1>
                            </DropdownContent>
                        </DropdownButton>
                        <DropdownButton icon={radarIcon} newDropdownState='radar' newDisplayState='radar'>
                            <DropdownContent>
                                <h1>Radar</h1>
                            </DropdownContent>
                        </DropdownButton>
                        <DropdownButton icon={settingsIcon} newDropdownState='settings'>
                            <DropdownContent>
                                { /* I need to fix a lot of the line breaks in here. */}
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
                                <input type='range' id='animation-speed' min='0' max='99' value={globalState.animSpeed * 10} onChange={(e) => updateAnimSpeed(e)}/>
                                <br /><br />
                                { /* Temporarily here, will find a true home for the attributions or we will buy some. */ }
                                <p>Attributions for icons. This is a temporary spot for them. Exact URLs in App.jsx.</p>
                                <a href="https://www.flaticon.com/free-icons/fullscreen" title="fullscreen icons">Fullscreen icons created by Vectors Market - Flaticon</a><br/><br/>
                                <a href="https://www.flaticon.com/free-icons/weather" title="weather icons">Weather icons created by hirschwolf - Flaticon</a><br/><br/>
                                <a href="https://www.flaticon.com/free-icons/wind" title="wind icons">Wind icons created by Freepik - Flaticon</a><br/><br/>
                                <a href="https://www.flaticon.com/free-icons/radar" title="radar icons">Radar icons created by Freepik - Flaticon</a><br/><br/>
                                <a href="https://www.flaticon.com/free-icons/settings" title="settings icons">Settings icons created by Pixel perfect - Flaticon</a><br/><br/>
                                <a href="https://www.flaticon.com/free-icon-font/menu-burger_3917762">Burger icon (free even without attribution)</a>
                            </DropdownContent>
                        </DropdownButton>
                    </ul>
                </nav>
            </DropdownStateContext.Provider>
        </>
    )
}

export default Dropdown