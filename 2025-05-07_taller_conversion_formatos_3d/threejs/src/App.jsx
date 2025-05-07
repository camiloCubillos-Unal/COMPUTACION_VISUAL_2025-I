import { useState } from 'react'
import './App.css'
import ModelViewer from './components/ModelViewer'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Visor de Modelos 3D</h1>
        <p>Visualización y análisis de modelos OBJ, STL y GLTF</p>
      </header>
      <main>
        <ModelViewer />
      </main>
    </div>
  )
}

export default App
