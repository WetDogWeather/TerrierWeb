import { useRef, useEffect, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './map.css'

/* CODE HERE IS MOSTLY FROM MAPTILER- WILL LIKELY BE REPLACED ALMOST COMPLETELY WHEN TERRIER OBJECT IS IMPLEMENTED */

function Map() {
    const mapContainer = useRef(null)
    const map = useRef(null)
    const [lng] = useState(139.753)
    const [lat] = useState(35.6844)
    const [zoom] = useState(2)
    const [API_KEY] = useState('YZ4DexrhOg5oJYLzDEL9') // Matthew's API key :3

    useEffect(() => {
        if (map.current) return // stops map from intializing more than once
      
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
          center: [lng, lat],
          zoom: zoom
        })
      
      }, [API_KEY, lng, lat, zoom])

      return (
        <div className="map-wrap">
          <div ref={mapContainer} className="map" />
        </div>
      )
}

export default Map