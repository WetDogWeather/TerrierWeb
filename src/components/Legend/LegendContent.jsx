import { useContext } from 'react'
import { GlobalStateContext } from '../../App'
import './legend.css'

function LegendContent(props) {

    const [globalState, setGlobalState] = useContext(GlobalStateContext)

    return (
        <>
            {(globalState.mapState == props.requiredState) && props.children}
        </>
    )
}

export default LegendContent