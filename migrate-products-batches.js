// Script de migración para agregar el campo managesBatches a productos existentes
import mongoose from 'mongoose';
import Product from './backend/models/Product.js';

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/innovadomprod', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function migrateProducts() {
  try {
    console.log('=== MIGRACIÓN DE PRODUCTOS PARA LOTES ===');
    
    // Buscar todos los productos
    const products = await Product.find({});
    console.log(`Productos encontrados: ${products.length}`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      // Por defecto, solo los productos terminados manejan lotes
      // Puedes ajustar esta lógica según tus necesidades
      const shouldManageBatches = product.category === 'producto_terminado';
      
      if (product.managesBatches === undefined) {
        product.managesBatches = shouldManageBatches;
        await product.save();
        updatedCount++;
        console.log(`✅ Producto "${product.name}" actualizado: managesBatches = ${shouldManageBatches}`);
      } else {
        console.log(`ℹ️  Producto "${product.name}" ya tiene managesBatches = ${product.managesBatches}`);
      }
    }
    
    console.log(`\n=== RESUMEN ===`);
    console.log(`Total de productos: ${products.length}`);
    console.log(`Productos actualizados: ${updatedCount}`);
    console.log(`Productos que ya tenían el campo: ${products.length - updatedCount}`);
    
    // Mostrar estadísticas por categoría
    const stats = await Product.aggregate([
      {
        $group: {
          _id: '$managesBatches',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log(`\n=== ESTADÍSTICAS POR MANEJO DE LOTES ===`);
    stats.forEach(stat => {
      const label = stat._id ? 'Maneja lotes' : 'Sin lotes';
      console.log(`${label}: ${stat.count} productos`);
    });
    
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar la migración
migrateProducts();

