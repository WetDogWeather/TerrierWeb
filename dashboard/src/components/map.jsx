import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import Terrier from "../../terrier.js"
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

export default function Map({stackName,readyFunc,fullScreen,onClick}) {
  const mapContainer = useRef(null);
  const [map,setMap] = useState(null);
  const [lng] = useState(-100);
  const [lat] = useState(35.6844);
  const [zoom] = useState(3);
  const [API_KEY] = useState('shArXuSxvZazDjMsjkIm');
  const [navControl,setNavControl] = useState(null)

  // Called when the stackName changes
  useEffect(() => {
    if (stackName == Terrier.stackName) { return  }
    Terrier.changeStack(stackName, (ovl) => {
        readyFunc(ovl)
    }, () => {
        console.log("Unable to use stack named: " + stackName)
    })
  });

  // Called when the mapContainer gets updated
  useEffect(() => {
    if (map) return; // stops map from initializing more than once

    let newMap = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://tiles.stadiamaps.com/styles/alidade_satellite.json`,
      center: [lng, lat],
      zoom: zoom
    });
    setNavControl(new maplibregl.NavigationControl())
    setMap(newMap)

    // Capture clicks
    newMap.on('click', (e) => {
      onClick(e)
    })

    newMap.on('style.load', () => {
      // Find the index of the first symbol layer in the map style
      const layers = newMap.getStyle().layers;
      let borderLayerId;
      let symbolLayerId;
      for (let i = 0; i < layers.length; i++) {
          if (layers[i].id === 'Other border') {
            borderLayerId = layers[i].id;
          }
          if (layers[i].type === 'symbol') {
            symbolLayerId = layers[i].id;
            break;
          }
      }
      
      // Tell Terrier to hook itself into MapLibre
      Terrier.startMapLibre(stackName, newMap, (ovl) => {
          readyFunc(ovl)

          // Could just add this the startLayer, but needed a way to test moveLayer worked
          let maplibreLayer = Terrier.getMapLibreLayer()
          newMap.moveLayer(maplibreLayer.id,symbolLayerId)

          // Tell us what's in the stack
          // ovl.fetchStackContents((contents) => {
          //   console.log("Stack contains:\n" + contents)
          // });
          return () => {
            console.log("Asked to shut map down, which we don't know how to do.")
          }
      })
    })
          
  }, [API_KEY, lng, lat, zoom]);

  // Add or remove little zoom control in the upper right
  useEffect(() => {
    if (navControl == null || map == null) { return }
    if (fullScreen) {
        if (map.hasControl(navControl)) {
            map.removeControl(navControl)
        }
    } else {    
        map.addControl(navControl, 'top-right');
    }
  }, [map,navControl,fullScreen])

  return (
    <div className={fullScreen ? "map-wrap-full" : "map-wrap"}>
      <div ref={mapContainer} className="map" />
    </div>
  );
}
