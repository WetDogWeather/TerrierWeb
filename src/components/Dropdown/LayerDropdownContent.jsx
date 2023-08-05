import React from 'react'

// Experimenting with one of these to make Dropdown.jsx more readable.
//
// I want to just call this and pass through props.title, props.type, etc. and just get them to work.
// I need to likely build a class for each of them first though...

function LayerDropdownContent() {
    return (
        <>
            <h1>Temperature</h1>
            <h3>Colors</h3>
            <div className='dropdown-input'>
                <input type='radio' id='temp-grey' name='color' onClick={() => setGlobalState({ ...globalState, tempColored: false })} defaultChecked={!globalState.tempColored} />
                <label for='temp-grey'>Grey</label>
                <input type='radio' id='temp-color' name='color' onClick={() => setGlobalState({ ...globalState, tempColored: true })} defaultChecked={globalState.tempColored} />
                <label for='temp-color'>Color</label><br />
            </div>
            <h3>Data Sample Type</h3>
            <div className='dropdown-input'>
                <input type='radio' id='temp-variable-nearest' name='variable' onClick={() => setGlobalState({ ...globalState, tempDataSampleType: 0 })} defaultChecked={(globalState.tempDataSampleType == 0)} />
                <label for='temp-variable-nearest'>Nearest</label>
                <input type='radio' id='temp-variable-linear' name='variable' onClick={() => setGlobalState({ ...globalState, tempDataSampleType: 1 })} defaultChecked={(globalState.tempDataSampleType == 1)} />
                <label for='temp-variable-linear'>Linear</label>
                <input type='radio' id='temp-variable-cubic' name='variable' onClick={() => setGlobalState({ ...globalState, tempDataSampleType: 2 })} defaultChecked={(globalState.tempDataSampleType == 2)} disabled />
                <label for='temp-variable-cubic'>Cubic</label><br />
            </div>
            <h3>Render Sample Type</h3>
            <div className='dropdown-input'>
                <input type='radio' id='temp-render-nearest' name='render' onClick={() => setGlobalState({ ...globalState, tempRenderSampleType: 0 })} defaultChecked={(globalState.tempRenderSampleType == 0)} />
                <label for='temp-render-nearest'>Nearest</label>
                <input type='radio' id='temp-render-linear' name='render' onClick={() => setGlobalState({ ...globalState, tempRenderSampleType: 1 })} defaultChecked={(globalState.tempRenderSampleType == 1)} />
                <label for='temp-render-linear'>Linear</label>
                <input type='radio' id='temp-render-cubic' name='render' onClick={() => setGlobalState({ ...globalState, tempRenderSampleType: 2 })} defaultChecked={(globalState.tempRenderSampleType == 2)} disabled />
                <label for='temp-render-cubic'>Cubic</label><br />
            </div>
            <p>Opacity</p>
            <input type='range' min='0' max='255' defaultValue={globalState.tempOpacity} onChange={(e) => setGlobalState({ ...globalState, tempOpacity: e.target.value })} />
            <p>Min Importance</p>
            <input type='range' min='5' max='100' defaultValue={globalState.tempMinImportance} onChange={(e) => setGlobalState({ ...globalState, tempMinImportanceUpdate: e.target.value })} />
            <br />
        </>
    )
}

export default LayerDropdownContent