import './dropdown.css'

/* NOT SURE IF THIS COMPONENT IS REALLY NECESSARY */

function DropdownContent(props) {

    console.log(' -- DropdownContent.jsx rendered')

    return (
        <>
            <div className='dropdown-content'>
                {props.children}
            </div>
        </>
    )
}

export default DropdownContent