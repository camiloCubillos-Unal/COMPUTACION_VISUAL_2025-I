import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import ModelSelect from './ModelSelect';
import ModelInfo from './ModelInfo';
import './ModelViewer.css';

const ModelViewer = () => {
  // Refs
  const containerRef = useRef(null);
  
  // Estado
  const [modelInfo, setModelInfo] = useState(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  
  // Objetos three.js (mantenidos en refs directamente accesibles)
  const scene = useRef(new THREE.Scene());
  const camera = useRef(null);
  const renderer = useRef(null);
  const controls = useRef(null);
  const currentModel = useRef(null);
  const animationFrameId = useRef(null);
  const isFirstLoad = useRef(true); // Para controlar si es la primera carga
  const grid = useRef(null);
  const axes = useRef(null);
  
  // Inicialización de la escena Three.js
  useEffect(() => {
    // Solo ejecutar si el contenedor está disponible
    if (!containerRef.current) return;
    
    console.log('Inicializando escena Three.js');
    
    // Configurar escena
    scene.current.background = new THREE.Color(0xf5f5f5);
    
    // Configurar cámara
    camera.current = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.current.position.z = 5;
    
    // Configurar renderizador
    renderer.current = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.current.setSize(window.innerWidth, window.innerHeight);
    renderer.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.innerHTML = ''; // Limpiar por si acaso
    containerRef.current.appendChild(renderer.current.domElement);
    
    // Configurar luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.current.add(ambientLight);
    
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(2, 4, 5);
    scene.current.add(frontLight);
    
    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(-2, -1, -3);
    scene.current.add(backLight);
    
    // Añadir helpers
    grid.current = new THREE.GridHelper(10, 10);
    scene.current.add(grid.current);
    
    axes.current = new THREE.AxesHelper(3);
    scene.current.add(axes.current);
    
    // Configurar controles
    controls.current = new OrbitControls(camera.current, renderer.current.domElement);
    controls.current.enableDamping = true;
    controls.current.dampingFactor = 0.1;
    
    // Añadir placeholder hasta que se cargue un modelo
    const geometry = new THREE.TorusKnotGeometry(0.5, 0.2, 64, 16);
    const material = new THREE.MeshNormalMaterial({ wireframe: true });
    const placeholder = new THREE.Mesh(geometry, material);
    scene.current.add(placeholder);
    currentModel.current = placeholder;
    
    // Función de animación (bucle de renderizado)
    const animate = () => {
      animationFrameId.current = window.requestAnimationFrame(animate);
      
      // Animar placeholder
      if (currentModel.current && currentModel.current.geometry instanceof THREE.TorusKnotGeometry) {
        currentModel.current.rotation.x += 0.01;
        currentModel.current.rotation.y += 0.01;
      }
      
      // Actualizar controles y renderizar
      controls.current.update();
      renderer.current.render(scene.current, camera.current);
    };
    
    // Iniciar animación
    animate();
    
    // Manejar redimensionamiento de ventana
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.current.aspect = width / height;
      camera.current.updateProjectionMatrix();
      
      renderer.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Indicar que la escena está lista
    setReady(true);
    console.log('✅ Escena Three.js inicializada correctamente');
    
    // Limpieza al desmontar
    return () => {
      console.log('Limpiando recursos Three.js');
      
      // Detener animación
      if (animationFrameId.current) {
        window.cancelAnimationFrame(animationFrameId.current);
      }
      
      // Remover event listeners
      window.removeEventListener('resize', handleResize);
      
      // Limpiar DOM
      if (containerRef.current && renderer.current && renderer.current.domElement) {
        containerRef.current.removeChild(renderer.current.domElement);
      }
      
      // Limpiar escena
      if (scene.current) {
        scene.current.clear();
      }
      
      // Limpiar controles
      if (controls.current) {
        controls.current.dispose();
      }
      
      // Limpiar renderer
      if (renderer.current) {
        renderer.current.dispose();
      }
      
      console.log('✅ Recursos Three.js liberados');
    };
  }, []);

  // Efecto para actualizar visibilidad del grid
  useEffect(() => {
    if (grid.current) {
      grid.current.visible = showGrid;
    }
  }, [showGrid]);

  // Efecto para actualizar visibilidad de los ejes
  useEffect(() => {
    if (axes.current) {
      axes.current.visible = showAxes;
    }
  }, [showAxes]);

  // Efecto para actualizar wireframe
  useEffect(() => {
    if (currentModel.current) {
      currentModel.current.traverse((object) => {
        if (object.isMesh && object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => {
              mat.wireframe = wireframe;
            });
          } else {
            object.material.wireframe = wireframe;
          }
        }
      });
    }
  }, [wireframe]);
  
  // Handler para cuando se carga un nuevo modelo
  const handleModelLoad = (newModel) => {
    if (!scene.current || !newModel) {
      console.error('No se puede añadir el modelo: escena no disponible o modelo inválido');
      return;
    }
    
    try {
      console.log('Recibido nuevo modelo para mostrar');
      
      // Remover modelo anterior
      if (currentModel.current) {
        scene.current.remove(currentModel.current);
      }
      
      // Solo para la primera carga, resetear la cámara
      if (isFirstLoad.current) {
        camera.current.position.set(0, 0, 5);
        controls.current.target.set(0, 0, 0);
        isFirstLoad.current = false;
      }
      
      // Guardar la posición actual de la cámara y el target de los controles
      const currentCameraPosition = camera.current.position.clone();
      const currentControlsTarget = controls.current.target.clone();
      
      // Calcular bounding box
      const box = new THREE.Box3().setFromObject(newModel);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      // Ajustar escala y posición
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const scale = 2 / maxDim;
        newModel.scale.set(scale, scale, scale);
        newModel.position.x = -center.x * scale;
        newModel.position.y = -center.y * scale;
        newModel.position.z = -center.z * scale;
      }

      // Aplicar wireframe si está activado
      if (wireframe) {
        newModel.traverse((object) => {
          if (object.isMesh && object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(mat => {
                mat.wireframe = true;
              });
            } else {
              object.material.wireframe = true;
            }
          }
        });
      }
      
      // Añadir nuevo modelo a la escena
      scene.current.add(newModel);
      currentModel.current = newModel;
      
      // Restaurar la posición de la cámara y el target de los controles
      // Solo si no es la primera carga (que ya se hizo arriba)
      if (!isFirstLoad.current) {
        camera.current.position.copy(currentCameraPosition);
        controls.current.target.copy(currentControlsTarget);
      }
      
      // Actualizar controles
      controls.current.update();
      
      console.log('✅ Modelo añadido a la escena correctamente');
      setError(null);
    } catch (err) {
      console.error('Error al procesar el modelo:', err);
      setError(`Error al procesar el modelo: ${err.message}`);
    }
  };
  
  // Handler para actualizar información del modelo
  const handleModelInfoUpdate = (info) => {
    setModelInfo(info);
    
    if (info && info.error) {
      setError(info.error);
    }
  };

  // Función para resetear la cámara a la posición inicial
  const resetCamera = () => {
    if (camera.current && controls.current) {
      camera.current.position.set(0, 0, 5);
      controls.current.target.set(0, 0, 0);
      controls.current.update();
    }
  };

  return (
    <div className="model-viewer-container">
      {/* Contenedor para Three.js - SIEMPRE VISIBLE */}
      <div ref={containerRef} className="scene-container"></div>
      
      {/* Panel de controles */}
      <div className="controls-panel">
        {ready ? (
          <>
            <ModelSelect
              onModelLoad={handleModelLoad}
              onModelInfoUpdate={handleModelInfoUpdate}
              viewerReady={ready}
            />
            <ModelInfo modelData={modelInfo} />

            {/* Panel de opciones de visualización */}
            <div className="view-options">
              <h3>Opciones de visualización</h3>
              <div className="options-grid">
                <label>
                  <input 
                    type="checkbox" 
                    checked={showGrid} 
                    onChange={() => setShowGrid(!showGrid)} 
                  />
                  Mostrar cuadrícula
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={showAxes} 
                    onChange={() => setShowAxes(!showAxes)} 
                  />
                  Mostrar ejes
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={wireframe} 
                    onChange={() => setWireframe(!wireframe)} 
                  />
                  Modo alambre
                </label>
              </div>
              <button onClick={resetCamera} className="reset-camera-btn">
                Reiniciar cámara
              </button>
            </div>
          </>
        ) : (
          <div className="loading-viewer">Inicializando visor 3D...</div>
        )}
      </div>
      
      {/* Overlay de error */}
      {error && (
        <div className="scene-error-overlay">
          <div className="scene-error-message">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelViewer;