import './header.css'

function Header(props) {
    return (
        <>
            <nav className="header">
                <h1 id='splash-text'>Distinguished Media Company Logo Here</h1>
                <ul className="header-nav"> {props.children} </ul>
            </nav>
        </>
    )
}

export default Header