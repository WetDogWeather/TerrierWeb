import { useContext } from 'react'
import { GlobalStateContext } from '../../App'
import './legend.css'

function LegendContent(props) {

    console.log(' -- LegendContent.jsx rendered')

    var legend = generateLegend(props.shaderMap, props.units)

    return (
        <>
            {legend}
        </>
    )
}

function generateLegend(shaderMap, units) {
    var legend

    for (var i = 0; i < shaderMap.colors.length; i++) {
        var color = shaderMap.colors[i].str;
        var value = shaderMap.values[i];
        switch (units) {
            case 'F':
                value = (((value - 273.15) * (9 / 5)) + 32); // Kelvin to Farenheit formula
                break;
            case 'C':
                value = (value - 273.15);                    // Kelvin to Celsius formula
                break;
        }

        var newLegendBox = (
            <div className='legend-background'>
                <p className='legend-box' style={{ backgroundColor: color }}> {value.toFixed(2)} {units}</p>
            </div>
        )
        var legend = [legend, newLegendBox]
    }

    return (
        <>
            {legend}
        </>
    )
}

export default LegendContent