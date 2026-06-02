import LegendContent from './LegendContent'
import './legend.css'

//
// Does not handle the actual logic for generating the legend. Go to LegendContent.jsx for that.
//

function Legend({colorMap,enumValues,units,value}) {
    return (
        <>
            <div className='legend'>
                <h1>Legend</h1>
                <LegendContent colorMap={colorMap} enumValues={enumValues} units={units} value={value} />
            </div>
        </>
    )
}

export default Legend