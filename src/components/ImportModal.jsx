import { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  X,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export function ImportModal({ 
  isOpen, 
  onClose, 
  onImport, 
  title = "Importar Registros",
  description = "Selecciona un archivo CSV o Excel para importar los registros",
  sampleData = [],
  columns = [],
  loading = false
}) {
  const { success: showSuccess, error: showError } = useToast();
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importOptions, setImportOptions] = useState({
    skipFirstRow: true,
    updateExisting: false,
    validateData: true
  });
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          showError('El archivo está vacío');
          return;
        }

        // Procesar datos por número de columna en lugar de headers
        const data = lines.slice(importOptions.skipFirstRow ? 1 : 0).map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row = {};
          // Usar números de columna como claves (0, 1, 2, etc.)
          values.forEach((value, i) => {
            row[i] = value || '';
          });
          return { ...row, _rowIndex: index + (importOptions.skipFirstRow ? 2 : 1) };
        });

        setPreviewData(data.slice(0, 10)); // Mostrar solo las primeras 10 filas
        setShowPreview(true);
      } catch (error) {
        showError('Error al procesar el archivo: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file) {
      showError('Por favor selecciona un archivo');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(importOptions));

      await onImport(formData);
      showSuccess('Registros importados correctamente');
      handleClose();
    } catch (error) {
      showError('Error al importar: ' + error.message);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setShowPreview(false);
    setImportOptions({
      skipFirstRow: true,
      updateExisting: false,
      validateData: true
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const downloadSample = () => {
    if (sampleData.length === 0) return;
    
    const csvContent = [
      columns.map(col => col.header).join(','),
      ...sampleData.map(row => 
        columns.map(col => `"${row[col.key] || ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'ejemplo_importacion.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Upload className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Selección de archivo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar archivo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center space-y-2 text-gray-600 hover:text-blue-600"
              >
                <Upload className="w-12 h-12" />
                <span className="text-lg font-medium">Haz clic para seleccionar archivo</span>
                <span className="text-sm">CSV, XLSX o XLS</span>
              </button>
              {file && (
                <div className="mt-4 flex items-center justify-center space-x-2 text-green-600">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">{file.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Opciones de importación */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Opciones de importación</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={importOptions.skipFirstRow}
                  onChange={(e) => setImportOptions({
                    ...importOptions,
                    skipFirstRow: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Saltar primera fila (encabezados)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={importOptions.updateExisting}
                  onChange={(e) => setImportOptions({
                    ...importOptions,
                    updateExisting: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Actualizar registros existentes
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={importOptions.validateData}
                  onChange={(e) => setImportOptions({
                    ...importOptions,
                    validateData: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Validar datos antes de importar
                </span>
              </label>
            </div>
          </div>

          {/* Vista previa de datos */}
          {showPreview && previewData.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Vista previa de datos ({previewData.length} filas mostradas)
                </h4>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(previewData[0] || {})
                          .filter(key => key !== '_rowIndex')
                          .map((key, index) => (
                          <th
                            key={index}
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Columna {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          {Object.entries(row)
                            .filter(([key]) => key !== '_rowIndex')
                            .map(([key, value], colIndex) => (
                            <td
                              key={colIndex}
                              className="px-3 py-2 whitespace-nowrap text-sm text-gray-900"
                            >
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Botón de descarga de ejemplo */}
          {sampleData.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-800">
                    ¿Necesitas un ejemplo?
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Descarga un archivo de ejemplo con el formato correcto
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadSample}
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar ejemplo
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

