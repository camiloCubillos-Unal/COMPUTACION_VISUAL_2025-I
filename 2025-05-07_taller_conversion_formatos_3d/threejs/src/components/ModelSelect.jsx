import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import './ModelSelect.css';

// Rutas a los modelos - Probamos varias posibilidades
const MODEL_PATHS = {
  obj: ['/src/models/model.obj', 'src/models/model.obj', './src/models/model.obj'],
  stl: ['/src/models/model.stl', 'src/models/model.stl', './src/models/model.stl'],
  gltf: ['/src/models/model.gltf', 'src/models/model.gltf', './src/models/model.gltf'],
};

const ModelSelect = ({ onModelLoad, onModelInfoUpdate, viewerReady = true }) => {
  const [currentFormat, setCurrentFormat] = useState('obj');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cargar el modelo inicial cuando el componente se monta y el visor está listo
  useEffect(() => {
    if (!viewerReady) return;
    
    // Pequeño retraso para asegurar que todo está listo
    const timer = setTimeout(() => {
      loadModel('obj');
    }, 500);
    
    return () => clearTimeout(timer);
  }, [viewerReady]);
  
  // Función para calcular información del modelo
  const calculateModelInfo = (model, format, fileName) => {
    let vertices = 0;
    let faces = 0;
    let edges = 0;
    let triangles = 0;
    let materialCount = 0;
    
    // Calcular bounding box para dimensiones
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    
    // Calcular propiedades recorriendo el modelo
    model.traverse((object) => {
      if (object.isMesh) {
        // Contar materiales
        if (object.material) {
          materialCount++;
        }
        
        // Obtener geometría
        const geometry = object.geometry;
        if (geometry.isBufferGeometry) {
          // Contar vértices
          if (geometry.attributes.position) {
            vertices += geometry.attributes.position.count;
          }
          
          // Contar caras/triángulos
          if (geometry.index) {
            triangles += geometry.index.count / 3;
          } else if (geometry.attributes.position) {
            triangles += geometry.attributes.position.count / 3;
          }
        }
      }
    });
    
    // Calcular aristas (aproximado)
    edges = Math.round(triangles * 3 / 2);
    faces = triangles;
    
    // Calcular tamaño de archivo (valores conocidos)
    let fileSize;
    switch (format) {
      case 'obj': fileSize = '2.5 MB'; break;
      case 'stl': fileSize = '2.3 MB'; break;
      case 'gltf': fileSize = '1.4 MB'; break;
      default: fileSize = 'Desconocido';
    }
    
    return {
      format: format.toUpperCase(),
      fileName,
      fileSize,
      vertices: Math.round(vertices),
      edges,
      faces: Math.round(faces),
      triangles: Math.round(triangles),
      materialCount,
      boundingBox: size,
      volume: size.x * size.y * size.z
    };
  };

  // Cargar un modelo 3D
  const loadModel = async (format) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    console.log(`Iniciando carga de modelo ${format}...`);
    
    try {
      let model = null;
      let fileName = `model.${format}`;
      let loader;
      
      // Intentar cargar desde diferentes rutas
      for (const path of MODEL_PATHS[format]) {
        try {
          console.log(`Intentando cargar desde: ${path}`);
          
          switch (format) {
            case 'obj':
              loader = new OBJLoader();
              model = await loader.loadAsync(path);
              break;
              
            case 'stl':
              loader = new STLLoader();
              const geometry = await loader.loadAsync(path);
              const material = new THREE.MeshStandardMaterial({ 
                color: 0x7a7a7a,
                flatShading: true
              });
              model = new THREE.Mesh(geometry, material);
              break;
              
            case 'gltf':
              loader = new GLTFLoader();
              const gltf = await loader.loadAsync(path);
              model = gltf.scene;
              break;
          }
          
          // Si llegamos aquí, la carga tuvo éxito
          console.log(`✅ Modelo ${format} cargado con éxito desde ${path}`);
          break;
        } catch (err) {
          console.warn(`⚠️ No se pudo cargar desde ${path}: ${err.message}`);
        }
      }
      
      // Verificar si se logró cargar el modelo
      if (!model) {
        throw new Error(`No se pudo cargar el modelo ${format} desde ninguna de las rutas probadas`);
      }
      
      // Calcular información del modelo y notificar
      const modelInfo = calculateModelInfo(model, format, fileName);
      onModelLoad(model);
      onModelInfoUpdate(modelInfo);
      setCurrentFormat(format);
      
    } catch (error) {
      console.error(`❌ Error al cargar el modelo ${format}:`, error);
      setError(`Error al cargar el modelo ${format}: ${error.message}`);
      
      // Notificar el error
      onModelInfoUpdate({
        format: format.toUpperCase(),
        fileName: `model.${format}`,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="model-selector">
      <div className="buttons-container">
        <button 
          onClick={() => loadModel('obj')}
          className={currentFormat === 'obj' ? 'active' : ''}
          disabled={isLoading}
        >
          OBJ
        </button>
        <button 
          onClick={() => loadModel('stl')}
          className={currentFormat === 'stl' ? 'active' : ''}
          disabled={isLoading}
        >
          STL
        </button>
        <button 
          onClick={() => loadModel('gltf')}
          className={currentFormat === 'gltf' ? 'active' : ''}
          disabled={isLoading}
        >
          GLTF
        </button>
      </div>
      {isLoading && <div className="loading">Cargando modelo...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default ModelSelect;