// Script de prueba para verificar las estadísticas del dashboard
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

async function testDashboardStats() {
  try {
    console.log('=== PRUEBA DE ESTADÍSTICAS DEL DASHBOARD ===');
    
    // Contar productos por categoría
    const productsStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('Estadísticas de productos por categoría:');
    productsStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });
    
    // Contar productos totales
    const totalProducts = await Product.countDocuments();
    console.log(`Total de productos: ${totalProducts}`);
    
    // Contar clientes
    const totalClients = await Client.countDocuments();
    const activeClients = await Client.countDocuments({ isActive: true });
    console.log(`Total de clientes: ${totalClients}, Activos: ${activeClients}`);
    
    // Contar proveedores
    const totalSuppliers = await Supplier.countDocuments();
    const activeSuppliers = await Supplier.countDocuments({ isActive: true });
    console.log(`Total de proveedores: ${totalSuppliers}, Activos: ${activeSuppliers}`);
    
    // Estadísticas de ventas del mes actual
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
    
    const monthlySalesData = monthlySales[0] || { total: 0, count: 0 };
    console.log(`Ventas del mes: ${monthlySalesData.count} ventas, Total: $${monthlySalesData.total}`);
    
    // Estadísticas de compras del mes
    const monthlyPurchases = await Purchase.aggregate([
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
    
    const monthlyPurchasesData = monthlyPurchases[0] || { total: 0, count: 0 };
    console.log(`Compras del mes: ${monthlyPurchasesData.count} compras, Total: $${monthlyPurchasesData.total}`);
    
    // Estadísticas de lotes
    const totalBatches = await Batch.countDocuments({ isActive: true });
    const expiringSoon = await Batch.countDocuments({
      isActive: true,
      expirationDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    });
    
    console.log(`Total de lotes activos: ${totalBatches}`);
    console.log(`Lotes que vencen en 30 días: ${expiringSoon}`);
    
    // Calcular ganancia
    const profit = monthlySalesData.total - monthlyPurchasesData.total;
    console.log(`Ganancia del mes: $${Math.max(0, profit)}`);
    
    console.log('\n=== PRUEBA COMPLETADA ===');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar la prueba
testDashboardStats();

