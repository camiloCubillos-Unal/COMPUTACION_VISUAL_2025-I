import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import ScenePBR from './components/ScenePBR'
import ControlsUI from './components/ControlsUI'

export default function App() {
  const [roughness, setRoughness] = useState(0.5)
  const [metalness, setMetalness] = useState(0.5)

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 2, 6], fov: 50 }}
        style={{ height: '100vh', width: '100vw' }}
      >
        <ScenePBR roughnessVal={roughness} metalnessVal={metalness} />
      </Canvas>

      <ControlsUI setRoughness={setRoughness} setMetalness={setMetalness} />
    </>
  )
}
