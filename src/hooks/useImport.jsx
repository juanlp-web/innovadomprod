import { useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { api } from '@/config/api';

export function useImport(moduleName) {
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const importData = async (formData) => {
    setLoading(true);
    try {
      const response = await api.post(`/import/${moduleName}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showSuccess(`${response.data.count} registros importados correctamente`);
      return response.data;
    } catch (error) {
      console.error('Error en importación:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al importar los datos';
      showError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const openImportModal = () => setImportModalOpen(true);
  const closeImportModal = () => setImportModalOpen(false);

  return {
    loading,
    importModalOpen,
    openImportModal,
    closeImportModal,
    importData
  };
}
