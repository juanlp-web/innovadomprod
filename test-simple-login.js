// Script de prueba simple para verificar el login con email
import mongoose from 'mongoose';
import User from './backend/models/User.js';

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/innovadomprod', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testSimpleLogin() {
  try {
    console.log('=== PRUEBA SIMPLE DE LOGIN CON EMAIL ===');
    
    // Verificar que existan usuarios
    const usersCount = await User.countDocuments();
    console.log(`\nUsuarios en la base de datos: ${usersCount}`);
    
    if (usersCount === 0) {
      console.log('Creando usuario de prueba...');
      
      const testUser = new User({
        username: 'admin',
        email: 'admin@innovadom.com',
        password: 'admin123',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'Test'
      });
      
      await testUser.save();
      console.log('✅ Usuario creado: admin@innovadom.com / admin123');
    }
    
    // Obtener usuario para probar
    const user = await User.findOne({ email: 'admin@innovadom.com' });
    if (user) {
      console.log(`\nProbando login para: ${user.email}`);
      console.log(`   - Username: ${user.username}`);
      console.log(`   - Role: ${user.role}`);
      
      // Probar contraseña correcta
      const isMatch = await user.comparePassword('admin123');
      console.log(`   - Contraseña correcta: ${isMatch}`);
      
      // Probar contraseña incorrecta
      const isWrongMatch = await user.comparePassword('wrongpass');
      console.log(`   - Contraseña incorrecta: ${isWrongMatch}`);
      
      if (isMatch && !isWrongMatch) {
        console.log('✅ Login funciona correctamente');
      } else {
        console.log('❌ Error en el login');
      }
    }
    
    console.log('\n✅ Prueba completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

testSimpleLogin();
