# 🧪 Taller: Cámara en Vivo - Captura y Procesamiento en Tiempo Real con YOLO y OpenCV

## 🔍 Descripción del Proyecto

Este proyecto implementa una aplicación en Python que captura video en tiempo real desde la webcam, procesa cada cuadro con filtros visuales clásicos de visión por computador, e integra un modelo YOLO preentrenado para detección de objetos en vivo. El sistema es completamente interactivo, visualmente claro y diseñado de forma modular siguiendo principios SOLID.

## 🧰 Tecnologías Utilizadas

- **Python 3.8+**: Lenguaje de programación principal
- **OpenCV**: Procesamiento de video e imagen en tiempo real
- **NumPy**: Computación numérica eficiente
- **Ultralytics YOLOv8**: Detección de objetos en tiempo real
- **PyTorch**: Framework de deep learning para YOLO

## 📦 Estructura del Proyecto

```
2025-06-25_taller_camara_en_vivo_yolo_opencv/
├── python/
│   └── main.py              # Código principal de la aplicación
├── requirements.txt         # Dependencias del proyecto
└── README.md               # Documentación del proyecto
```

## 🚀 Instalación y Configuración

### 1. Clonar o descargar el proyecto

```bash
git clone <repository-url>
cd 2025-06-25_taller_camara_en_vivo_yolo_opencv
```

### 2. Crear entorno virtual (recomendado)

```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Ejecutar la aplicación

```bash
cd python
python main.py
```

## 🎮 Controles de la Aplicación

| Tecla | Función |
|-------|---------|
| **1** | Activar filtro de escala de grises |
| **2** | Activar filtro de binarización |
| **3** | Activar filtro de detección de bordes (Canny) |
| **D** | Activar/desactivar detección YOLO |
| **Espacio** | Pausar/reanudar procesamiento |
| **S** | Capturar imagen actual |
| **Q** | Salir de la aplicación |

## 🖥️ Ventanas de Visualización

La aplicación muestra tres ventanas simultáneas:

1. **Original + Info**: Video original con panel de información y controles
2. **Filtro**: Vista del filtro seleccionado aplicado al video
3. **Detección YOLO**: Video con detección de objetos y bounding boxes

## 📋 Funcionalidades Implementadas

### ✅ Captura de Video en Tiempo Real
- Acceso a webcam usando `cv2.VideoCapture(0)`
- Procesamiento frame por frame en bucle continuo
- Resolución optimizada (640x480) para mejor rendimiento

### ✅ Filtros Visuales Clásicos
- **Escala de Grises**: Conversión a imagen monocromática
- **Binarización**: Threshold adaptativo para imagen binaria
- **Detección de Bordes**: Algoritmo Canny para contornos

### ✅ Detección de Objetos con YOLO
- Integración de YOLOv8 nano (yolov8n.pt) para máxima velocidad
- Visualización de bounding boxes con etiquetas de clase
- Umbral de confianza configurable (0.5 por defecto)
- Toggle on/off en tiempo real

### ✅ Interacción Avanzada
- Cambio dinámico de filtros sin interrumpir el video
- Pausa/reanudación del procesamiento
- Captura de imágenes con timestamp
- Panel de información overlay con estado actual

## 🏗️ Arquitectura del Código

El proyecto implementa **principios SOLID** con una arquitectura modular:

### Patrón Strategy para Filtros
```python
class FilterStrategy(ABC):
    @abstractmethod
    def apply(self, frame: np.ndarray) -> np.ndarray: pass
    
    @abstractmethod
    def get_name(self) -> str: pass
```

### Clases Principales

- **`FilterStrategy`**: Interfaz abstracta para filtros
- **`GrayscaleFilter`**: Implementación de escala de grises
- **`BinaryFilter`**: Implementación de binarización
- **`EdgeDetectionFilter`**: Implementación de detección de bordes
- **`YOLODetector`**: Manejador de detección de objetos
- **`VideoProcessor`**: Orquestador principal del sistema

## 🔧 Configuración Avanzada

### Modificar Parámetros de Filtros

```python
# Cambiar umbral de binarización
BinaryFilter(threshold=100)

# Ajustar sensibilidad de detección de bordes
EdgeDetectionFilter(lower_threshold=30, upper_threshold=100)
```

### Cambiar Modelo YOLO

```python
# Usar modelo más preciso (pero más lento)
detector = YOLODetector("yolov8s.pt")  # Small
detector = YOLODetector("yolov8m.pt")  # Medium
detector = YOLODetector("yolov8l.pt")  # Large
```

## 🐛 Resolución de Problemas

### Error: No se pudo abrir la cámara
- Verificar que no hay otras aplicaciones usando la webcam
- Probar con índice de cámara diferente: `VideoCapture(1)`
- Verificar permisos de cámara en el sistema operativo

### Error: Modelo YOLO no encontrado
- Asegurar conexión a internet para descarga automática
- El modelo se descarga automáticamente en la primera ejecución
- Verificar espacio en disco disponible

### Rendimiento lento
- Usar modelo YOLO más pequeño (yolov8n.pt)
- Reducir resolución de cámara
- Cerrar otras aplicaciones que consuman GPU/CPU

## 📊 Métricas de Rendimiento

- **FPS esperado**: 15-30 FPS (dependiendo del hardware)
- **Latencia**: < 100ms para detección YOLO
- **Memoria RAM**: ~500MB con modelo nano
- **GPU**: Opcional pero recomendada para mejor rendimiento

## 🎯 Casos de Uso Educativos

### Para Estudiantes
- Aprender conceptos fundamentales de visión por computador
- Experimentar con diferentes filtros en tiempo real
- Entender el funcionamiento de redes neuronales de detección
- Practicar programación orientada a objetos con Python

### Para Profesores
- Demostrar conceptos teóricos de forma práctica
- Comparar diferentes técnicas de procesamiento de imagen
- Mostrar aplicaciones reales de inteligencia artificial
- Base para proyectos más avanzados

## 🔮 Extensiones Futuras

- [ ] Agregar más filtros (blur, sharpen, histogram equalization)
- [ ] Implementar tracking de objetos detectados
- [ ] Grabación de video con filtros aplicados
- [ ] Interfaz gráfica con tkinter o PyQt
- [ ] Soporte para múltiples cámaras simultáneas
- [ ] Análisis de métricas de rendimiento en tiempo real

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Fork del repositorio
2. Crear rama para nueva funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado como material educativo para el taller de Visión por Computador y Deep Learning.

---

**¡Disfruta experimentando con visión por computador en tiempo real! 🚀** 
