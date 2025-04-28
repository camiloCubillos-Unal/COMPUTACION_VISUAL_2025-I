# 🧪 Taller Estructuras 3D

## 📅 Fecha
`2025-04-27`

---

## 🎯 Objetivo del Taller

Crear un visualizador 3D interactivo utilizando Three.js que permita cargar modelos en diferentes formatos (OBJ, STL, GLTF), visualizarlos con diferentes modos de representación (normal, wireframe, vértices, caras) y mostrar información técnica sobre el modelo.

---

## 🧠 Conceptos Aprendidos

Lista los principales conceptos aplicados:

- [x] Transformaciones geométricas (escala, rotación, traslación)
- [ ] Segmentación de imágenes
- [x] Shaders y efectos visuales
- [ ] Entrenamiento de modelos IA
- [ ] Comunicación por gestos o voz
- [x] Otro: Manipulación de geometrías 3D, representación de estructuras geométricas

---

## 🔧 Herramientas y Entornos

Especifica los entornos usados:

- Three.js / React Three Fiber
  - React v19.0.0
  - Three.js
  - @react-three/fiber
  - @react-three/drei

---
## 🧪 Implementación

Explica el proceso:

### 🔹 Etapas realizadas
1. Configuración del entorno React con Three.js y React Three Fiber.
2. Implementación del componente de carga de archivos 3D (soporte para OBJ, STL, GLTF, GLB).
3. Desarrollo del visualizador 3D con controles orbitales y modos de visualización.
4. Creación del componente de información que muestra datos técnicos del modelo.
5. Implementación de la interfaz de usuario para interactuar con el visualizador.

### 🔹 Código relevante

Código para visualizar diferentes modos (wireframe, vértices, caras):

```jsx
// Implementación de modos de visualización
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
    // Crear visualización de vértices
    if (child.geometry) {
      const pointsGeometry = new THREE.BufferGeometry()
      pointsGeometry.setAttribute('position', 
        child.geometry.attributes.position.clone())
      
      const pointsMaterial = new THREE.PointsMaterial({
        color: 0xff0000,
        size: 0.03,
        sizeAttenuation: true
      })
      
      const points = new THREE.Points(pointsGeometry, pointsMaterial)
      // Aplicar transformaciones
      child.updateWorldMatrix(true, false)
      points.applyMatrix4(child.matrixWorld)
      // Añadir puntos a la escena
      pointsRef.current = points
      scene.add(points)
    }
    break
}
```

---

## 📊 Resultados Visuales


![visualizador_3d_modos_visualizacion](./gifs/demostracion_proyecto.gif)

> Nota: El GIF muestra la aplicación funcionando con los diferentes modos de visualización (normal, wireframe, vértices y caras).

---

## 🧩 Prompts Usados

Enumera los prompts utilizados:

```text
"Crea un código en javascript usando Node y ThreeJS que haga lo siguiente: 
- Cargar un modelo 3D en formato .OBJ, .STL o .GLTF usando @react-three/drei. (El usuario debería poder subir el archivo desde su PC usando la UI de la app)
- Visualizar el modelo con OrbitControls.
- Resaltar vértices, aristas o caras usando efectos visuales como líneas (Edges, Wireframe) o puntos (Points).
- Crear una pequeña interfaz para cambiar entre visualización de vértices/aristas/caras y mostrar información básica del modelo (número de vértices, etc."
```

---

## 💬 Reflexión Final

Este taller me permitió profundizar en el funcionamiento interno de las estructuras 3D y cómo se representan computacionalmente. Aprendí sobre los diferentes componentes que conforman un modelo 3D (vértices, aristas, caras) y cómo manipularlos a través de Three.js.

La parte más desafiante fue implementar la visualización correcta de los diferentes modos, especialmente el modo de vértices, que requirió entender cómo funcionan las matrices de transformación en Three.js para asegurar que los puntos se posicionaran correctamente en el espacio 3D. También fue complejo manejar eficientemente los recursos para evitar fugas de memoria al cargar y cambiar entre modelos.

En futuros proyectos, me gustaría expandir esta aplicación para incluir capacidades de edición de modelos y añadir más formas de análisis, como cálculo de volúmenes, detección de colisiones o simulación física. También sería interesante agregar soporte para más formatos de archivos y mejorar la interfaz de usuario para hacerla más intuitiva.



## ✅ Checklist de Entrega

- [x] Carpeta `2025-04-27__taller_estructuras_3d`
- [x] Código limpio y funcional
- [x] GIF incluido con nombre descriptivo
- [x] Visualizaciones exportadas
- [x] README completo y claro
- [x] Commits descriptivos en inglés

---
