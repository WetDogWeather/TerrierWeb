import './dropdown.css'

//
// Renders <DropdownContent> inside <Dropdown> if this button is pressed.
//
function DropdownButton({icon,layerName,isActive,setActive}) {
    return (
        <>
            <li key={'dropdown-button-li-'+layerName}>
                <a href='#' key={'dropdown-button-a-'+layerName} draggable='false' onClick={() => setActive()}> 
                <img key={'dropdown-button-img-'+layerName} draggable='false' 
                        className={`dropdown-button ${(isActive) ? 'dropdown-button-active' : ''}`} src={icon} /></a>
            </li>
        </>
    )
}

// Should try to get this function to run within the Dropdown function, so it has direct access to props.newMapState and globalState.layers[]
// If it is in DropdownButton(), each button on the UI will have its own debounce function. They won't be universal.
// Declaring it outside of the scope will make sure every Dropdown Button on the UI will use the same debounce.
// const updateLayers = throttle((id, layers) => {
//     for (var i = 0; i < layers.length; i++) {
//         if (i == id) {
//             layers[i].enable(true)
//         } else {
//             layers[i].enable(false)
//         }
//     }

// }, 3000)

export default DropdownButton