import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import ModelViewer from './components/ModelViewer'
import ModelInfo from './components/ModelInfo'
import FileUploader from './components/FileUploader'
import './App.css'

function App() {
  const [modelFile, setModelFile] = useState(null)
  const [modelInfo, setModelInfo] = useState(null)
  const [visualizationMode, setVisualizationMode] = useState('normal')
  const [orbitControlsRef, setOrbitControlsRef] = useState(null)

  // Función para manejar la carga del modelo
  const handleModelUpload = (file) => {
    setModelFile(file)
  }

  // Función para actualizar información del modelo
  const updateModelInfo = (info) => {
    setModelInfo(info)
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1>Visualizador 3D</h1>
        <FileUploader onFileUpload={handleModelUpload} />
        
        <div className="visualization-controls">
          <h3>Modo de visualización</h3>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="normal"
                checked={visualizationMode === 'normal'}
                onChange={() => setVisualizationMode('normal')}
              />
              Normal
            </label>
            <label>
              <input
                type="radio"
                value="wireframe"
                checked={visualizationMode === 'wireframe'}
                onChange={() => setVisualizationMode('wireframe')}
              />
              Aristas (Wireframe)
            </label>
            <label>
              <input
                type="radio"
                value="vertices"
                checked={visualizationMode === 'vertices'}
                onChange={() => setVisualizationMode('vertices')}
              />
              Vértices
            </label>
            <label>
              <input
                type="radio"
                value="faces"
                checked={visualizationMode === 'faces'}
                onChange={() => setVisualizationMode('faces')}
              />
              Caras
            </label>
          </div>
        </div>
        
        {modelInfo && <ModelInfo info={modelInfo} />}
      </div>
      
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <OrbitControls makeDefault />
          {modelFile && (
            <ModelViewer 
              file={modelFile} 
              mode={visualizationMode}
              updateModelInfo={updateModelInfo}
            />
          )}
        </Canvas>
      </div>
    </div>
  )
}

export default App
