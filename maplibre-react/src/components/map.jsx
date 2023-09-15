import React, { useRef, useEffect, useContext, useState } from 'react';
import { GlobalStateContext } from '../App'
import maplibregl from 'maplibre-gl';
import Terrier from "../../terrier.js"
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

import Layer from '../Layers/Layer.jsx'
import TemperatureLayer from '../Layers/TemperatureLayer.jsx'

import tempIcon from '../assets/thermometer.png'
import windIcon from '../assets/wind.png'
import radarIcon from '../assets/radar.png'

export default function Map() {
  const [globalState, setGlobalState] = useContext(GlobalStateContext)
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

    // Tell Terrier to hook itself into MapLibre
    Terrier.startMapLibre('dev', map.current, (ovl) => {
        globalState.layers = 
        [new TemperatureLayer(ovl, 'Temperature', tempIcon, 'temperature', null, 'K', Terrier.TEMP_COLORS_GREY, Terrier.TEMP_COLORS_NOT_GREY),
            new Layer(ovl, 'Wind', windIcon, 'windUV', null, 'm/s', Terrier.WIND_COLORS_GREY, Terrier.WIND_COLORS_NOT_GREY),
            new Layer(ovl, 'Radar', radarIcon, 'radar', null, 'dBz', Terrier.RADAR_COLORS_GREY, Terrier.RADAR_COLORS_NOT_GREY)]
        globalState.layers[0].enable(true)

        // Tell us what's in the stack
        // ovl.fetchStackContents((contents) => {
        //   console.log("Stack contains:\n" + contents)
        // });
    })
      
  }, [API_KEY, lng, lat, zoom]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}
