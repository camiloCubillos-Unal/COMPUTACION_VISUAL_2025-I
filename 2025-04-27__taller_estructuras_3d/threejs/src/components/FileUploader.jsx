import { useState, useRef } from 'react'

const FileUploader = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const inputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (file) => {
    // Verificar si el archivo es de formato compatible
    const validFormats = ['.obj', '.stl', '.gltf', '.glb']
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    
    if (validFormats.includes(fileExtension)) {
      setSelectedFile(file)
      onFileUpload(file)
    } else {
      alert('Formato de archivo no soportado. Por favor, sube un archivo .OBJ, .STL, .GLTF o .GLB')
    }
  }

  const onButtonClick = () => {
    inputRef.current.click()
  }

  return (
    <div className="file-uploader">
      <h3>Cargar Modelo 3D</h3>
      <div 
        className={`drop-zone ${dragActive ? 'active' : ''} ${selectedFile ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept=".obj,.stl,.gltf,.glb"
          onChange={handleChange}
          className="file-input"
        />
        
        {selectedFile ? (
          <div className="file-info">
            <span className="file-name">{selectedFile.name}</span>
            <button 
              className="change-file-btn" 
              onClick={onButtonClick}
            >
              Cambiar archivo
            </button>
          </div>
        ) : (
          <div className="upload-prompt">
            <p>Arrastra y suelta un archivo 3D aquí o</p>
            <button 
              className="browse-btn" 
              onClick={onButtonClick}
            >
              Seleccionar archivo
            </button>
            <p className="file-formats">Formatos soportados: .OBJ, .STL, .GLTF, .GLB</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUploader 