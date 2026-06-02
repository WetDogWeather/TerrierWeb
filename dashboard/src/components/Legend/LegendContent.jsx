import './legend.css'

// Convert a value based on the units
function convertValueToString(oldVal,enumValues,units) {
    if (enumValues && enumValues.length > 0) {
        var enumVal = Math.round(oldVal)
        enumVal = Math.max(enumVal,0)
        enumVal = Math.min(enumVal,enumValues.length-1)
        return enumValues[enumVal]
    } else {
        var newVal = oldVal

        // May want to consider moving this logic into TemperatureLayer.
        switch (units) {
            case 'F':
                newVal = (((oldVal - 273.15) * (9 / 5)) + 32); // Kelvin to Fahrenheit formula
                break;
            case 'C':
                newVal = (oldVal - 273.15);                    // Kelvin to Celsius formula
                break;
        }
        return newVal.toFixed(2) + units
    }
}

//
//  Takes in the colorMap and units passed form Legend.jsx, then generates the legend based on that information.
//

function LegendContent({colorMap,enumValues,units,value}) {
    var legend = []

    if (colorMap) {
        let colors = colorMap.colors;
        let values = colorMap.values;
        let visibles = colorMap.visibles;
        for (var i = 0; i < colors.length; i++) {
            let color = colors[i];
            let thisValue = values[i];
            let visible = visibles[i];

            if (visible) {
                let newValue = convertValueToString(thisValue, enumValues, units)
                var newLegendBox = (
                    <div className='legend-background' key={'legend-background-'+i} >
                        <p className='legend-box' key={'legend-box-'+i} 
                            style={{ backgroundColor: color.str }}> {newValue}</p>
                    </div>
                )
                legend = [legend, newLegendBox]
            }
        }
    }
    if (value !== null) {
        var valueStr = ""
        value.forEach(theVal => {
            if (valueStr.length > 0) {
                valueStr = valueStr + ' '
            }
            valueStr = valueStr + convertValueToString(theVal, enumValues, units)
        });
        var valueBox = (
            <div className='legend-background' key='value-background' >
                <p className='legend-box' key='value-box'
                    style={{ backgroundColor: 0xffffff }}> {valueStr}</p>
            </div>
        )
        legend = [legend, valueBox]
    }

    return (
        <>
            {legend}
        </>
    )
}

export default LegendContent