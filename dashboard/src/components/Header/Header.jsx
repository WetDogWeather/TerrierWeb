import wdwLogo from '../../assets/wdw.png'
import zeusLogo from '../../assets/zeusLogo.png'
import './header.css'

function Header(props) {
    return (
        <>
            <nav className="header">
                    <img id='logo' src={zeusLogo} alt="Zeus.ai Logo" /> 
                    <h1 id='splash-text'>LENS-Cast</h1>
                    <div>
                    <h3 id='splash-text2'>Visualization by </h3>
                    <a href="https://www.wetdogweather.com/">
                    <img id='logo2' src={wdwLogo} height='40px' />
                    </a>
                    </div>
                <ul className="header-nav"> {props.children} </ul>
            </nav>
        </>
    )
}

export default Header