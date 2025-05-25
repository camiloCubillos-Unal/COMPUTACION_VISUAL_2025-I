import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import './App.css'

function Cubo({ position }) {
  const meshRef = useRef()
  
  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    // Rotación sobre su propio eje
    meshRef.current.rotation.x += 0.01
    meshRef.current.rotation.y += 0.01
    
    // Escalado usando una función temporal
    const scale = 1 + 0.2 * Math.sin(time * 2)
    meshRef.current.scale.set(scale, scale, scale)
    
    // Traslación en trayectoria circular
    meshRef.current.position.x = position[0] + Math.sin(time) * 2
    meshRef.current.position.z = position[2] + Math.cos(time) * 2
  })
  
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}


function Escena() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Cubo position={[0, 0, 0]} />
      <gridHelper args={[10, 10]} />
      <OrbitControls enableDamping />
    </>
  )
}

function InfoPanel() {
  return (
    <div className="info-panel">
      <h3>Controles:</h3>
      <p>- Arrastrar: Rotar cámara</p>
      <p>- Scroll: Zoom</p>
      <p>- Shift + Arrastrar: Mover cámara</p>
    </div>
  )
}

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        <Escena />
      </Canvas>
      <InfoPanel />
    </div>
  )
}

export default App
