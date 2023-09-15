import moment from 'moment' // date formatter

import { useContext, useState } from 'react'
import { GlobalStateContext } from '../../App'
import './mediacontrols.css'

import playIcon from '../../assets/play-button.png'
import pauseIcon from '../../assets/pause.png'

var intervalId // id for the setInterval that resets the time scrubber when the map is playing

//
// Handles time scrubber at the bottom, play functionality, and displaying date
//

function MediaControls() {
    const [globalState, setGlobalState] = useContext(GlobalStateContext)

    let curTime = globalThis.Terrier !== undefined ? Terrier.ovl.getCurrentTime() : 0.0
    let timeRange = globalThis.Terrier !== undefined ? Terrier.ovl.getTimeRange() : [0.0,0.0]
    const [currDate, setCurrDate] = useState((globalState.defaultTime == -1) ? 'No data being displayed...' : moment(Number(Terrier)).format('dddd, MMMM Do, h:mm a'))
    const [oldMapState, setOldMapState] = useState(0) // Used to know if the mapState switches, so the date can be reset.
    const [scrubberValue, setScrubberValue] = useState(5000) // Ranges from 0 to 10,000.
    const [togglePlayButton, setTogglePlayButton] = useState(playIcon)
    const [initialized, setInitialized] = useState(false)

    // Setting the date text on initialization. This code only runs once the first time it's rendered.
    if (globalState.defaultTime == -1) { // Called only when map is initialized for the first time.
        // Timeout so this doesn't run before Module is fully initialized.
        setTimeout(() => {
            if (globalThis.Terrier === undefined) { return }

            setGlobalState({ ...globalState, defaultTime: moment(Number(Terrier.ovl.getCurrentTime())).format('dddd, MMMM Do, h:mm a') })
            setCurrDate(moment(Number(Terrier.ovl.getCurrentTime())).format('dddd, MMMM Do, h:mm a'))
        }, 1000)
    }

    // Setting the scrubber value when this component re-renders.
    // Making sure the icon is correct.
    // This logic is necessary incase the MediaControls need to de-render and re-render because of fullscreen.
    const range = (Number(timeRange[0]) - Number(timeRange[1]))
    var newScrubberVal = ((Number(curTime) - Number(timeRange[0])) / range) * 10000
    setScrubberValue(newScrubberVal)

    let isPlaying = globalThis.Terrier !== undefined ? Terrier.ovl.isTimePlaying() : false
    setTogglePlayButton(isPlaying ? pauseIcon : playIcon)

    setInitialized(true)

    if (oldMapState != globalState.mapState) { // Detecting when layers switch
        setOldMapState(globalState.mapState)
        setCurrDate(globalState.defaultTime)
    }

    const handleChange = (e) => {
        if (globalState.mapState != -1) {
            if (globalThis.Terrier === undefined) { return }

            // TODO: Fix this
            // Module.setTimeFrac(e.target.value / 10000)
            setCurrDate(moment(Number(Terrier.ovl.getCurrentTime())).format('dddd, MMMM Do, h:mm a'))
            if (togglePlayButton == pauseIcon) { // If play mode is currently on
                setTogglePlayButton(playIcon)
                clearInterval(intervalId)
            }
        }
    }

    function onPlay() {
        setTogglePlayButton((togglePlayButton == playIcon) ? pauseIcon : playIcon)
        if (globalState.mapState != 'none') {
            if (globalThis.Terrier === undefined) { return }

            // This timeout allows togglePlay to run out of synch with MediaControls, so it doesn't slow the code down.
            // If it were to run synchronously, the play/pause has a noticeable lag when changing symbols.
            setTimeout(() => Terrier.ovl.timePlay(), 1)

            if (togglePlayButton == playIcon) {
                const timeRange = Terrier.ovl.getTimeRange()
                const range = (Number(timeRange[1]) - Number(timeRange[0]))
                intervalId = setInterval(() => {
                    document.getElementById('scrubber-range').value = ((Number(Terrier.ovl.getCurrentTime()) - Number(timeRange[0])) / range) * 10000
                    setCurrDate(moment(Number(Terrier.ovl.getCurrentTime())).format('dddd, MMMM Do, h:mm a'))
                }, 100 / ( globalState.animSpeed * globalState.animSpeed )) // Getting a faster interval when animSpeed is higher so it's smoother, no hard science going on here.
            } else {
                clearInterval(intervalId)
            }
        }
    }

    return (
        <>
            <div className='media-controls'>
                <p id='media-date'>{currDate.toString()}</p>
                <div id='scrubber-controls'>
                    <a href='#' onClick={() => { () => onPlay() }}> <img draggable='false' id='play-button' src={togglePlayButton} /> </a>
                    <input type='range' min='0' max='10000' defaultValue={scrubberValue} id='scrubber-range' onChange={(e) => handleChange(e)} />
                    <p>{(globalState.animSpeed).toFixed(1)}x</p>
                </div>
            </div>
        </>
    )
}

export default MediaControls