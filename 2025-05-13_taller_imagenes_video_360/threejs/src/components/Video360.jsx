import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function Video360() {
  const meshRef = useRef()
  const [videoTexture, setVideoTexture] = useState(null)

  useEffect(() => {
    const video = document.createElement('video')
    video.src = '/video.mp4'
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.muted = true
    video.play()

    const texture = new THREE.VideoTexture(video)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.format = THREE.RGBFormat

    setVideoTexture(texture)

    return () => {
      video.pause()
      video.src = ''
      texture.dispose()
    }
  }, [])

  if (!videoTexture) return null

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]}>
      <sphereGeometry args={[10, 60, 40]} />
      <meshBasicMaterial map={videoTexture} side={THREE.BackSide} />
    </mesh>
  )
}
