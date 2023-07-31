import debounce from 'lodash.debounce'
import moment from 'moment' // date formatter

import { useContext, useState } from 'react'
import { GlobalStateContext } from '../../App'
import './mediacontrols.css'

function MediaControls() {

    const [globalState, setGlobalState] = useContext(GlobalStateContext)

    // Needs work. minTime doesn't get the correct value, because the UI updates before the map can be set-up. Maybe set this to "fetching time..." and then reset it once the map loads? Not sure.
    const [currDate, setCurrDate] = useState(moment(Number(Module.tracker.minTime)).format('dddd, MMMM Do, h:mm a'))

    const handleChange = (e) => {
        Module.setTimeFrac(e.target.value / 10000);
        setCurrDate(moment(Number(Module.tracker.curTime)).format('dddd, MMMM Do, h:mm a'))
    }

    return (
        <>
            <div className='media-controls'>
                <p id='media-date'>{currDate.toString()}</p>
                <div id='scrubber-controls'>
                    <button onClick={(e) => { onPlay(globalState.mapState) }}>Play</button>
                    <input type='range' min='0' max='10000' onChange={(e) => handleChange(e)} />
                    <p>{(globalState.animSpeed).toFixed(1)}x</p>
                </div>
            </div>
        </>
    )
}

const onPlay = debounce((mapState) => {
    console.log(Module.tracker.minTime)
    if (mapState != 'none') {
        Module.togglePlay()
    }
}, 1000)

export default MediaControls