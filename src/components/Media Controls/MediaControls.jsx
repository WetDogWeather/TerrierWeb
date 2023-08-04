import moment from 'moment' // date formatter

import { useContext, useState } from 'react'
import { GlobalStateContext } from '../../App'
import './mediacontrols.css'

var intervalId // id for the setInterval that resets the time scrubber when the map is playing

function MediaControls() {

    const [globalState, setGlobalState] = useContext(GlobalStateContext)

    const [currDate, setCurrDate] = useState('No data being displayed')
    const [oldMapState, setOldMapState] = useState('none') // Used to know if the mapState switches, so the date can be reset.
    const [minTime, setMinTime] = useState(-1)
    const [playButtonText, setPlayButtonText] = useState('Play') // Temporary solution. UI should know if the map is playing / isn't playing
                                                                 // in real time and should just use an if statement to determine text or image
                                                                 // instead of manually updating text like this.

    if (oldMapState != globalState.mapState) {
        setOldMapState(globalState.mapState)
        if (minTime == -1) { // Called only when map is initialized for the first time.
            // 3000 and 6500 milliseconds are placeholders. This is here mostly because debounce is set to 1000 milliseconds. They are also arbitrary numbers.
            // Since radar takes longer, it is given a longer delay. SHOULD BE CHANGED WHEN POSSIBLE.
            var timeoutDelay = (globalState.mapState == 'radar') ? 6500 : 3000
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

    function onPlay(mapState) {
        if (mapState != 'none') {
            Module.togglePlay()
            if (playButtonText == 'Play') { // if map is currently playing (find better solution later)
                const range = (Number(Module.tracker.maxTime) - Number(Module.tracker.minTime))
                function scrubberIntervalLoop() {
                    document.getElementById('scrubber-range').value = ((Number(Module.tracker.curTime) - Number(Module.tracker.minTime)) / range) * 10000
                    setCurrDate(moment(Number(Module.tracker.curTime)).format('dddd, MMMM Do, h:mm a'))
                    console.log('updating scrubber...')
                }
                intervalId = setInterval(scrubberIntervalLoop, 100)
            } else { // if map is currently NOT playing
                clearInterval(intervalId)
            }
        }

        setPlayButtonText((playButtonText == 'Play') ? 'Pause' : 'Play')
    }

    return (
        <>
            <div className='media-controls'>
                <p id='media-date'>{currDate.toString()}</p>
                <div id='scrubber-controls'>
                    <button onClick={(e) => { onPlay(globalState.mapState) }} id='play-button'> {playButtonText} </button>
                    <input type='range' min='0' max='10000' id='scrubber-range' onChange={(e) => handleChange(e)} />
                    <p>{(globalState.animSpeed).toFixed(1)}x</p>
                </div>
            </div>
        </>
    )
}

export default MediaControls