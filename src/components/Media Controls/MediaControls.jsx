import moment from 'moment' // date formatter

import { useContext, useState } from 'react'
import { GlobalStateContext } from '../../App'
import './mediacontrols.css'

import playIcon from '../../assets/play-button.png'
import pauseIcon from '../../assets/pause.png'

var intervalId // id for the setInterval that resets the time scrubber when the map is playing

// Handles time scrubber at the bottom, play functionality, and displaying date

function MediaControls() {
    const [globalState, setGlobalState] = useContext(GlobalStateContext)

    const [currDate, setCurrDate] = useState((globalState.defaultTime == -1) ? 'No data being displayed...' : moment(Number(Module.tracker.curTime)).format('dddd, MMMM Do, h:mm a'))
    const [oldMapState, setOldMapState] = useState(0) // Used to know if the mapState switches, so the date can be reset.
    const [scrubberValue, setScrubberValue] = useState(5000) // Range from 0 to 10,000.
    const [togglePlayButton, setTogglePlayButton] = useState(playIcon)  // Temporary solution. UI should know if the map is playing / isn't playing
    // in real time and should just use an if statement to determine text or image
    // instead of manually updating text like this.

    if (globalState.defaultTime == -1) { // Called only when map is initialized for the first time.
        setTimeout(() => {
            setGlobalState({ ...globalState, defaultTime: moment(Number(Module.tracker.curTime)).format('dddd, MMMM Do, h:mm a') })
            setCurrDate(moment(Number(Module.tracker.curTime)).format('dddd, MMMM Do, h:mm a'))
        }, 1500)
    }

    if (Module.emInitialized == true && globalState.defaultTime != -1) {
        const range = (Number(Module.tracker.maxTime) - Number(Module.tracker.minTime))
        var newScrubberVal = ((Number(Module.tracker.curTime) - Number(Module.tracker.minTime)) / range) * 10000
        if (scrubberValue != newScrubberVal) {
            setScrubberValue(newScrubberVal)
        }
    }

    if (oldMapState != globalState.mapState) { // Detecting when layers switch
        setOldMapState(globalState.mapState)
        setCurrDate(globalState.defaultTime)

    }

    const handleChange = (e) => {
        if (globalState.mapState != -1) {
            Module.setTimeFrac(e.target.value / 10000)
            setCurrDate(moment(Number(Module.tracker.curTime)).format('dddd, MMMM Do, h:mm a'))
            if (togglePlayButton == pauseIcon) { // If play mode is currently on
                setTogglePlayButton(playIcon)
                clearInterval(intervalId)
            }
        }
    }

    function onPlay() {
        setTogglePlayButton((togglePlayButton == playIcon) ? pauseIcon : playIcon)
        if (globalState.mapState != 'none') {

            // This timeout allows togglePlay to run out of synch with MediaControls, so it doesn't slow the code down.
            // If it were to run synchronously, the play/pause has a noticeable lag when changing symbols.
            setTimeout(() => {
                Module.togglePlay()
            }, 1)

            if (togglePlayButton == playIcon) { // if map is currently playing (find better solution later)
                const range = (Number(Module.tracker.maxTime) - Number(Module.tracker.minTime))
                intervalId = setInterval(() => {
                    document.getElementById('scrubber-range').value = ((Number(Module.tracker.curTime) - Number(Module.tracker.minTime)) / range) * 10000
                    setCurrDate(moment(Number(Module.tracker.curTime)).format('dddd, MMMM Do, h:mm a'))
                }, 100 / globalState.animSpeed) // Getting a faster interval when animSpeed is higher (so it's smoother), no hard science going on here.
            } else { // if map is currently NOT playing
                clearInterval(intervalId)
            }
        }
    }

    return (
        <>
            <div className='media-controls'>
                <p id='media-date'>{currDate.toString()}</p>
                <div id='scrubber-controls'>
                    <a href='#' onClick={() => { onPlay() }}> <img draggable='false' id='play-button' src={togglePlayButton} /> </a>
                    <input type='range' min='0' max='10000' defaultValue={scrubberValue} id='scrubber-range' onChange={(e) => handleChange(e)} />
                    <p>{(globalState.animSpeed).toFixed(1)}x</p>
                </div>
            </div>
        </>
    )
}

export default MediaControls