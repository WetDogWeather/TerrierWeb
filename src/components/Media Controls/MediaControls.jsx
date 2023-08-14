import moment from 'moment' // date formatter

import { useContext, useState } from 'react'
import { GlobalStateContext } from '../../App'
import './mediacontrols.css'

import playIcon from '../../assets/play-button.png'
import pauseIcon from '../../assets/pause.png'

var intervalId // id for the setInterval that resets the time scrubber when the map is playing

var currDateDefault = 'default'

setTimeout(() => {
    currDateDefault = 'changed'
}, 1000)

function MediaControls() {

    console.log(' -- MediaControls.jsx rendered')

    const [globalState, setGlobalState] = useContext(GlobalStateContext)

    const [currDate, setCurrDate] = useState('No data being displayed...')
    const [oldMapState, setOldMapState] = useState(0) // Used to know if the mapState switches, so the date can be reset.
    const [defaultTime, setDefaultTime] = useState(-1)
    const [togglePlayButton, setTogglePlayButton] = useState(playIcon)  // Temporary solution. UI should know if the map is playing / isn't playing
                                                            // in real time and should just use an if statement to determine text or image
                                                            // instead of manually updating text like this.

    if (defaultTime == -1) { // Called only when map is initialized for the first time.
            setTimeout(() => {
                setDefaultTime(moment(Number(Module.tracker.curTime)).format('dddd, MMMM Do, h:mm a'))
                setCurrDate(moment(Number(Module.tracker.curTime)).format('dddd, MMMM Do, h:mm a'))
                //document.getElementById('scrubber-range').value = '5000' // Not how you're supposed to do it in React? I'm not sure if this is best practice. Too vanilla JS-ish
            }, 3000)
    }

    if (oldMapState != globalState.mapState) { // Detecting when layers switch
        setOldMapState(globalState.mapState)
        setCurrDate(defaultTime)
        //document.getElementById('scrubber-range').value = '5000' // Possibly not best practice.

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
        if (globalState.mapState != 'none') {
            Module.togglePlay()
            if (togglePlayButton == playIcon) { // if map is currently playing (find better solution later)
                const range = (Number(Module.tracker.maxTime) - Number(Module.tracker.minTime))
                intervalId = setInterval(() => {
                    document.getElementById('scrubber-range').value = ((Number(Module.tracker.curTime) - Number(Module.tracker.minTime)) / range) * 10000
                    setCurrDate(moment(Number(Module.tracker.curTime)).format('dddd, MMMM Do, h:mm a'))
                    console.log('updating scrubber...')
                }, 500 / globalState.animSpeed) // Getting a faster interval when animSpeed is higher, no hard science going on here.
            } else { // if map is currently NOT playing
                clearInterval(intervalId)
            }
            setTogglePlayButton((togglePlayButton == playIcon) ? pauseIcon : playIcon)
        }
    }

    return (
        <>
            <div className='media-controls'>
                <p id='media-date'>{currDate.toString()}</p>
                <div id='scrubber-controls'>
                    <a href='#' onClick={() => { onPlay() }}> <img draggable='false' id='play-button' src={ togglePlayButton } /> </a>
                    <input type='range' min='0' max='10000' defaultValue='5000' id='scrubber-range' onChange={(e) => handleChange(e)} />
                    <p>{(globalState.animSpeed).toFixed(1)}x</p>
                </div>
            </div>
        </>
    )
}

export default MediaControls