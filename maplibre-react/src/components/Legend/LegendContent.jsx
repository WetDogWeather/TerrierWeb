import './legend.css'

//
//  Takes in the shaderMap and units passed form Legend.jsx, then generates the legend based on that information.
//

function LegendContent(props) {
    return (
        <>
            { generateLegend(props.shaderMap, props.units) }
        </>
    )
}

function generateLegend(shaderMap, units) {
    var legend

    for (var i = 0; i < shaderMap.colors.length; i++) {
        var color = shaderMap.colors[i].str;
        var value = shaderMap.values[i];

        // May want to consider moving this logic into TemperatureLayer.
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