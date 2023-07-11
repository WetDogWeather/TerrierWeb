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
                <a href='#' onClick={() => handleClick()}> <img class='dropdown-button' src={props.icon} height='70px'/></a>
                {(dropdownState == props.newDropdownState) && props.children}
            </li>
        </>
    )
}

export default DropdownButton