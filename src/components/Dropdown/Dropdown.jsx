import { createContext, useContext, useState } from 'react'
import { GlobalStateContext } from '../../App'

import DropdownButton from './DropdownButton'
import DropdownContent from './DropdownContent'
import './dropdown.css'

import settingsIcon from '../../assets/settings.png'
import attributionIcon from '../../assets/copyright.png'

export const DropdownStateContext = createContext()

function Dropdown(props) {

    console.log(' -- Dropdown.jsx rendered')

    const [globalState, setGlobalState] = useContext(GlobalStateContext)
    const [dropdownState, setDropdownState] = useState(globalState.mapState) // Defaults dropdown to the temperature content when dropdown is openned for the first time.

    const updateAnimSpeed = (e) => {
        var newSpeed = e.target.value / 10 // Animation speed range goes from 1-99, but the real values that interact with the code should be 0.1-9.9
        Module.setPlayInterval(99 - e.target.value | 0 + 1) // 99 is the max value of the animation speed range
        setGlobalState({ ...globalState, animSpeed: newSpeed })
    }

    var dropdown

    // Generating dropdown menu based on layers
    for (var i = 0; i < globalState.layers.length; i++) {
        const id = i; // Constant so that the onClick events don't read the final value of i.
        var content = (
            <>
                <DropdownButton icon={ globalState.layers[id].getIcon() } newDropdownState={id} newMapState={id}>
                    <DropdownContent>
                        <h1> { globalState.layers[id].getDisplayName() } </h1>
                        <h3>Colors</h3>
                        <div className='dropdown-input'>
                            <input type='radio' id='wind-grey' name='color' onClick={() => globalState.layers[id].colorUpdate(false)} defaultChecked={!globalState.layers[id].colored} />
                            <label for='wind-grey'>Grey</label>
                            <input type='radio' id='wind-color' name='color' onClick={() => globalState.layers[id].colorUpdate(true)} defaultChecked={globalState.layers[id].colored} />
                            <label for='wind-color'>Color</label><br />
                        </div>
                        <h3>Data Sample Type</h3>
                        <div className='dropdown-input'>
                            <input type='radio' id='wind-variable-nearest' name='variable' onClick={() => globalState.layers[id].dataSampleUpdate(0)} defaultChecked={(globalState.windDataSampleType == 0)} />
                            <label for='wind-variable-nearest'>Nearest</label>
                            <input type='radio' id='wind-variable-linear' name='variable' onClick={() => globalState.layers[id].dataSampleUpdate(1)} defaultChecked={(globalState.windDataSampleType == 1)} />
                            <label for='wind-variable-linear'>Linear</label>
                            <input type='radio' id='wind-variable-cubic' name='variable' onClick={() => globalState.layers[id].dataSampleUpdate(2)} defaultChecked={(globalState.windDataSampleType == 2)} disabled />
                            <label for='wind-variable-cubic'>Cubic</label><br />
                        </div>
                        <h3>Render Sample Type</h3>
                        <div className='dropdown-input'>
                            <input type='radio' id='wind-render-nearest' name='render' onClick={() => globalState.layers[id].renderSampleUpdate(0)} defaultChecked={(globalState.windRenderSampleType == 0)} />
                            <label for='wind-render-nearest'>Nearest</label>
                            <input type='radio' id='wind-render-linear' name='render' onClick={() => globalState.layers[id].renderSampleUpdate(1)} defaultChecked={(globalState.windRenderSampleType == 1)} />
                            <label for='wind-render-linear'>Linear</label>
                            <input type='radio' id='wind-render-cubic' name='render' onClick={() => globalState.layers[id].renderSampleUpdate(2)} defaultChecked={(globalState.windRenderSampleType == 2)} disabled />
                            <label for='wind-render-cubic'>Cubic</label><br />
                        </div>
                        <p>Opacity</p>
                        <input type='range' min='0' max='255' defaultValue={globalState.windOpacity} onChange={(e) => globalState.layers[id].opacityUpdate(e.target.value)} />
                        <p>Min Importance</p>
                        <input type='range' min='5' max='100' defaultValue={globalState.windMinImportance} onChange={(e) => globalState.layers[id].minImportanceUpdate(e.target.value)} />
                        <br />
                    </DropdownContent>
                </DropdownButton>
            </>
        )
        dropdown = [dropdown, content]
    }

    return (
        <>
            <DropdownStateContext.Provider value={[dropdownState, setDropdownState]}>
                <nav className='dropdown'>
                    <ul className='dropdown-nav'>
                        {dropdown}
                        <DropdownButton icon={settingsIcon} newDropdownState='settings'>
                            <DropdownContent>
                                { /* I need to fix a lot of the line breaks in here. */}
                                <h1>Settings</h1>
                                <br />
                                <input type='radio' id='kelvin' name='temp-units' onClick={() => setGlobalState({ ...globalState, legendTempUnits: 'K' })} defaultChecked={globalState.legendTempUnits == 'K'} />
                                <label for='kelvin'>Kelvin</label><br />
                                <input type='radio' id='celsius' name='temp-units' onClick={() => setGlobalState({ ...globalState, legendTempUnits: 'C' })} defaultChecked={globalState.legendTempUnits == 'C'} />
                                <label for='celsius'>Celsius</label><br />
                                <input type='radio' id='fahrenheit' name='temp-units' onClick={() => setGlobalState({ ...globalState, legendTempUnits: 'F' })} defaultChecked={globalState.legendTempUnits == 'F'} />
                                <label for='fahrenheit'>Fahrenheit</label><br />
                                <br />
                                <p>Animation Speed</p>
                                <input type='range' id='animation-speed' min='0' max='99' value={globalState.animSpeed * 10} onChange={(e) => updateAnimSpeed(e)} />
                                <br /><br />
                                {updateFrameInfo()}
                            </DropdownContent>
                        </DropdownButton>
                        <DropdownButton icon={attributionIcon} newDropdownState='attributions'>
                            <DropdownContent>
                                <p>Attributions for icons. This is a temporary spot for them. Exact URLs in App.jsx.</p>
                                <a href="https://www.flaticon.com/free-icons/fullscreen" title="fullscreen icons">Fullscreen icons created by Vectors Market - Flaticon</a><br /><br />
                                <a href="https://www.flaticon.com/free-icons/weather" title="weather icons">Weather icons created by hirschwolf - Flaticon</a><br /><br />
                                <a href="https://www.flaticon.com/free-icons/wind" title="wind icons">Wind icons created by Freepik - Flaticon</a><br /><br />
                                <a href="https://www.flaticon.com/free-icons/radar" title="radar icons">Radar icons created by Freepik - Flaticon</a><br /><br />
                                <a href="https://www.flaticon.com/free-icons/settings" title="settings icons">Settings icons created by Pixel perfect - Flaticon</a><br /><br />
                                <a href="https://www.flaticon.com/free-icon-font/menu-burger_3917762">Burger icon (free even without attribution)</a><br /><br />
                                <a href="https://www.flaticon.com/free-icons/copyright" title="copyright icons">Copyright icons created by Freepik - Flaticon</a><br /><br />
                                <a href="https://www.flaticon.com/free-icons/pause" title="pause icons">Pause icons created by IYAHICON - Flaticon</a><br /><br />
                                <a href="https://www.flaticon.com/free-icons/pause" title="pause icons">Pause icons created by Debi Alpa Nugraha - Flaticon</a>
                            </DropdownContent>
                        </DropdownButton>
                    </ul>
                </nav>
            </DropdownStateContext.Provider>
        </>
    )
}

// Textbox inside of the settings page.
function updateFrameInfo() {
    // Extract from vectors and combine
    const all = [];
    Module.controllers.forEach(ctl => {
        const frames = ctl.getCurFrames();
        const count = frames ? frames.size() : 0;
        for (let i = 0; i < count; ++i) { all.push(frames.get(i)); }
    });

    const frames = all.map(f => {
        const manifest = f.manifest;
        if (manifest) try {
            return [manifest.source, manifest.region, manifest.variable, manifest.level,
            manifest.varKey, f.zoomLevel, f.interpolation, f.totalSlices].concat(
                f.slices.map(s => new Date(s.forecastEpoch * 1000).toISOString()));
        } finally {
                manifest.delete();
            }
    }).filter(Boolean);

    const hdr = "source - region - variable - varKey - level - zoom - interpolation - total - from - to\n";
    var output = hdr + frames.map(f => f.join(" - ")).join("\n");
    //text.setAttribute("rows", frames.length + 2);
    //setActive(text, !!frames.length);

    return (
        <textarea id='frame-text'>{output}</textarea>
    );
};

export default Dropdown