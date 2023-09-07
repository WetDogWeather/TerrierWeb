import './dropdown.css'

// Renders children.
// Might move everything into DropdownButton.jsx.

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