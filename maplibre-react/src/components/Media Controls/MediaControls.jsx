import moment from 'moment' // date formatter

import './mediacontrols.css'
import playIcon from '../../assets/play-button.png'
import pauseIcon from '../../assets/pause.png'

//
// Handles time scrubber at the bottom, play functionality, and displaying date
//

function MediaControls({curTime,setCurTime,timeRange,isPlaying,setIsPlaying,animSpeed}) {
    // const [time, setTime] = useState(Date.now());

    // // Call us every so often to update the display
    // useEffect(() => {
    //     const interval = setInterval(() => setTime(Date.now()), 1000);
    //     return () => {
    //       clearInterval(interval);
    //     };
    // }, []);
      
    // Date we're showing
    const displayDate = moment(Number(new Date(curTime*1000))).format('dddd, MMMM Do, h:mm a')

    // Setting the scrubber value when this component re-renders.
    // Making sure the icon is correct.
    // This logic is necessary incase the MediaControls need to de-render and re-render because of fullscreen.
    const range = (Number(timeRange[0]) - Number(timeRange[1]))
    const scrubberValue = ((Number(curTime) - Number(timeRange[0])) / range) * 10000

    // Calculate new time
    const handleChange = (e) => {
        setCurTime(e.target.value / 10000 * (timeRange[1]-timeRange[0]) + timeRange[0])
    }

    function onPlay() {
        // setTogglePlayButton((togglePlayButton == playIcon) ? pauseIcon : playIcon)
        // if (globalState.mapState != 'none') {
        //     if (globalThis.Terrier === undefined) { return }

        //     // This timeout allows togglePlay to run out of synch with MediaControls, so it doesn't slow the code down.
        //     // If it were to run synchronously, the play/pause has a noticeable lag when changing symbols.
        //     setTimeout(() => Terrier.ovl.timePlay(), 1)

        //     if (togglePlayButton == playIcon) {
        //         const timeRange = Terrier.ovl.getTimeRange()
        //         const range = (Number(timeRange[1]) - Number(timeRange[0]))
        //         intervalId = setInterval(() => {
        //             document.getElementById('scrubber-range').value = ((Number(Terrier.ovl.getCurrentTime()) - Number(timeRange[0])) / range) * 10000
        //             setCurrDate(moment(Number(Terrier.ovl.getCurrentTime())).format('dddd, MMMM Do, h:mm a'))
        //         }, 100 / ( globalState.animSpeed * globalState.animSpeed )) // Getting a faster interval when animSpeed is higher so it's smoother, no hard science going on here.
        //     } else {
        //         clearInterval(intervalId)
        //     }
        // }
    }

    return (
        <>
            <div className='media-controls'>
                <p id='media-date'>{displayDate.toString()}</p>
                <div id='scrubber-controls'>
                    <a href='#' onClick={() => { () => onPlay() }}> 
                    <img draggable='false' id='play-button' src={isPlaying ? pauseIcon : playIcon} /> </a>
                    <input type='range' min='0' max='10000' defaultValue={scrubberValue} id='scrubber-range' 
                           onChange={(e) => handleChange(e)} />
                    <p>{(animSpeed).toFixed(1)}x</p>
                </div>
            </div>
        </>
    )
}

export default MediaControls