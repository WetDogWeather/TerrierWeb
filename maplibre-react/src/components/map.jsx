import React, { useRef, useEffect, useContext, useState, createRef, forwardRef } from 'react';
import maplibregl from 'maplibre-gl';
import Terrier from "../../terrier.js"
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

export default function Map({stackName,readyFunc}) {
  const mapContainer = useRef(null);
  const [map,setMap] = useState(null);
  const [lng] = useState(-100);
  const [lat] = useState(35.6844);
  const [zoom] = useState(3);
  const [API_KEY] = useState('shArXuSxvZazDjMsjkIm');

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
      style: `https://api.maptiler.com/maps/dataviz/style.json?key=${API_KEY}`,
      center: [lng, lat],
      zoom: zoom
    });
    newMap.addControl(new maplibregl.NavigationControl(), 'top-right');
    setMap(newMap)

    // Tell Terrier to hook itself into MapLibre
    Terrier.startMapLibre(stackName, newMap, (ovl) => {
        readyFunc(ovl)

        // Tell us what's in the stack
        // ovl.fetchStackContents((contents) => {
        //   console.log("Stack contains:\n" + contents)
        // });

    return () => {
        console.log("Asked to shut map down, which we don't know how to do.")
    }
    },[mapContainer])
      
  }, [API_KEY, lng, lat, zoom]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}
