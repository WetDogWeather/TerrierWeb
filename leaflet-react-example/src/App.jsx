import { useState, useEffect } from 'react'
import { MapContainer, TileLayer } from "react-leaflet";
import TerrierLayer from "./TerrierLayer.jsx";
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const position = [51.505, -0.09];
  const [layerEnable, setLayerEnable] = useState(true)

  // Turn the terrier layer off after some time
  // This is here to test shutting down the layer and firing it back up again
  // useEffect(() => {
  //   setTimeout(() => {
  //     setLayerEnable(false)

  //     setTimeout(() => {
  //       setLayerEnable(true)
  //     }, 10000)
  //   }, 10000)
  // }, [])

  return (
    <MapContainer
      center={position}
      zoom={3}
      scrollWheelZoom={true}
      style={{ minHeight: "100vh", minWidth: "100vw" }}
      zoomAnimation={false}
      zoomAnimationThreshold={0.0}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      { layerEnable &&
        <TerrierLayer></TerrierLayer>
      }
    </MapContainer>
  );
}

export default App
