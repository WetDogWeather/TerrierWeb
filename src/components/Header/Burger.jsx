import { useState } from 'react'
import './header.css'

function Burger(props) {

    const [open, setOpen] = useState(false)

    return (
        <>
            <a href="#" onClick={() => setOpen(!open)}> <img src={props.icon} height='50px' /> </a>
            {open && props.children}
        </>
    )
}

export default Burger