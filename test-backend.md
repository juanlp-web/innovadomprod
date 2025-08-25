# 🧪 Prueba del Backend

## 🔍 **Verificar que el Backend esté Funcionando:**

### **1. Ejecutar el Backend:**
```bash
cd backend
npm run dev-simple
```

**Deberías ver:**
```
🚀 Servidor de desarrollo corriendo en puerto 5000
📱 Frontend: http://localhost:5174
🔗 API: http://localhost:5000
⚠️  MODO: Desarrollo (sin MongoDB)
🔑 Credenciales: admin@innovadomprod.com / admin123
```

### **2. Probar la API (en otra terminal):**
```bash
curl http://localhost:5000/
```

**Deberías ver:**
```json
{
  "message": "API de Innovadomprod funcionando en modo desarrollo",
  "version": "1.0.0-dev",
  "mode": "development (sin MongoDB)"
}
```

### **3. Probar el Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@innovadomprod.com","password":"admin123"}'
```

**Deberías ver:**
```json
{
  "_id": "...",
  "name": "Administrador",
  "email": "admin@innovadomprod.com",
  "role": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🚨 **Si el Backend No Funciona:**

### **Error: "Cannot find module"**
```bash
cd backend
npm install
```

### **Error: "Port already in use"**
```bash
# En Windows, buscar el proceso que usa el puerto 5000
netstat -ano | findstr :5000
# Luego terminar el proceso con el PID encontrado
taskkill /PID <PID> /F
```

### **Error: "Module not found"**
```bash
cd backend
npm install express cors dotenv
```

## ✅ **Una vez que el Backend Funcione:**

1. **El frontend debería poder conectarse**
2. **El login debería funcionar**
3. **Deberías ver los logs de depuración en la consola del navegador**
4. **Después del login exitoso, deberías ser redirigido al dashboard**

## 🔧 **Comandos de Emergencia:**

```bash
# Reiniciar backend
cd backend && npm run dev-simple

# Verificar puertos en uso
netstat -ano | findstr :5000
netstat -ano | findstr :5174

# Limpiar e instalar dependencias
cd backend && rm -rf node_modules package-lock.json && npm install
```
