import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import Terrier from '@wetdogweather/terrier'
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

export default function Map({stackName,readyFunc,fullScreen,mapName,onClick}) {
  const mapContainer = useRef(null);
  const [map,setMap] = useState(null);
  const [lng] = useState(-100);
  const [lat] = useState(35.6844);
  const [zoom] = useState(3);
  const [API_KEY] = useState('cc323035-fcde-415b-b043-f7ada67d4723');
  const [navControl,setNavControl] = useState(null)

  // Called when the stackName changes
  useEffect(() => {
    if (stackName == Terrier.stackName) { return  }
    Terrier.changeStack(stackName, null, (ovl) => {
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
      style: `https://tiles.stadiamaps.com/styles/${mapName}.json?api_key=${API_KEY}`,
      center: [lng, lat],
      zoom: zoom
    });
    setNavControl(new maplibregl.NavigationControl())
    setMap(newMap)

    // Capture clicks
    newMap.on('click', (e) => {
      onClick(e)
    })

    newMap.on('load', () => {
      // Find the index of the first symbol layer in the map style
      const layers = newMap.getStyle().layers;
      let symbolLayerId;
      for (let i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol') {
            symbolLayerId = layers[i].id;
            break;
          }
      }
      
      // Tell Terrier to hook itself into MapLibre
      let apiKey = "5f399f64-af7a-4902-a147-db4da405017c"
      Terrier.startMapLibre(stackName, apiKey, newMap, (ovl) => {
          readyFunc(ovl)

          // Tell us what's in the stack
          // ovl.fetchStackContents((contents) => {
          //   console.log("Stack contains:\n" + contents)
          // });
          return () => {
            console.log("Asked to shut map down, which we don't know how to do.")
          }
      }, symbolLayerId)
    })
          
  }, [API_KEY, lng, lat, zoom]);

  useEffect(() => {
    // Style can change from Settings)
    if (map && mapName.length > 0) {
        map.on('styledata', () => {
          // Find the index of the first symbol layer in the map style
          const layers = map.getStyle().layers;
          let symbolLayerId = null;
          for (let i = 0; i < layers.length; i++) {
              if (layers[i].type === 'symbol') {
                symbolLayerId = layers[i].id;
                break;
              }
          }

          // If we switch styles, we may need to move the custom layer
          let maplibreLayer = Terrier.getMapLibreLayer()
          if (maplibreLayer && symbolLayerId) {
            map.moveLayer(maplibreLayer.id,symbolLayerId)
          }
      })
      map.setStyle(`https://tiles.stadiamaps.com/styles/${mapName}.json?api_key=${API_KEY}`)
    }
  }, [mapName])

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
