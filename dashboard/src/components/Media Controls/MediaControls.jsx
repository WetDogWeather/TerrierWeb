import moment from 'moment' // date formatter

import './mediacontrols.css'
import playIcon from '../../assets/play-button.png'
import pauseIcon from '../../assets/pause.png'

//
// Handles time scrubber at the bottom, play functionality, and displaying date
//

function MediaControls({curTime,setCurTime,timeRange,isPlaying,setIsPlaying,animSpeed}) {
    // const [time, setTime] = useState(Date.now());
      
    // Date we're showing
    const displayDate = moment(Number(new Date(curTime*1000))).format('dddd, MMMM Do, h:mm a')

    // Setting the scrubber value when this component re-renders.  
    // Making sure the icon is correct.
    // This logic is necessary incase the MediaControls need to de-render and re-render because of fullscreen.
    const range = (Number(timeRange[1]) - Number(timeRange[0]))
    const scrubberValue = ((Number(curTime) - Number(timeRange[0])) / range) * 10000

    // Calculate new time
    const handleChange = (e) => {
        setIsPlaying(false)
        setCurTime(e.target.value / 10000 * (timeRange[1]-timeRange[0]) + timeRange[0])
    }

    // Called when the user clicks the play or pause button
    // TODO: We don't have to make this a toggle.  We could make it deterministic 
    function onPlayClick() {
        setIsPlaying(!isPlaying)
    }

    return (
        <>
            <div className='media-controls'>
                <p id='media-date'>{displayDate.toString()}</p>
                <div id='scrubber-controls'>
                    <img draggable='false' id='play-button' src={(isPlaying ? pauseIcon : playIcon)} 
                        onClick={() => onPlayClick() }/>
                    <input type='range' min='0' max='10000' value={scrubberValue} id='scrubber-range' 
                           onChange={(e) => handleChange(e)} />
                    <p>{(animSpeed).toFixed(1)}x</p>
                </div>
            </div>
        </>
    )
}

export default MediaControls