const ModelInfo = ({ info }) => {
  if (!info) return null

  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes) => {
    const KB = 1024;
    const MB = KB * 1024;
    
    if (bytes <= 10 * KB) {
      // Si el archivo es menor o igual a 10KB, mostrar en KB con 2 decimales
      return `${(bytes / KB).toFixed(2)} KB`;
    } else {
      // Para cualquier tamaño mayor a 10KB, mostrar en MB con 2 decimales
      return `${(bytes / MB).toFixed(2)} MB`;
    }
  }

  return (
    <div className="model-info">
      <h3>Información del Modelo</h3>
      <ul>
        {info.vertices && (
          <li>
            <strong>Vértices:</strong> {info.vertices.toLocaleString()}
          </li>
        )}
        {info.faces && (
          <li>
            <strong>Caras:</strong> {info.faces.toLocaleString()}
          </li>
        )}
        {info.edges && (
          <li>
            <strong>Aristas:</strong> {info.edges.toLocaleString()}
          </li>
        )}
        {info.triangles && (
          <li>
            <strong>Triángulos:</strong> {info.triangles.toLocaleString()}
          </li>
        )}
        {info.format && (
          <li>
            <strong>Formato:</strong> {info.format}
          </li>
        )}
        {info.fileName && (
          <li>
            <strong>Nombre:</strong> {info.fileName}
          </li>
        )}
        {info.fileSize && (
          <li>
            <strong>Tamaño:</strong> {formatFileSize(info.fileSize)}
          </li>
        )}
      </ul>
    </div>
  )
}

export default ModelInfo 