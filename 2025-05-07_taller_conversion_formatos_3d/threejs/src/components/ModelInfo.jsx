import React from 'react';
import './ModelInfo.css';

const ModelInfo = ({ modelData }) => {
  if (!modelData) {
    return <div className="model-info model-info-empty">Selecciona un modelo para ver su información</div>;
  }

  const {
    format,
    fileName,
    fileSize,
    vertices,
    edges,
    faces,
    boundingBox,
    triangles,
    materialCount,
    volume,
    surfaceArea
  } = modelData;

  return (
    <div className="model-info">
      <h3>Información del Modelo</h3>
      <table>
        <tbody>
          <tr>
            <th>Formato</th>
            <td>{format}</td>
          </tr>
          <tr>
            <th>Nombre del archivo</th>
            <td>{fileName}</td>
          </tr>
          <tr>
            <th>Tamaño del archivo</th>
            <td>{fileSize}</td>
          </tr>
          <tr>
            <th>Número de vértices</th>
            <td>{vertices}</td>
          </tr>
          <tr>
            <th>Número de aristas</th>
            <td>{edges}</td>
          </tr>
          <tr>
            <th>Número de caras</th>
            <td>{faces}</td>
          </tr>
          {triangles !== undefined && (
            <tr>
              <th>Número de triángulos</th>
              <td>{triangles}</td>
            </tr>
          )}
          {materialCount !== undefined && (
            <tr>
              <th>Número de materiales</th>
              <td>{materialCount}</td>
            </tr>
          )}
          {boundingBox && (
            <tr>
              <th>Dimensiones (ancho×alto×prof)</th>
              <td>
                {boundingBox.x.toFixed(2)} × {boundingBox.y.toFixed(2)} × {boundingBox.z.toFixed(2)}
              </td>
            </tr>
          )}
          {volume !== undefined && (
            <tr>
              <th>Volumen aproximado</th>
              <td>{volume.toFixed(2)} unidades³</td>
            </tr>
          )}
          {surfaceArea !== undefined && (
            <tr>
              <th>Área de superficie</th>
              <td>{surfaceArea.toFixed(2)} unidades²</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ModelInfo;