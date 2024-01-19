import './legend.css'

//
//  Takes in the colorMap and units passed form Legend.jsx, then generates the legend based on that information.
//

function LegendContent({colorMap,units}) {
    var legend = []

    if (colorMap) {
        let colors = colorMap.colors;
        let values = colorMap.values;
        // let visibles = colorMap.visibles;
        for (var i = 0; i < colors.length; i++) {
            let color = colors[i];
            let value = values[i];
            // let visible = visibles[i];
            let visible = true

            if (visible) {
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
                    <div className='legend-background' key={'legend-background-'+i} >
                        <p className='legend-box' key={'legend-box-'+i} 
                            style={{ backgroundColor: color.str }}> {value.toFixed(2)} {units}</p>
                    </div>
                )
                legend = [legend, newLegendBox]
            }
        }
    }

    return (
        <>
            {legend}
        </>
    )
}

export default LegendContent