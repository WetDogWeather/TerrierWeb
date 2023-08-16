import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { Helmet, HelmetProvider } from 'react-helmet-async'

// Let the module start the React app
function _appStartup() {
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
)
}

// Can't seem to reference _appStartup in index.html so doing this
setTimeout(() => {
  _appStartup()
}, 1000)
