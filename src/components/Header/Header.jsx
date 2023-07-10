import wdwLogo from '../../assets/wdw.png'
import './header.css'

function Header(props) {
    return (
        <>
            <nav className="header">
                <img src={wdwLogo} alt="Wet Dog Weather Logo" height="150px" />
                <h2 style={{ marginRight: 'auto' }}>Terrier + MapLibre</h2>
                <ul className="header-nav"> {props.children} </ul>
            </nav>
        </>
    )
}

export default Header