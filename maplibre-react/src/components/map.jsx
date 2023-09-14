import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import Terrier from "../../terrier.js"
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

var terrierInit = false

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(-100);
  const [lat] = useState(35.6844);
  const [zoom] = useState(3);
  const [API_KEY] = useState('shArXuSxvZazDjMsjkIm');

  useEffect(() => {
    if (map.current) return; // stops map from initializing more than once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/dataviz/style.json?key=${API_KEY}`,
      center: [lng, lat],
      zoom: zoom
    });
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    if (terrierInit) {
        return
      }
      terrierInit = true
  
      // Tell Terrier to hook itself into MapLibre
      Terrier.startMapLibre('dev', map.current, (ovl) => {
        // Tell us what's in the stack
        ovl.fetchStackContents((contents) => {
          console.log("Stack contains:\n" + contents)
        });
  
        // Toss in country/state outlines
        ["ne_50m_admin_0_countries", "ne_50m_admin_1_states_provinces"].forEach(c =>
          fetch("geojson/" + c + ".geojson").then(result =>
              result.text().then(t => {
                  console.debug("Adding " + c + ".geojson")
                  ovl.addGeoJSON(t)
              })))
  
        // Turn on a layer
        let tempLayer = ovl.startLayer('temperature', {
            // colorMap: {}
            // level: 80
            interpMode: 'linear',
            opacity: 0.5,
            importFactor: 1.0,
        })
  
        // let windLayer = ovl.startLayer('windUV', {
        //     // colorMap: {}
        //     // level: 80
        //     interpMode: 'nearest',
        //     // interpMode: 'linear',
        //     opacity: 0.75,
        //     importFactor: 1.0,
        // })
  
        // To set the time to now + 1hr
        // let d = new Date();
        // let now = d.getTime() / 1000
        // ovl.setCurrentTime(now+1*60*60)
  
        // To animate over the available time
        ovl.timePlay({period: 10.0})
      })
      
  }, [API_KEY, lng, lat, zoom]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}
