import './dropdown.css'
import LayerDropdown from "./LayerDropdown"

// Render the control for a single layer
function TemperatureDropdown({layer,setUnits,level,setLevel}) {
    const extraFields = (
        <>
        <h3 key="Units">Units</h3>
            <input key="radio-kelvin" type='radio' id='kelvin' name='temp-units' onClick={() => setUnits(layer, 'K')} defaultChecked={layer.units == 'K'} />
            <label key="radio-kelvin-html" htmlFor='kelvin'>Kelvin</label>
            <input key="radio-celsius" type='radio' id='celsius' name='temp-units' onClick={() => setUnits(layer, 'C')} defaultChecked={layer.units == 'C'} />
            <label key="radio-celsius-html" htmlFor='celsius'>Celsius</label>
            <input key="radio-fahrenheit" type='radio' id='fahrenheit' name='temp-units' onClick={() => setUnits(layer, 'F')} defaultChecked={layer.units == 'F'} />
            <label key="radio-fahrenheit-html" htmlFor='fahrenheit'>Fahrenheit</label>
        </>
    )

    return (
        <>
            <LayerDropdown key="layer dropdown" layer={layer} level={level} setLevel={setLevel} extraFields={extraFields} />
        </>
    )
}

export default TemperatureDropdown
