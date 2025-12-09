import { useState } from 'react'

import './dropdown.css'

// Settings are a separate dropdown
function SettingsDropdown({legendVisible, setLegendVisible, 
                            snapFrame, setSnapFrame,
                            animSpeed, setAnimSpeed,
                            displayAllLayers, setDisplayAllLayers,
                            source, sources, setSource,
                            region, regions, setRegion,
                            stackName, setStackName,
                            baseMapName, basemaps, setBaseMapName}) 
{
    const [localStackName,setLocalStackName] = useState(stackName)

    const updateAnimSpeed = (e) => {
        var newSpeed = e.target.value / 10 // Animation speed range goes from 1-99, but the real values that interact with the code should be 0.1-9.9
        // TODO: Put this back
        // Module.setPlayInterval(99 - e.target.value | 0 + 1) // 99 is the max value of the animation speed range
        setAnimSpeed(newSpeed)
    }

    const sourceContent = (
        <>
            <label htmlFor="sources">Source: </label>

            <select name="sources-select" key="sources-select" 
                        selected={source} onChange={(e) => setSource(e.target.value)}>
                {sources.map( (thisSource) => {
                        return (<option selected={source == thisSource ? 'selected' : ''} value={thisSource}>{thisSource} </option>)
                })}
            </select>   
            </>
    )

    const regionContent = (
        <>
            <label htmlFor="regions">Region: </label>

            <select name="regions-select" key="regions-select" 
                        selected={region} onChange={(e) => setRegion(e.target.value)}>
            {regions.map( (region) => {
                        return (<option value={region}>{region}</option>)
            })}
            </select>   
            </>
    )

    const baseMapContent = (
        <>
            <label htmlFor="Basemap">Basemap: </label>

            <select name="basemap-select" key="basemap-select" 
                        selected={baseMapName} onChange={(e) => setBaseMapName(e.target.value)}>
            {basemaps.map( (basemap) => {
                        return (<option value={basemap}>{basemap}</option>)
            })}
            </select>   
            </>
    )

    return (
        <>
        <div className='dropdown-content' key={'settings-content'}>
            <h1>Settings</h1>
            <br />

            <label>
                <input type="checkbox" checked={!legendVisible} onChange={() => setLegendVisible(!legendVisible)}/>
            Hide Legend
            </label>
            <br />

            <label>
                <input type="checkbox" checked={snapFrame} onChange={() => setSnapFrame(!snapFrame)}/>
            Snap to Time Slices
            </label>
            <br />
            <label>
                <input type="checkbox" checked={displayAllLayers} onChange={() => setDisplayAllLayers(!displayAllLayers)}/>
            All Layers
            </label>

            <br />
            <br />

            {sourceContent}

            <br />
            <br />

            {regionContent}

            <br />

            <p>Animation Speed</p>
            <input type='range' id='animation-speed' min='1' max='100'
                value={animSpeed * 10} onChange={(e) => updateAnimSpeed(e)} />

            <p>Stack Name</p>
            <div className='dropdown-input' key={'dropdown-input-stack-name'}>
                <input id='stack-name'
                    value={localStackName} 
                    placeholder={stackName}
                    onChange={(e) => {setLocalStackName(e.target.value); return true}} />
                <button className="stack-name-clear" onClick={() => {setLocalStackName('')}}>Clear</button>
                <button className="stack-name-save" onClick={() => {setStackName(localStackName)}}>Save</button>
            </div>
            <br /><br />

            {baseMapContent}

            <br /><br />

        </div>
       </>
    )
}

export default SettingsDropdown