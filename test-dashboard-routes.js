// Script de prueba para verificar las rutas del dashboard
import mongoose from 'mongoose';
import Product from './backend/models/Product.js';
import Client from './backend/models/Client.js';
import Supplier from './backend/models/Supplier.js';
import Sale from './backend/models/Sale.js';
import Purchase from './backend/models/Purchase.js';
import Batch from './backend/models/Batch.js';

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/innovadomprod', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testDashboardRoutes() {
  try {
    console.log('=== PRUEBA DE RUTAS DEL DASHBOARD ===');
    
    // Verificar que existan datos en las colecciones
    const productsCount = await Product.countDocuments();
    const clientsCount = await Client.countDocuments();
    const suppliersCount = await Supplier.countDocuments();
    const salesCount = await Sale.countDocuments();
    const purchasesCount = await Purchase.countDocuments();
    const batchesCount = await Batch.countDocuments();
    
    console.log('\nConteo de documentos:');
    console.log(`- Productos: ${productsCount}`);
    console.log(`- Clientes: ${clientsCount}`);
    console.log(`- Proveedores: ${suppliersCount}`);
    console.log(`- Ventas: ${salesCount}`);
    console.log(`- Compras: ${purchasesCount}`);
    console.log(`- Lotes: ${batchesCount}`);
    
    // Verificar categorías de productos
    const products = await Product.find({}).limit(5);
    console.log('\nCategorías de productos disponibles:');
    const categories = [...new Set(products.map(p => p.category))];
    console.log(categories);
    
    // Verificar ventas del mes actual
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const monthlySales = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\nVentas del mes actual:');
    console.log(`- Total: ${monthlySales[0]?.total || 0}`);
    console.log(`- Cantidad: ${monthlySales[0]?.count || 0}`);
    
    // Verificar datos mensuales del año actual
    const currentYear = currentDate.getFullYear();
    const monthlyData = await Sale.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          month: { $first: { $month: '$createdAt' } },
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { month: 1 }
      }
    ]);
    
    console.log('\nDatos mensuales del año actual:');
    monthlyData.forEach(item => {
      console.log(`- Mes ${item.month}: ${item.total} (${item.count} ventas)`);
    });
    
    // Verificar top productos
    const topProducts = await Sale.aggregate([
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.productName' },
          quantity: { $sum: '$items.quantity' },
          total: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      {
        $sort: { quantity: -1 }
      },
      {
        $limit: 3
      }
    ]);
    
    console.log('\nTop 3 productos vendidos:');
    topProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}: ${product.quantity} unidades`);
    });
    
  } catch (error) {
    console.error('Error durante la prueba:', error);
  } finally {
    mongoose.disconnect();
  }
}

testDashboardRoutes();
