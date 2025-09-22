const fs = require('fs');
const path = require('path');

// Lista de módulos a actualizar
const modules = [
  'ProveedoresPage.jsx',
  'VentasPage.jsx',
  'ComprasPage.jsx',
  'BancosPage.jsx',
  'LotesPage.jsx',
  'PaquetesPage.jsx',
  'RecetasPage.jsx',
  'InventarioPage.jsx',
  'ReporteriaPage.jsx',
  'ConfiguracionPage.jsx',
  'AdminPage.jsx'
];

// Configuraciones de importación para cada módulo
const importConfigs = {
  'ProveedoresPage.jsx': {
    title: "Importar Proveedores",
    description: "Importa proveedores desde un archivo CSV o Excel",
    sampleData: [
      {
        name: "Proveedor ABC",
        email: "contacto@proveedorabc.com",
        phone: "555-0123",
        address: "Calle Industrial 123",
        status: "activo"
      }
    ],
    columns: [
      { key: 'name', header: 'Nombre' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Teléfono' },
      { key: 'address', header: 'Dirección' },
      { key: 'status', header: 'Estado' }
    ]
  },
  'VentasPage.jsx': {
    title: "Importar Ventas",
    description: "Importa ventas desde un archivo CSV o Excel",
    sampleData: [
      {
        clientName: "Cliente ABC",
        productName: "Producto XYZ",
        quantity: "10",
        price: "25.50",
        total: "255.00",
        date: "2024-01-15"
      }
    ],
    columns: [
      { key: 'clientName', header: 'Cliente' },
      { key: 'productName', header: 'Producto' },
      { key: 'quantity', header: 'Cantidad' },
      { key: 'price', header: 'Precio' },
      { key: 'total', header: 'Total' },
      { key: 'date', header: 'Fecha' }
    ]
  },
  'ComprasPage.jsx': {
    title: "Importar Compras",
    description: "Importa compras desde un archivo CSV o Excel",
    sampleData: [
      {
        supplierName: "Proveedor XYZ",
        productName: "Materia Prima",
        quantity: "100",
        price: "15.75",
        total: "1575.00",
        date: "2024-01-15"
      }
    ],
    columns: [
      { key: 'supplierName', header: 'Proveedor' },
      { key: 'productName', header: 'Producto' },
      { key: 'quantity', header: 'Cantidad' },
      { key: 'price', header: 'Precio' },
      { key: 'total', header: 'Total' },
      { key: 'date', header: 'Fecha' }
    ]
  },
  'BancosPage.jsx': {
    title: "Importar Transacciones Bancarias",
    description: "Importa transacciones bancarias desde un archivo CSV o Excel",
    sampleData: [
      {
        bankName: "Banco Nacional",
        accountNumber: "1234567890",
        transactionType: "deposito",
        amount: "1000.00",
        description: "Depósito inicial",
        date: "2024-01-15"
      }
    ],
    columns: [
      { key: 'bankName', header: 'Banco' },
      { key: 'accountNumber', header: 'Número de Cuenta' },
      { key: 'transactionType', header: 'Tipo' },
      { key: 'amount', header: 'Monto' },
      { key: 'description', header: 'Descripción' },
      { key: 'date', header: 'Fecha' }
    ]
  }
};

// Función para actualizar un archivo
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Verificar si ya tiene importación
    if (content.includes('useImport') || content.includes('ImportModal')) {
      console.log(`✅ ${fileName} ya tiene importación configurada`);
      return;
    }

    // Agregar imports
    if (!content.includes('Upload')) {
      // Buscar la línea de imports de lucide-react
      const lucideImportMatch = content.match(/import {[^}]+} from 'lucide-react';/);
      if (lucideImportMatch) {
        const newLucideImport = lucideImportMatch[0].replace('}', ', Upload}');
        content = content.replace(lucideImportMatch[0], newLucideImport);
      }
    }

    // Agregar imports de hooks y componentes
    const newImports = `import { useImport } from '@/hooks/useImport';
import { ImportModal } from '@/components/ImportModal';`;

    // Buscar la última línea de import
    const lastImportMatch = content.match(/import[^;]+;$/m);
    if (lastImportMatch) {
      const lastImportIndex = content.lastIndexOf(lastImportMatch[0]) + lastImportMatch[0].length;
      content = content.slice(0, lastImportIndex) + '\n' + newImports + content.slice(lastImportIndex);
    }

    // Agregar hook de importación después de otros hooks
    const hookPattern = /const \{[^}]+\} = use[A-Z][a-zA-Z]+\(\);[\s\S]*?const \[/;
    const hookMatch = content.match(hookPattern);
    if (hookMatch) {
      const hookEndIndex = content.indexOf('const [', hookMatch.index + hookMatch[0].length);
      const hookInsertion = `\n  // Hook para importación\n  const {\n    loading: importLoading,\n    importModalOpen,\n    openImportModal,\n    closeImportModal,\n    importData\n  } = useImport('${getModuleName(fileName)}');\n\n  // Configuración para importación\n  const importConfig = ${JSON.stringify(importConfigs[fileName] || getDefaultConfig(fileName), null, 4)};\n\n  `;
      content = content.slice(0, hookEndIndex) + hookInsertion + content.slice(hookEndIndex);
    }

    // Agregar botón de importar
    const buttonPattern = /<Button[^>]*onClick=\{.*setShowForm.*\}[^>]*>[\s\S]*?<\/Button>/;
    const buttonMatch = content.match(buttonPattern);
    if (buttonMatch) {
      const buttonReplacement = `<div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={openImportModal}
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Importar</span>
            <span className="sm:hidden">Importar</span>
          </Button>
          ${buttonMatch[0]}
        </div>`;
      content = content.replace(buttonMatch[0], buttonReplacement);
    }

    // Agregar modal al final
    const modalPattern = /<\/div>\s*\);\s*}\s*$/;
    const modalMatch = content.match(modalPattern);
    if (modalMatch) {
      const modalInsertion = `\n      {/* Modal de Importación */}\n      <ImportModal\n        isOpen={importModalOpen}\n        onClose={closeImportModal}\n        onImport={importData}\n        title={importConfig.title}\n        description={importConfig.description}\n        sampleData={importConfig.sampleData}\n        columns={importConfig.columns}\n        loading={importLoading}\n      />\n    `;
      content = content.replace(modalPattern, modalInsertion + '\n  );\n}');
    }

    fs.writeFileSync(filePath, content);
    console.log(`✅ ${fileName} actualizado exitosamente`);
  } catch (error) {
    console.error(`❌ Error actualizando ${filePath}:`, error.message);
  }
}

// Función para obtener el nombre del módulo
function getModuleName(fileName) {
  return fileName.replace('Page.jsx', '').toLowerCase();
}

// Función para obtener configuración por defecto
function getDefaultConfig(fileName) {
  const moduleName = getModuleName(fileName);
  return {
    title: `Importar ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}`,
    description: `Importa ${moduleName} desde un archivo CSV o Excel`,
    sampleData: [
      {
        name: `Ejemplo ${moduleName}`,
        description: `Descripción de ejemplo`
      }
    ],
    columns: [
      { key: 'name', header: 'Nombre' },
      { key: 'description', header: 'Descripción' }
    ]
  };
}

// Ejecutar actualizaciones
console.log('🚀 Iniciando actualización de módulos...\n');

modules.forEach(module => {
  const filePath = path.join(__dirname, 'src', 'pages', module);
  if (fs.existsSync(filePath)) {
    updateFile(filePath);
  } else {
    console.log(`⚠️  Archivo no encontrado: ${module}`);
  }
});

console.log('\n✨ Actualización completada!');

