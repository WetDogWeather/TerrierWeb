import './dropdown.css'
import LayerDropdown from "./LayerDropdown"

// Render the control for a single layer
function TemperatureDropdown({layer,setUnits}) {
    const extraFields = (
        <>
        <h3>Units</h3>
            <input type='radio' id='kelvin' name='temp-units' onClick={() => setUnits(layer, 'K')} defaultChecked={layer.units == 'K'} />
            <label htmlFor='kelvin'>Kelvin</label>
            <input type='radio' id='celsius' name='temp-units' onClick={() => setUnits(layer, 'C')} defaultChecked={layer.units == 'C'} />
            <label htmlFor='celsius'>Celsius</label>
            <input type='radio' id='fahrenheit' name='temp-units' onClick={() => setUnits(layer, 'F')} defaultChecked={layer.units == 'F'} />
            <label htmlFor='fahrenheit'>Fahrenheit</label>
        </>
    )

    return (
        <>
            <LayerDropdown layer={layer} extraFields={extraFields} />
        </>
    )
}

export default TemperatureDropdown
