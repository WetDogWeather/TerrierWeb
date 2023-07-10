import React, { useContext } from 'react'
import { GlobalStateContext } from '../../App'
import LegendContent from './LegendContent'
import './legend.css'

function Legend(props) {

    const [globalState, setGlobalState] = useContext(GlobalStateContext)

    const kelvinTemps = [255.37, 260.93, 266.58, 272.04, 277.59, 283.15, 288.71, 294.26, 299.82, 305.37, 310.93, 316.48]
    var displayTemps = []
    for (var i = 0; i < kelvinTemps.length; i++) {
        if (globalState.legendTempUnits == 'K') {
            displayTemps[i] = kelvinTemps[i]
        } else if (globalState.legendTempUnits == 'C') {
            displayTemps[i] = (kelvinTemps[i] - 273.15).toFixed(2)                  // Kelvin to Celsius formula
        } else if (globalState.legendTempUnits == 'F') {
            displayTemps[i] = (((kelvinTemps[i] - 273.15) * (9/5)) + 32).toFixed(2) // Kelvin to Farenheit formula
        }
    }

    return (
        <>
            <div className='legend'>
                <h1>Legend</h1>
                <LegendContent requiredState='temp'>
                    <p className='legend-box' style={{ backgroundColor: '#FFBFFF' }}>{displayTemps[0]} {globalState.legendTempUnits}</p>
                    <p className='legend-box' style={{ backgroundColor: '#D873DB' }}>{displayTemps[1]} {globalState.legendTempUnits}</p>
                    <p className='legend-box' style={{ backgroundColor: '#913ABB' }}>{displayTemps[2]} {globalState.legendTempUnits}</p>
                    <p className='legend-box' style={{ backgroundColor: '#372398' }}>{displayTemps[3]} {globalState.legendTempUnits}</p>
                    <p className='legend-box' style={{ backgroundColor: '#00B6DC' }}>{displayTemps[4]} {globalState.legendTempUnits}</p>
                    <p className='legend-box' style={{ backgroundColor: '#02D786' }}>{displayTemps[5]} {globalState.legendTempUnits}</p>
                    <p className='legend-box' style={{ backgroundColor: '#40C604' }}>{displayTemps[6]} {globalState.legendTempUnits}</p>
                    <p className='legend-box' style={{ backgroundColor: '#FFFF00' }}>{displayTemps[7]} {globalState.legendTempUnits}</p>
                    <p className='legend-box' style={{ backgroundColor: '#FB7700' }}>{displayTemps[8]} {globalState.legendTempUnits}</p>
                    <p className='legend-box' style={{ backgroundColor: '#D22402' }}>{displayTemps[9]} {globalState.legendTempUnits}</p>
                    <p className='legend-box' style={{ backgroundColor: '#A20902' }}>{displayTemps[10]} {globalState.legendTempUnits}</p>
                    <p className='legend-box' style={{ backgroundColor: '#EED9D8' }}>{displayTemps[11]} {globalState.legendTempUnits}</p>
                </LegendContent>
                <LegendContent requiredState='wind'>
                    <p className='legend-box' style={{ backgroundColor: '#AED5FF' }}>0 m/s</p>
                    <p className='legend-box' style={{ backgroundColor: '#86B4E6' }}>5 m/s</p>
                    <p className='legend-box' style={{ backgroundColor: '#66E2D6' }}>10 m/s</p>
                    <p className='legend-box' style={{ backgroundColor: '#00CC05' }}>15 m/s</p>
                    <p className='legend-box' style={{ backgroundColor: '#ECF006' }}>20 m/s</p>
                    <p className='legend-box' style={{ backgroundColor: '#FF6B00' }}>25 m/s</p>
                    <p className='legend-box' style={{ backgroundColor: '#E11511' }}>30 m/s</p>
                    <p className='legend-box' style={{ backgroundColor: '#E111C1' }}>35 m/s</p>
                    <p className='legend-box' style={{ backgroundColor: '#FFCEF7' }}>40 m/s</p>
                </LegendContent>
                <LegendContent requiredState='radar'>
                    <p className='legend-box' style={{ backgroundColor: '#FFFFFF' }}>-30 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#FFFFFF' }}>-25 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#FFFFFF' }}>-20 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#10E6E7' }}>-15 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#10E6E7' }}>-10 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#10E6E7' }}>-5 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#10E6E7' }}>0 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#10E6E7' }}>5 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#069FF3' }}>10 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#0400F0' }}>15 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#01FC08' }}>20 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#02C701' }}>25 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#068D01' }}>30 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#F6F602' }}>35 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#E6BA03' }}>40 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#F79505' }}>45 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#FE0002' }}>50 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#D60401' }}>55 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#BB0200' }}>60 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#F807F6' }}>65 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#9A52C8' }}>70 dBz</p>
                    <p className='legend-box' style={{ backgroundColor: '#FCFBFA' }}>75 dBz</p>
                </LegendContent>
            </div>
        </>
    )
}

export default Legend