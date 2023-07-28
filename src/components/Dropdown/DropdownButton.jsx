import React, { useContext } from 'react'
import { GlobalStateContext } from '../../App'
import { DropdownStateContext } from './Dropdown'
import './dropdown.css'

function DropdownButton(props) {

    const [globalState, setGlobalState] = useContext(GlobalStateContext)
    const [dropdownState, setDropdownState] = useContext(DropdownStateContext)

    function handleClick() {
        if (props.newDisplayState != undefined) {
            setGlobalState({...globalState, mapState: props.newDisplayState})
        }
        setDropdownState(props.newDropdownState)
    }

    return (
        <>
            <li>
                <a href='#' onClick={() => handleClick()}> <img className={`dropdown-button ${(dropdownState == props.newDropdownState) ? 'dropdown-button-active' : '' }`} src={props.icon} /></a>
                {(dropdownState == props.newDropdownState) && props.children}
            </li>
        </>
    )
}

export default DropdownButton