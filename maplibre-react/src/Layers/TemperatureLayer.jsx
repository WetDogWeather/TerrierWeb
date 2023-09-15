import Layer from './Layer.jsx'

class TemperatureLayer extends Layer {

    constructor(ovl,displayName, icon, layerName, level, units, colorsGrey, colorsNotGrey) {

        super(ovl, displayName, icon, layerName, level, units, colorsGrey, colorsNotGrey)

        // Problems with getting these elements to set their default state on render.
        // For some reason, this.getUnits() returns the original units (which is K), and not the current units
        // that are actually stored in the object. So when I call this.defaultCheckedCheck, it will always
        // default to Kelvin being selected even though that's wrong.
        this.uniqueDropdownElements = (
            <>
                {/* {() => console.log('uniqueDropdownElements rendered ' + this.getUnits()) } */}
                <h3>Units</h3>
                <input type='radio' id='kelvin' name='temp-units' onClick={() => this.units = 'K'} /*defaultChecked={this.defaultCheckedCheck('K')}*/ />
                <label htmlFor='kelvin'>Kelvin</label>
                <input type='radio' id='celsius' name='temp-units' onClick={() => this.units = 'C'} /*defaultChecked={this.defaultCheckedCheck('C')}*/ />
                <label htmlFor='celsius'>Celsius</label>
                <input type='radio' id='fahrenheit' name='temp-units' onClick={() => this.units = 'F'} /*defaultChecked={this.defaultCheckedCheck('F')}*/ />
                <label htmlFor='fahrenheit'>Fahrenheit</label><br />
                <br />
            </>
        )
    }

    // Not currently used.
    defaultCheckedCheck(unit) {
        return ( this.getUnits() == unit )
    }
}

export default TemperatureLayer