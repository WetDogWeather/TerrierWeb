import wdwLogo from '../../assets/wdw.png'
import './header.css'

function Header(props) {

    console.log(' -- Header.jsx rendered')

    return (
        <>
            <nav className="header">
                <img id='logo' src={wdwLogo} alt="Wet Dog Weather Logo" />
                <h1 id='splash-text'>Terrier + MapLibre</h1>
                <ul className="header-nav"> {props.children} </ul>
            </nav>
        </>
    )
}

export default Header