import { useEffect, useState, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useGLTF, useTexture, useBVH } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

const ModelViewer = ({ file, mode, updateModelInfo }) => {
  const [geometry, setGeometry] = useState(null)
  const { scene, camera, controls } = useThree()
  const modelRef = useRef(null)
  const pointsRef = useRef(null)
  const groupRef = useRef(null)
  
  // Inicializar el grupo una sola vez
  useEffect(() => {
    const group = new THREE.Group()
    scene.add(group)
    groupRef.current = group
    
    return () => {
      // Limpieza al desmontar
      cleanupScene()
      scene.remove(group)
    }
  }, [])
  
  // Función de limpieza completa
  const cleanupScene = () => {
    // Limpiar el grupo
    if (groupRef.current) {
      while (groupRef.current.children.length > 0) {
        const object = groupRef.current.children[0]
        disposeObject(object)
        groupRef.current.remove(object)
      }
    }
    
    // Limpiar los puntos
    if (pointsRef.current) {
      if (pointsRef.current.geometry) {
        pointsRef.current.geometry.dispose()
      }
      if (pointsRef.current.material) {
        pointsRef.current.material.dispose()
      }
      scene.remove(pointsRef.current)
      pointsRef.current = null
    }
    
    // Limpiar referencias
    modelRef.current = null
  }
  
  // Función para disponer objetos recursivamente
  const disposeObject = (object) => {
    if (!object) return
    
    // Procesar hijos recursivamente
    if (object.children && object.children.length > 0) {
      // Crear una copia del array ya que estaremos modificándolo
      const children = [...object.children]
      for (const child of children) {
        disposeObject(child)
        object.remove(child)
      }
    }
    
    // Liberar recursos
    if (object.geometry) {
      object.geometry.dispose()
    }
    
    if (object.material) {
      if (Array.isArray(object.material)) {
        for (const material of object.material) {
          disposeMaterial(material)
        }
      } else {
        disposeMaterial(object.material)
      }
    }
  }
  
  // Función auxiliar para liberar recursos de materiales
  const disposeMaterial = (material) => {
    if (!material) return
    
    // Liberar texturas y mapas
    const properties = [
      'map', 'lightMap', 'bumpMap', 'normalMap', 
      'specularMap', 'envMap', 'alphaMap', 'aoMap',
      'displacementMap', 'emissiveMap', 'metalnessMap',
      'roughnessMap'
    ]
    
    for (const prop of properties) {
      if (material[prop]) {
        material[prop].dispose()
      }
    }
    
    material.dispose()
  }
  
  // Función para centrar la cámara
  const resetCamera = (model) => {
    if (!camera || !controls || !model) return
    
    // Calcular bounding box
    const box = new THREE.Box3().setFromObject(model)
    if (box.isEmpty()) return
    
    // Centrar en el modelo
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    
    // Distancia basada en el tamaño y FOV
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = camera.fov * (Math.PI / 180)
    const distance = maxDim / (2 * Math.tan(fov / 2)) * 1.5
    
    // Posicionar cámara
    const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion)
    const newPosition = center.clone().add(direction.multiplyScalar(distance))
    
    camera.position.copy(newPosition)
    controls.target.copy(center)
    controls.update()
  }
  
  // Cargar el modelo cuando cambia el archivo
  useEffect(() => {
    if (!file || !groupRef.current) return
    
    // Crear URL para el archivo
    const fileURL = URL.createObjectURL(file)
    const fileExtension = file.name.split('.').pop().toLowerCase()
    
    // Limpiar escena antes de cargar nuevo modelo
    cleanupScene()
    
    // Función común para procesar el modelo cargado
    const processModel = (loadedModel, loadedGeometry = null) => {
      // Añadir al grupo
      groupRef.current.add(loadedModel)
      modelRef.current = loadedModel
      
      // Extraer geometría si no se proporcionó
      if (!loadedGeometry) {
        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh && !loadedGeometry) {
            loadedGeometry = child.geometry
          }
        })
      }
      
      if (loadedGeometry) {
        setGeometry(loadedGeometry)
        
        // Información del modelo
        const modelInfo = {
          format: fileExtension.toUpperCase(),
          fileName: file.name,
          fileSize: file.size,
          vertices: loadedGeometry.attributes.position.count
        }
        
        // Contar caras/triángulos si hay índices
        if (loadedGeometry.index) {
          modelInfo.triangles = loadedGeometry.index.count / 3
          modelInfo.faces = loadedGeometry.index.count / 3
          modelInfo.edges = Math.max(0, Math.round(3 * modelInfo.faces / 2))
        }
        
        updateModelInfo(modelInfo)
      }
      
      // Centrar y escalar modelo
      const box = new THREE.Box3().setFromObject(loadedModel)
      if (!box.isEmpty()) {
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        
        if (maxDim > 0) {
          const scale = 2 / maxDim
          loadedModel.position.sub(center)
          loadedModel.scale.multiplyScalar(scale)
        }
      }
      
      // Centrar cámara
      resetCamera(loadedModel)
      
      // Aplicar modo de visualización inicial
      updateVisualizationMode(mode)
    }
    
    let loader
    
    // Cargar según el tipo de archivo
    switch (fileExtension) {
      case 'obj':
        loader = new OBJLoader()
        loader.load(fileURL, 
          (obj) => processModel(obj),
          (xhr) => console.log(`${Math.round(xhr.loaded / xhr.total * 100)}% cargado`),
          (error) => console.error('Error cargando OBJ:', error)
        )
        break
        
      case 'stl':
        loader = new STLLoader()
        loader.load(fileURL, 
          (geometry) => {
            const material = new THREE.MeshStandardMaterial({
              color: 0xaaaaaa,
              metalness: 0.25,
              roughness: 0.6,
              side: THREE.DoubleSide
            })
            geometry.computeVertexNormals()
            const mesh = new THREE.Mesh(geometry, material)
            processModel(mesh, geometry)
          },
          (xhr) => console.log(`${Math.round(xhr.loaded / xhr.total * 100)}% cargado`),
          (error) => console.error('Error cargando STL:', error)
        )
        break
        
      case 'gltf':
      case 'glb':
        loader = new GLTFLoader()
        loader.load(fileURL, 
          (gltf) => processModel(gltf.scene),
          (xhr) => console.log(`${Math.round(xhr.loaded / xhr.total * 100)}% cargado`),
          (error) => console.error('Error cargando GLTF/GLB:', error)
        )
        break
        
      default:
        console.error('Formato no soportado:', fileExtension)
    }
    
    return () => {
      URL.revokeObjectURL(fileURL)
    }
  }, [file])
  
  // Actualizar visualización cuando cambia el modo
  useEffect(() => {
    updateVisualizationMode(mode)
  }, [mode])
  
  // Función central para actualizar el modo de visualización
  const updateVisualizationMode = (currentMode) => {
    if (!modelRef.current) return
    
    console.log('Actualizando modo de visualización a:', currentMode)
    
    // Limpiar puntos anteriores
    if (pointsRef.current) {
      scene.remove(pointsRef.current)
      if (pointsRef.current.geometry) pointsRef.current.geometry.dispose()
      if (pointsRef.current.material) pointsRef.current.material.dispose()
      pointsRef.current = null
    }
    
    // Aplicar visualización según el modo
    modelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Hacer visible la malla
        child.visible = true
        
        // Asegurar que la geometría tenga normales
        if (child.geometry && !child.geometry.attributes.normal) {
          child.geometry.computeVertexNormals()
        }
        
        // Aplicar material según el modo
        switch (currentMode) {
          case 'normal':
            child.material = new THREE.MeshStandardMaterial({
              color: 0xaaaaaa,
              metalness: 0.25,
              roughness: 0.6,
              side: THREE.DoubleSide
            })
            break
            
          case 'wireframe':
            child.material = new THREE.MeshBasicMaterial({
              color: 0x00ff00,
              wireframe: true,
              side: THREE.DoubleSide
            })
            break
            
          case 'vertices':
            // Hacer la malla semitransparente
            child.material = new THREE.MeshBasicMaterial({
              color: 0xaaaaaa,
              transparent: true,
              opacity: 0.1,
              side: THREE.DoubleSide
            })
            
            // Crear visualización de vértices
            if (child.geometry) {
              const pointsGeometry = new THREE.BufferGeometry()
              pointsGeometry.setAttribute('position', child.geometry.attributes.position.clone())
              
              const pointsMaterial = new THREE.PointsMaterial({
                color: 0xff0000,
                size: 0.03,
                sizeAttenuation: true
              })
              
              const points = new THREE.Points(pointsGeometry, pointsMaterial)
              
              // Aplicar transformaciones
              child.updateWorldMatrix(true, false)
              points.applyMatrix4(child.matrixWorld)
              
              // Añadir a la escena
              pointsRef.current = points
              scene.add(points)
            }
            break
            
          case 'faces':
            child.material = new THREE.MeshBasicMaterial({
              color: 0x0000ff,
              flatShading: true,
              transparent: true,
              opacity: 0.7,
              side: THREE.DoubleSide
            })
            break
            
          default:
            child.material = new THREE.MeshStandardMaterial({
              color: 0xaaaaaa,
              metalness: 0.25,
              roughness: 0.6,
              side: THREE.DoubleSide
            })
        }
      }
    })
  }
  
  return null
}

export default ModelViewer 