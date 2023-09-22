import { useState } from 'react'

import './dropdown.css'

// Settings are a separate dropdown
function SettingsDropdown({legendVisible, setLegendVisible, 
                            animSpeed, setAnimSpeed, 
                            stackName, setStackName}) 
{
    const [localStackName,setLocalStackName] = useState(stackName)

    const updateAnimSpeed = (e) => {
        var newSpeed = e.target.value / 10 // Animation speed range goes from 1-99, but the real values that interact with the code should be 0.1-9.9
        // TODO: Put this back
        // Module.setPlayInterval(99 - e.target.value | 0 + 1) // 99 is the max value of the animation speed range
        setAnimSpeed(newSpeed)
    }

    return (
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

        </div>
       </>
    )
}

export default SettingsDropdown