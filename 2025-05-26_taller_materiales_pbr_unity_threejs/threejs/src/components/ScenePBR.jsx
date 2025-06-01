import React, { useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { OrbitControls, Text } from '@react-three/drei'

import albedo from '../assets/albedo.jpg'
import roughness from '../assets/roughness.jpg'
import metalness from '../assets/metalness.jpg'
import normal from '../assets/normal.jpg'
import floorTexture from '../assets/floor.jpg' // Pon aquí tu textura de piso

export default function ScenePBR({ roughnessVal, metalnessVal }) {
  const pbrMaterialRef = useRef()

  // Cargar texturas PBR
  const [map, roughMap, metalMap, normalMap, floorMap] = useLoader(TextureLoader, [
    albedo,
    roughness,
    metalness,
    normal,
    floorTexture,
  ])

  // Configurar repetición para textura piso
  floorMap.wrapS = floorMap.wrapT = THREE.RepeatWrapping
  floorMap.repeat.set(10, 10)

  return (
    <>
      {/* Luces */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Piso */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial map={floorMap} roughness={1} metalness={0} />
      </mesh>

      {/* Objeto PBR */}
      <mesh position={[-2, 1, 0]} castShadow receiveShadow ref={pbrMaterialRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial
          map={map}
          roughnessMap={roughMap}
          metalnessMap={metalMap}
          normalMap={normalMap}
          roughness={roughnessVal}
          metalness={metalnessVal}
          clearcoat={0.1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Etiqueta objeto PBR */}
      <Text
        position={[-2, 0.1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        PBR Material
      </Text>

      {/* Objeto básico */}
      <mesh position={[2, 1, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial color="#777777" />
      </mesh>

      {/* Etiqueta objeto básico */}
      <Text
        position={[2, 0.1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Basic Material
      </Text>

      {/* Controles orbitarios */}
      <OrbitControls
        enableDamping
        dampingFactor={0.15}
        rotateSpeed={0.6}
        minDistance={3}
        maxDistance={15}
      />
    </>
  )
}
