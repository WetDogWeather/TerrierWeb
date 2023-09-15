import './dropdown.css'

import throttle from 'lodash.throttle'

//
// Renders <DropdownContent> inside <Dropdown> if this button is pressed.
//
function DropdownButton({icon,layer,layerId,isActive,setActive}) {
    const layerName = layer.layerName

    return (
        <>
            <li key={'dropdown-button-li-'+layerName}>
                <a href='#' key={'dropdown-button-a-'+layerName} draggable='false' onClick={() => setActive(layerId)}> 
                <img key={'dropdown-button-img-'+layerName} draggable='false' 
                        className={`dropdown-button ${(isActive) ? 'dropdown-button-active' : ''}`} src={icon} /></a>
            
                {/* <DropdownContent key={'content-'+layerName}>
                <h1 key={'header-'+layerName}> {globalState.layers[id].getDisplayName()} </h1>
                <h3 key={'colors-'+layerName}>Colors</h3>
                <div className='dropdown-input' key={'dropdown-input-'+layerName}>
                    <input type='radio' id='grey' key={'gray-'+layerName} name='color' onClick={() => changeLayerColor(id, false)} defaultChecked={!globalState.layers[id].colored} />
                    <label htmlFor='grey'>Grey</label>
                    <input type='radio' id='color' key={'color-'+layerName} name='color' onClick={() => changeLayerColor(id, true)} defaultChecked={globalState.layers[id].colored} />
                    <label htmlFor='color'>Color</label><br />
                </div>
                <h3 key={'sample-type-'+layerName}>Data Sample Type</h3>
                <div className='dropdown-input' key={'dropdown-input-2'+layerName}>
                    <input type='radio' id='variable-nearest' key={'variable-nearest-'+layerName} name='variable' onClick={() => globalState.layers[id].dataSampleUpdate(0)} defaultChecked={(globalState.layers[id].dataSampleType == 0)} />
                    <label htmlFor='variable-nearest'>Nearest</label>
                    <input type='radio' id='variable-linear' key={'variable-linear-'+layerName} name='variable' onClick={() => globalState.layers[id].dataSampleUpdate(1)} defaultChecked={(globalState.layers[id].dataSampleType == 1)} />
                    <label htmlFor='variable-linear'>Linear</label>
                    <input type='radio' id='variable-cubic' key={'variable-cubic-'+layerName} name='variable' onClick={() => globalState.layers[id].dataSampleUpdate(2)} defaultChecked={(globalState.layers[id].dataSampleType == 2)} disabled />
                    <label htmlFor='variable-cubic'>Cubic</label><br />
                </div>
                <h3 key={'render-sample-'+layerName}>Render Sample Type</h3>
                <div className='dropdown-input' key={'dropdown-input-3-'+layerName}>
                    <input type='radio' id='render-nearest' key={'render-nearest-'+layerName} name='render' onClick={() => globalState.layers[id].renderSampleUpdate(0)} defaultChecked={(globalState.layers[id].renderSampleType == 0)} />
                    <label htmlFor='render-nearest'>Nearest</label>
                    <input type='radio' id='render-linear' key={'render-linear-'+layerName} name='render' onClick={() => globalState.layers[id].renderSampleUpdate(1)} defaultChecked={(globalState.layers[id].renderSampleType == 1)} />
                    <label htmlFor='render-linear'>Linear</label>
                    <input type='radio' id='render-cubic' key={'render-cubic-'+layerName} name='render' onClick={() => globalState.layers[id].renderSampleUpdate(2)} defaultChecked={(globalState.layers[id].renderSampleType == 2)} disabled />
                    <label htmlFor='render-cubic'>Cubic</label><br />
                </div>
                <p key={'p-opacity-'+layerName}>Opacity</p>
                <input type='range' min='0' max='255' key={'opacity-'+layerName} defaultValue={globalState.layers[id].opacity} onChange={(e) => globalState.layers[id].opacityUpdate(e.target.value)} />
                <p key={'p-import-'+layerName}>Min Importance</p>
                <input type='range' min='5' max='100' key={'import-'+layerName} defaultValue={globalState.layers[id].minImportance} onChange={(e) => globalState.layers[id].minImportanceUpdate(e.target.value)} />
                <br key={'br-'+layerName} />
                { globalState.layers[id].uniqueDropdownElements }
            </DropdownContent>  */}

                {/* {(dropdownState == props.newDropdownState) && props.children} */}
            </li>
        </>
    )
}

// Should try to get this function to run within the Dropdown function, so it has direct access to props.newMapState and globalState.layers[]
// If it is in DropdownButton(), each button on the UI will have its own debounce function. They won't be universal.
// Declaring it outside of the scope will make sure every Dropdown Button on the UI will use the same debounce.
// const updateLayers = throttle((id, layers) => {
//     for (var i = 0; i < layers.length; i++) {
//         if (i == id) {
//             layers[i].enable(true)
//         } else {
//             layers[i].enable(false)
//         }
//     }

// }, 3000)

export default DropdownButton