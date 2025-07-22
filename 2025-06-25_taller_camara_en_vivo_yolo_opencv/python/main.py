import cv2
import numpy as np
from ultralytics import YOLO
from abc import ABC, abstractmethod
from typing import Dict, Tuple, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FilterStrategy(ABC):
    """Estrategia abstracta para aplicación de filtros"""
    
    @abstractmethod
    def apply(self, frame: np.ndarray) -> np.ndarray:
        pass
    
    @abstractmethod
    def get_name(self) -> str:
        pass

class GrayscaleFilter(FilterStrategy):
    """Filtro de escala de grises"""
    
    def apply(self, frame: np.ndarray) -> np.ndarray:
        return cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    def get_name(self) -> str:
        return "Escala de Grises"

class BinaryFilter(FilterStrategy):
    """Filtro de binarización"""
    
    def __init__(self, threshold: int = 127):
        self.threshold = threshold
    
    def apply(self, frame: np.ndarray) -> np.ndarray:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        _, binary = cv2.threshold(gray, self.threshold, 255, cv2.THRESH_BINARY)
        return binary
    
    def get_name(self) -> str:
        return "Binarización"

class EdgeDetectionFilter(FilterStrategy):
    """Filtro de detección de bordes usando Canny"""
    
    def __init__(self, lower_threshold: int = 50, upper_threshold: int = 150):
        self.lower_threshold = lower_threshold
        self.upper_threshold = upper_threshold
    
    def apply(self, frame: np.ndarray) -> np.ndarray:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, self.lower_threshold, self.upper_threshold)
        return edges
    
    def get_name(self) -> str:
        return "Detección de Bordes"

class YOLODetector:
    """Detector de objetos usando YOLO"""
    
    def __init__(self, model_path: str = "yolov8n.pt"):
        try:
            self.model = YOLO(model_path)
            logger.info(f"Modelo YOLO cargado: {model_path}")
        except Exception as e:
            logger.error(f"Error cargando modelo YOLO: {e}")
            self.model = None
    
    def detect(self, frame: np.ndarray, confidence_threshold: float = 0.5) -> np.ndarray:
        """Detecta objetos y dibuja bounding boxes"""
        if self.model is None:
            return frame
        
        try:
            results = self.model(frame, conf=confidence_threshold, verbose=False)
            annotated_frame = results[0].plot()
            return annotated_frame
        except Exception as e:
            logger.error(f"Error en detección YOLO: {e}")
            return frame

class VideoProcessor:
    """Procesador principal de video"""
    
    def __init__(self):
        self.capture = None
        self.filters: Dict[str, FilterStrategy] = {
            '1': GrayscaleFilter(),
            '2': BinaryFilter(),
            '3': EdgeDetectionFilter()
        }
        self.detector = YOLODetector()
        self.current_filter = '1'
        self.is_paused = False
        self.show_detection = True
    
    def initialize_camera(self, camera_index: int = 0) -> bool:
        """Inicializa la cámara"""
        self.capture = cv2.VideoCapture(camera_index)
        if not self.capture.isOpened():
            logger.error("No se pudo abrir la cámara")
            return False
        
        self.capture.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        logger.info("Cámara inicializada correctamente")
        return True
    
    def process_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Procesa un frame aplicando filtros y detección"""
        filtered_frame = self.filters[self.current_filter].apply(frame)
        
        # Convertir frame filtrado a BGR si es necesario para visualización
        if len(filtered_frame.shape) == 2:
            filtered_frame = cv2.cvtColor(filtered_frame, cv2.COLOR_GRAY2BGR)
        
        # Aplicar detección YOLO al frame original
        detected_frame = frame.copy()
        if self.show_detection:
            detected_frame = self.detector.detect(frame)
        
        return filtered_frame, detected_frame
    
    def handle_keyboard_input(self, key: int) -> bool:
        """Maneja la entrada del teclado"""
        if key == ord('q'):
            return False  # Salir
        elif key in [ord('1'), ord('2'), ord('3')]:
            self.current_filter = chr(key)
            filter_name = self.filters[self.current_filter].get_name()
            logger.info(f"Filtro cambiado a: {filter_name}")
        elif key == ord(' '):  # Espacio para pausar/reanudar
            self.is_paused = not self.is_paused
            status = "pausado" if self.is_paused else "reanudado"
            logger.info(f"Procesamiento {status}")
        elif key == ord('d'):  # Toggle detección
            self.show_detection = not self.show_detection
            status = "activada" if self.show_detection else "desactivada"
            logger.info(f"Detección {status}")
        elif key == ord('s'):  # Capturar imagen
            self.capture_image()
        
        return True
    
    def capture_image(self):
        """Captura la imagen actual"""
        ret, frame = self.capture.read()
        if ret:
            timestamp = cv2.getTickCount()
            filename = f"captura_{timestamp}.jpg"
            cv2.imwrite(filename, frame)
            logger.info(f"Imagen capturada: {filename}")
    
    def add_info_overlay(self, frame: np.ndarray) -> np.ndarray:
        """Añade información de overlay al frame"""
        height, width = frame.shape[:2]
        overlay = frame.copy()
        
        # Panel de información
        cv2.rectangle(overlay, (10, 10), (width - 10, 120), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
        
        # Texto de información
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.5
        color = (255, 255, 255)
        thickness = 1
        
        texts = [
            f"Filtro actual: {self.filters[self.current_filter].get_name()} (Teclas 1-3)",
            f"Detección YOLO: {'ON' if self.show_detection else 'OFF'} (Tecla D)",
            f"Estado: {'PAUSADO' if self.is_paused else 'EJECUTANDO'} (Espacio)",
            "Capturar: S | Salir: Q"
        ]
        
        for i, text in enumerate(texts):
            y_pos = 25 + i * 20
            cv2.putText(frame, text, (15, y_pos), font, font_scale, color, thickness)
        
        return frame
    
    def run(self):
        """Ejecuta el bucle principal de procesamiento"""
        if not self.initialize_camera():
            return
        
        logger.info("Iniciando procesamiento de video...")
        logger.info("Controles: 1-3 (filtros), D (toggle detección), Espacio (pausa), S (capturar), Q (salir)")
        
        try:
            while True:
                if not self.is_paused:
                    ret, frame = self.capture.read()
                    if not ret:
                        logger.error("No se pudo leer el frame de la cámara")
                        break
                    
                    # Procesar frame
                    filtered_frame, detected_frame = self.process_frame(frame)
                    
                    # Añadir overlay de información
                    info_frame = self.add_info_overlay(frame.copy())
                    detected_frame = self.add_info_overlay(detected_frame)
                    
                    # Mostrar ventanas
                    cv2.imshow('Original + Info', info_frame)
                    cv2.imshow(f'Filtro: {self.filters[self.current_filter].get_name()}', filtered_frame)
                    cv2.imshow('Detección YOLO', detected_frame)
                
                # Manejar entrada de teclado
                key = cv2.waitKey(1) & 0xFF
                if not self.handle_keyboard_input(key):
                    break
                    
        except KeyboardInterrupt:
            logger.info("Procesamiento interrumpido por el usuario")
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Limpieza de recursos"""
        if self.capture:
            self.capture.release()
        cv2.destroyAllWindows()
        logger.info("Recursos liberados correctamente")

def main():
    """Función principal"""
    processor = VideoProcessor()
    processor.run()

if __name__ == "__main__":
    main() 