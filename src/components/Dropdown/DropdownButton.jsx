import React, { useContext } from 'react'
import { GlobalStateContext } from '../../App'
import { DropdownStateContext } from './Dropdown'
import './dropdown.css'

// Renders <DropdownContent> inside <Dropdown> if this button is pressed.

function DropdownButton(props) {

    const [globalState, setGlobalState] = useContext(GlobalStateContext)
    const [dropdownState, setDropdownState] = useContext(DropdownStateContext)

    function handleClick() {
        // props.newDisplayState will be undefined if button is settings or attributions page.
        if (props.newDisplayState != undefined) { 
            setGlobalState({...globalState, mapState: props.newDisplayState})
        }
        setDropdownState(props.newDropdownState)
    }

    return (
        <>
            <li>
                <a href='#' draggable='false' onClick={() => handleClick()}> <img draggable='false' className={`dropdown-button ${(dropdownState == props.newDropdownState) ? 'dropdown-button-active' : '' }`} src={props.icon} /></a>
                {(dropdownState == props.newDropdownState) && props.children}
            </li>
        </>
    )
}

export default DropdownButton