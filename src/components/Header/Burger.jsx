import { useState } from 'react'
import './header.css'

// Simply renders or de-renders children on click.

function Burger(props) {

    const [open, setOpen] = useState(false)

    return (
        <>
            <a href="#" onClick={() => setOpen(!open)}> <img src={props.icon} height='30px' /> </a>
            {open && props.children}
        </>
    )
}

export default Burger