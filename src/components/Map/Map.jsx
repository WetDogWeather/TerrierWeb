var init = false;

function Map(props) {

    if (!init) {
        var initializationFunction = (ov) => {
          console.log('===================overlay initialized!');
          props.initLayer.enable(true);
          setTimeout(() => {
            ["ne_50m_admin_0_countries","ne_50m_admin_1_states_provinces"].forEach(c =>
              fetch("geojson/"+c+".geojson").then(result =>
                result.text().then(t => {
                  console.debug("Adding " + c + ".geojson")
                  ov.addGeoJSON(t);
                })));
                //console.log(Module.tempCtl);
            }, 1000);
        };
      
        // This code might need work
        if (Module.emInitialized == true) {
          initializationFunction(Module.overlay)
        } else {
          Module.onOverlayInitialized = initializationFunction
        }
        init = true;
      }

    return (
        <></>
    )
}

export default Map