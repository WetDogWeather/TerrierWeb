import './dropdown.css'

/* NOT SURE IF THIS COMPONENT IS REALLY NECESSARY */

function DropdownContent(props) {
    return (
        <>
            <div className='dropdown-content'>
                {props.children}
            </div>
        </>
    )
}

export default DropdownContent