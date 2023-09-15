import { useEffect, useState } from 'react'

import DropdownButton from './DropdownButton'
import LayerDropdown from "./LayerDropdown"
import './dropdown.css'

import settingsIcon from '../../assets/settings.png'
import attributionIcon from '../../assets/copyright.png'

//
// Handles the main layout for the dropdown menu.
// Does not handle logic for button functionality, it simply calls the component.
// Go to DropdownButton.jsx for that.
//

function Dropdown({layers, curLayer, setCurLayer, animSpeed, setAnimSpeed, legendVisible, setLegendVisible}) {
    const [curSelection,_setCurSelection] = useState(curLayer)
    const numLayers = layers.length

    // We can select the available layers, but also a couple of other buttons (settings, attribution)
    const setCurSelection = (newId) => {
        _setCurSelection(newId)
        if (newId < layers.length) {
            setCurLayer(newId)
        }
    }

    const updateAnimSpeed = (e) => {
        var newSpeed = e.target.value / 10 // Animation speed range goes from 1-99, but the real values that interact with the code should be 0.1-9.9
        // TODO: Put this back
        // Module.setPlayInterval(99 - e.target.value | 0 + 1) // 99 is the max value of the animation speed range
        setAnimSpeed(newSpeed)
    }

    // Generating dropdown menu based on layers
    var dropdown
    for (var i = 0; i < layers.length; i++) {
        const layerId = i; // Constant so that the onClick events don't read the final value of i.
        const layer = layers[layerId]
        let content = (
            <>
                <DropdownButton icon={layer.getIcon()} key={'button-'+layer.layerName} 
                                layerName={layer.layerName} isActive={layerId == curSelection} setActive={() => setCurSelection(layerId)}>
                </DropdownButton>
            </>
        )
        dropdown = [dropdown, content]
    }

    // One for the settings
    let settingsButton = (
        <>
            <DropdownButton icon={settingsIcon} key={'button-settings'} 
                            layerName='settings' isActive={curSelection == numLayers} setActive={() => setCurSelection(numLayers)}>
            </DropdownButton>
        </>
    )
    dropdown = [dropdown, settingsButton]

    // And one for the attribution
    let attrButton = (
        <>
            <DropdownButton icon={attributionIcon} key={'button-attribution'} 
                            layerName='attribution' isActive={curSelection == numLayers+1} setActive={() => setCurSelection(numLayers+1)}>
            </DropdownButton>
        </>
    )
    dropdown = [dropdown, attrButton]

    // Generate the content for settings of attribution if needed
    if (curSelection >= 0 && curSelection < numLayers) {
        let layerContent = (
                <LayerDropdown layer={layers[curSelection]}></LayerDropdown>
        )
        dropdown = [dropdown, layerContent]
    } else if (curSelection == numLayers) {
        const settingsContent = (
            <>
                <div className='dropdown-content' key={'settings-content'}>
                    <h1>Settings</h1>
                    <br />

                    <label>
                        <input type="checkbox" checked={!legendVisible} onChange={() => setLegendVisible(!legendVisible)}/>
                    Hide Legend
                    </label>

                    <p>Animation Speed</p>
                    <input type='range' id='animation-speed' min='0' max='99'
                        value={animSpeed * 10} onChange={(e) => updateAnimSpeed(e)} />
                    <br /><br />
                </div>
            </>
        )    
        dropdown = [dropdown, settingsContent]
    } else if (curSelection == numLayers+1) {
        const attrContent = (
            <>
                <div className='dropdown-content' key={'attr-content'}>
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
                </div>
            </>
        )
        dropdown = [dropdown, attrContent]
    }

    return (
        <>
            <nav className='dropdown' key='dropdown'>
                <ul className='dropdown-nav' key='dropdown-nav'>
                    {dropdown}
                </ul>
            </nav>
        </>
    )
}

// Textbox inside of the settings page.
function updateFrameInfo() {
    // Extract from vectors and combine
    const all = [];
    // TODO: Put this back
    // Module.controllers.forEach(ctl => {
    //     const frames = ctl.getCurFrames();
    //     const count = frames ? frames.size() : 0;
    //     for (let i = 0; i < count; ++i) { all.push(frames.get(i)); }
    // });

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