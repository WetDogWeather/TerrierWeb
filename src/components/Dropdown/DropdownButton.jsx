import React, { useContext } from 'react'
import { GlobalStateContext } from '../../App'
import { DropdownStateContext } from './Dropdown'
import './dropdown.css'

import debounce from 'lodash.debounce'
import throttle from 'lodash.throttle'

// Renders <DropdownContent> inside <Dropdown> if this button is pressed.

var hclick = 0

function DropdownButton(props) {

    console.log(' -- DropdownButton.jsx rendered')

    const [globalState, setGlobalState] = useContext(GlobalStateContext)
    const [dropdownState, setDropdownState] = useContext(DropdownStateContext)

    function handleClick() {
        if (props.newMapState != undefined) {
            setGlobalState({ ...globalState, mapState: props.newMapState })

            updateLayers(props.newMapState, globalState.layers)
            // This needs to be throttled or debounced
            /*for (var i = 0; i < globalState.layers.length; i++) {
                if (i == props.newMapState) {
                    globalState.layers[i].enable(true)
                } else {
                    globalState.layers[i].enable(false)
                }
                Module.updateOverlay()
            }*/
        }

        setDropdownState(props.newDropdownState)
    }

    return (
        <>
            <li>
                <a href='#' draggable='false' onClick={() => handleClick()}> <img draggable='false' className={`dropdown-button ${(dropdownState == props.newDropdownState) ? 'dropdown-button-active' : ''}`} src={props.icon} /></a>
                {(dropdownState == props.newDropdownState) && props.children}
            </li>
        </>
    )
}

// Should try to get the debounce function to run within the Dropdown function, so it has direct access to props.newMapState and globalState.layers
// If it is in DropdownButton(), each button on the UI will have its own debounce function. They won't be universal.
// Declaring it outside of the scope will make sure every Dropdown Button on the UI will use the same debounce.
const updateLayers = throttle((id, layers) => {
    console.log(id)
    console.log(layers)
    console.log(layers[id])

    hclick++
    console.log('updateLayers ran ' + hclick + ' total times')


    for (var i = 0; i < layers.length; i++) {
        if (i == id) {
            layers[i].enable(true)
        } else {
            layers[i].enable(false)
        }
    }

}, 1000)

export default DropdownButton