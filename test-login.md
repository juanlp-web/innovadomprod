# 🧪 Guía de Prueba del Login

## 🔍 **Problema Identificado:**
El login es exitoso pero no redirige al usuario al dashboard.

## 🛠️ **Pasos para Solucionar:**

### **1. Verificar el Backend:**
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

### **2. Verificar la API:**
Abre otra terminal y ejecuta:
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
  "success": true,
  "message": "Login exitoso",
  "user": {
    "id": "admin-001",
    "name": "Administrador",
    "email": "admin@innovadomprod.com",
    "role": "admin"
  },
  "token": "dev-jwt-token-..."
}
```

### **4. Verificar el Frontend:**
1. Abre http://localhost:5174 en tu navegador
2. Abre la consola del navegador (F12)
3. Intenta hacer login con:
   - **Usuario:** admin@innovadomprod.com
   - **Password:** admin123

**En la consola deberías ver:**
```
🔍 Verificando autenticación...
⚠️  No hay usuario o token guardado
🏁 Verificación de autenticación completada
📝 Enviando formulario de login...
🚀 Iniciando login... {email: "admin@innovadomprod.com", password: "admin123"}
📡 Respuesta del servidor: {success: true, ...}
✅ Login exitoso, guardando datos...
👤 Usuario establecido: {id: "admin-001", ...}
✅ Login exitoso, limpiando errores...
🔍 Login component - Estado del usuario: {id: "admin-001", ...}
🔄 Estado del contexto: {user: {...}, loading: false, ...}
```

### **5. Si el Login Funciona pero No Redirige:**

**Problema:** React Router no detecta el cambio de estado.

**Solución:** Verifica que:
1. El `AuthProvider` esté envolviendo la aplicación
2. El estado `user` se esté actualizando correctamente
3. Las rutas estén configuradas correctamente

### **6. Debug Adicional:**

En el componente Login, deberías ver:
- **Debug: Usuario actual:** No logueado → Administrador
- **Debug: Estado:** No autenticado → Autenticado

## 🚨 **Posibles Causas:**

1. **Backend no está corriendo** → Ejecuta `npm run dev-simple`
2. **Archivo .env no configurado** → Copia `env-template.txt` a `.env`
3. **Problema de CORS** → Verifica que FRONTEND_URL sea correcto
4. **Estado no se actualiza** → Verifica los logs en la consola

## ✅ **Solución Esperada:**

Después del login exitoso:
1. El usuario se guarda en localStorage
2. El estado `user` se actualiza
3. React Router detecta el cambio
4. Redirige automáticamente a `/dashboard`
5. Se muestra el dashboard con la sidebar

## 🔧 **Comandos de Emergencia:**

```bash
# Reiniciar backend
cd backend && npm run dev-simple

# Reiniciar frontend
npm run dev

# Limpiar localStorage (en consola del navegador)
localStorage.clear()
location.reload()
```
