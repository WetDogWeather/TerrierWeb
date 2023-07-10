import { useState } from 'react'
import './header.css'

function Burger(props) {

    const [open, setOpen] = useState(false)

    return (
        <>
            <li>
                <a href="#" onClick={() => setOpen(!open)}> { props.icon } </a>
                {open && props.children}
            </li>
        </>
    )
}

export default Burger