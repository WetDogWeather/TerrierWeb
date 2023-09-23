import './dropdown.css'

// Render the control for a single layer
function LayerDropdown({layer, level, setLevel, extraFields}) {
    const layerName = layer.layerName

    var levelsContent = ""
    if (layer.levels.length > 0) {
        levelsContent = (
            <>
                <h3 key={'levels-'+layerName}>Levels</h3>
                <select name="dropdown-level-select" key="dropdown-level-select" 
                        selected={level} onChange={(e) => setLevel(e.target.value)}>
                    {layer.levels.map( (level) => {
                        return (<option value={level}>{level}</option>)
                    })}
                </select>
            </>
        )
    }

    return (
        <>
            <div className='dropdown-content' key={'content-'+layerName}>
            <h1 key={'header-'+layerName}> {layer.getDisplayName()} </h1>
            {levelsContent}
            <h3 key={'colors-'+layerName}>Colors</h3>
            <div className='dropdown-input' key={'dropdown-input-'+layerName}>
                <input type='radio' id='grey' key={'gray-'+layerName} name='color' onClick={() => layer.colorUpdate(false)} 
                    defaultChecked={!layer.colored} />
                <label htmlFor='grey'>Grey</label>
                <input type='radio' id='color' key={'color-'+layerName} name='color' onClick={() => layer.colorUpdate(true)} 
                    defaultChecked={layer.colored} />
                <label htmlFor='color'>Color</label><br />
            </div>
            <h3 key={'sample-type-'+layerName}>Data Sample Type</h3>
            <div className='dropdown-input' key={'dropdown-input-2'+layerName}>
                <input type='radio' id='variable-nearest' key={'variable-nearest-'+layerName} name='variable' 
                    onClick={() => layer.dataSampleUpdate(0)} 
                    defaultChecked={(layer.dataSampleType == 0)} />
                <label htmlFor='variable-nearest'>Nearest</label>
                <input type='radio' id='variable-linear' key={'variable-linear-'+layerName} name='variable' 
                    onClick={() => layer.dataSampleUpdate(1)} 
                    defaultChecked={(layer.dataSampleType == 1)} />
                <label htmlFor='variable-linear'>Linear</label>
                <input type='radio' id='variable-cubic' key={'variable-cubic-'+layerName} name='variable' 
                    onClick={() => layer.dataSampleUpdate(2)} 
                    defaultChecked={(layer.dataSampleType == 2)} disabled />
                <label htmlFor='variable-cubic'>Cubic</label><br />
            </div>
            <p key={'p-opacity-'+layerName}>Opacity</p>
            <input type='range' min='0' max='255' key={'opacity-'+layerName} 
                defaultValue={layer.opacity} 
                onChange={(e) => layer.opacityUpdate(e.target.value)} />
            <p key={'p-import-'+layerName}>Min Importance</p>
            <input type='range' min='5' max='50' key={'import-'+layerName} 
                defaultValue={layer.minImportance*10}
                onChange={(e) => layer.minImportanceUpdate(e.target.value/10)} />
            <br key={'br-'+layerName} />
                { layer.uniqueDropdownElements }
            {extraFields === undefined ? <></> : extraFields}
        </div>
       </>
    )
}

export default LayerDropdown