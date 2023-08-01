import debounce from 'lodash.debounce'
import moment from 'moment' // date formatter

import { useContext, useState } from 'react'
import { GlobalStateContext } from '../../App'
import './mediacontrols.css'

function MediaControls() {

    const [globalState, setGlobalState] = useContext(GlobalStateContext)

    const [currDate, setCurrDate] = useState('No data being displayed')
    const [oldMapState, setOldMapState] = useState('none') // Used to know if the mapState switches, so the date can be reset.
    const [minTime, setMinTime] = useState(-1)

    if (oldMapState != globalState.mapState) {
        setOldMapState(globalState.mapState)
        if (minTime == -1) { // Called only when map is initialized for the first time.
            // 2000 and 6500 milliseconds are placeholders. This is here mostly because debounce is set to 1000 milliseconds. They are also arbitrary numbers.
            // Since radar takes longer, it is given a longer delay. SHOULD BE CHANGED WHEN POSSIBLE.
            var timeoutDelay = (globalState.mapState == 'radar') ? 6500 : 2000
            console.log(timeoutDelay)

            setCurrDate('fetching time...')
            setTimeout(() => {
                setMinTime(moment(Number(Module.tracker.minTime)).format('dddd, MMMM Do, h:mm a'))
                setCurrDate(moment(Number(Module.tracker.minTime)).format('dddd, MMMM Do, h:mm a'))
                document.getElementById('scrubber-range').value = '0' // Not how you're supposed to do it in React? I'm not sure if this is best practice. Too vanilla JS-ish
            }, timeoutDelay) 
            // ^ Would be best to somehow invoke this code on initial layer, but I don't know how to do that. Time out is only a temporary fix.
            // If this Timeout code runs before the map sets itself up for the first time, a false minTime gets stored. Then every time the map switches it tries to use an invalid date.
            // 
            // Note that it also breaks if user spams the buttons on first initial layer, because it assumes only one debounce delay instead of multiple.
            // This can easily be fixed by putting globalState.mapState update inside of the debounce, but throttling instead of debouncing should fix
            // this issue and other issues, so try for that first.
        } else {
            setCurrDate(minTime)
            document.getElementById('scrubber-range').value = '0' // Possibly not best practice.
        }
    }

    const handleChange = (e) => {
        if (globalState.mapState != 'none') {
            Module.setTimeFrac(e.target.value / 10000);
            setCurrDate(moment(Number(Module.tracker.curTime)).format('dddd, MMMM Do, h:mm a'))
        }
    }

    return (
        <>
            <div className='media-controls'>
                <p id='media-date'>{currDate.toString()}</p>
                <div id='scrubber-controls'>
                    <button onClick={(e) => { onPlay(globalState.mapState) }}>Play</button>
                    <input type='range' min='0' max='10000' id='scrubber-range' onChange={(e) => handleChange(e)} />
                    <p>{(globalState.animSpeed).toFixed(1)}x</p>
                </div>
            </div>
        </>
    )
}

// Same problem as the debounce in App.jsx. There is a 1 second lag when the button is pressed.
// Try throttle instead? Write my own debounce / throttle combo wombo?
const onPlay = debounce((mapState) => {
    if (mapState != 'none') {
        Module.togglePlay()
    }
}, 1000)

export default MediaControls