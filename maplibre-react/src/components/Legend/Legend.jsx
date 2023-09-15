import React, { useContext } from 'react'
import { GlobalStateContext } from '../../App'
import LegendContent from './LegendContent'
import './legend.css'

//
// Does not handle the actual logic for generating the legend. Go to LegendContent.jsx for that.
//

function Legend() {
    const [globalState, setGlobalState] = useContext(GlobalStateContext)

    if (globalState.layers.length == 0) {
        return
    }

    var currentShaderMap = globalState.layers[globalState.mapState].getColorMap()
    var units = globalState.layers[globalState.mapState].getUnits()

    return (
        <>
            <div className='legend'>
                <h1>Legend</h1>
                <LegendContent shaderMap={currentShaderMap} units={units} />
            </div>
        </>
    )
}

export default Legend