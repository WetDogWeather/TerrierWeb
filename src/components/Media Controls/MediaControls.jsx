import { useContext, useState } from 'react'
import { GlobalStateContext } from '../../App'
import './mediacontrols.css'

function MediaControls() {

    var startTime = 1641072720000 // Jan 01, 2022 in milliseconds
    var endTime = 1672608720000 // Jan 01, 2023 in milliseconds

    const [globalState, setGlobalState] = useContext(GlobalStateContext)
    const [currDate, setCurrDate] = useState(new Date(startTime))

    const handleChange = (e) => {
        setCurrDate(new Date(Number(e.target.value)))
    }

    return (
        <>
            <div className='media-controls'>
                <p id='media-date'>{currDate.toString()}</p>
                <div id='scrubber-controls'>
                    <button>Play</button> {/* Doesn't do anything yet */}
                    <input type='range' min={startTime} max={endTime} onChange={(e) => handleChange(e)} />
                    <p>{(globalState.animSpeed).toFixed(1)}x</p>
                </div>
            </div>
        </>
    )
}
export default MediaControls