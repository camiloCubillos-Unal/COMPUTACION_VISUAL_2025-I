import React from 'react'
import { Leva, useControls } from 'leva'

export default function ControlsUI({ setRoughness, setMetalness }) {
  const { roughness, metalness } = useControls({
    roughness: {
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (v) => setRoughness(v),
    },
    metalness: {
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (v) => setMetalness(v),
    },
  })

  return <Leva oneLineLabels />
}
