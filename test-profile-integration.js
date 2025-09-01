// Script de prueba para verificar la integración del perfil
import mongoose from 'mongoose';
import User from './backend/models/User.js';

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/innovadomprod', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testProfileIntegration() {
  try {
    console.log('=== PRUEBA DE INTEGRACIÓN DEL PERFIL ===');
    
    // Verificar que existan usuarios en la base de datos
    const usersCount = await User.countDocuments();
    console.log(`\nUsuarios en la base de datos: ${usersCount}`);
    
    if (usersCount === 0) {
      console.log('No hay usuarios en la base de datos. Creando usuario de prueba...');
      
      // Crear usuario de prueba
      const testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'admin',
        firstName: 'Usuario',
        lastName: 'Prueba',
        phone: '+18095551234',
        address: 'Santo Domingo, República Dominicana',
        birthDate: new Date('1990-01-01'),
        emailNotifications: true,
        pushNotifications: false,
        darkMode: false,
        loginHistory: [
          {
            date: new Date(),
            ip: '192.168.1.1',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            device: 'PC Windows'
          },
          {
            date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hace 1 día
            ip: '192.168.1.2',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
            device: 'iPhone'
          }
        ]
      });
      
      await testUser.save();
      console.log('✅ Usuario de prueba creado exitosamente');
    }
    
    // Obtener usuarios existentes
    const users = await User.find({}).select('-password');
    console.log('\nUsuarios disponibles:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email}) - Rol: ${user.role}`);
      console.log(`   - Nombre: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`);
      console.log(`   - Teléfono: ${user.phone || 'N/A'}`);
      console.log(`   - Dirección: ${user.address || 'N/A'}`);
      console.log(`   - Fecha de nacimiento: ${user.birthDate || 'N/A'}`);
      console.log(`   - Notificaciones email: ${user.emailNotifications}`);
      console.log(`   - Notificaciones push: ${user.pushNotifications}`);
      console.log(`   - Modo oscuro: ${user.darkMode}`);
      console.log(`   - Historial de accesos: ${user.loginHistory?.length || 0} entradas`);
      console.log(`   - Creado: ${user.createdAt}`);
      console.log('');
    });
    
    // Probar actualización de perfil
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`\nProbando actualización del perfil para: ${testUser.username}`);
      
      const updateData = {
        firstName: 'Usuario Actualizado',
        lastName: 'Apellido Nuevo',
        phone: '+18095559876',
        address: 'Nueva Dirección, Santo Domingo',
        birthDate: new Date('1985-05-15')
      };
      
      const updatedUser = await User.findByIdAndUpdate(
        testUser._id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
      
      console.log('✅ Perfil actualizado exitosamente');
      console.log(`   - Nombre: ${updatedUser.firstName} ${updatedUser.lastName}`);
      console.log(`   - Teléfono: ${updatedUser.phone}`);
      console.log(`   - Dirección: ${updatedUser.address}`);
      console.log(`   - Fecha de nacimiento: ${updatedUser.birthDate}`);
    }
    
    // Probar cambio de contraseña
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`\nProbando cambio de contraseña para: ${testUser.username}`);
      
      // Obtener usuario con contraseña para la prueba
      const userWithPassword = await User.findById(testUser._id);
      
      // Verificar contraseña actual
      const isMatch = await userWithPassword.comparePassword('password123');
      console.log(`   - Contraseña actual válida: ${isMatch}`);
      
      if (isMatch) {
        // Cambiar contraseña
        userWithPassword.password = 'newpassword456';
        await userWithPassword.save();
        console.log('✅ Contraseña cambiada exitosamente');
        
        // Verificar nueva contraseña
        const newPasswordMatch = await userWithPassword.comparePassword('newpassword456');
        console.log(`   - Nueva contraseña válida: ${newPasswordMatch}`);
      }
    }
    
    // Probar actualización de notificaciones
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`\nProbando actualización de notificaciones para: ${testUser.username}`);
      
      const notificationData = {
        emailNotifications: false,
        pushNotifications: true
      };
      
      const updatedUser = await User.findByIdAndUpdate(
        testUser._id,
        notificationData,
        { new: true, runValidators: true }
      ).select('-password');
      
      console.log('✅ Notificaciones actualizadas exitosamente');
      console.log(`   - Email: ${updatedUser.emailNotifications}`);
      console.log(`   - Push: ${updatedUser.pushNotifications}`);
    }
    
    // Probar actualización de tema
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`\nProbando actualización de tema para: ${testUser.username}`);
      
      const themeData = {
        darkMode: true
      };
      
      const updatedUser = await User.findByIdAndUpdate(
        testUser._id,
        themeData,
        { new: true, runValidators: true }
      ).select('-password');
      
      console.log('✅ Tema actualizado exitosamente');
      console.log(`   - Modo oscuro: ${updatedUser.darkMode}`);
    }
    
    console.log('\n✅ Todas las pruebas completadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    mongoose.disconnect();
  }
}

testProfileIntegration();
