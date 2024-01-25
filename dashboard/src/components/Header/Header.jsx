import wdwLogo from '../../assets/wdw.png'
import zeusLogo from '../../assets/zeusLogo.png'
import './header.css'

function Header(props) {
    return (
        <>
            <nav className="header">
                <img id='logo' src={zeusLogo} alt="Zeus.ai Logo" />
                <h1 id='splash-text'>LENS-Cast</h1>
                <p id='splash-text'>  Visualization by Wet Dog Weather</p>
                <ul className="header-nav"> {props.children} </ul>
            </nav>
        </>
    )
}

export default Header