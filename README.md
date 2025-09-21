# Sistema de Alquiler de Niñeras

## 🎯 Descripción
Plataforma web completa que conecta a familias con niñeras calificadas, permitiendo la búsqueda, reserva y gestión de servicios de cuidado infantil de manera segura y eficiente.

## 🚀 Características

- **Autenticación y Autorización**: Sistema seguro con JWT
- **Gestión de Usuarios**: Familias y niñeras con perfiles detallados
- **Sistema de Reservas**: Reserva y gestión de citas
- **Sistema de Reseñas**: Calificaciones y comentarios (⭐ 1-5 estrellas)
- **Dashboard Interactivo**: Interfaces específicas por tipo de usuario
- **Responsive Design**: Compatible con dispositivos móviles

## 🛠️ Tecnologías Utilizadas

### Backend
- .NET Core 8.0
- Entity Framework Core
- MySQL (Pomelo.EntityFrameworkCore.MySql)
- JWT Authentication
- BCrypt para encriptación de contraseñas

### Frontend
- React 18
- Material-UI (MUI)
- React Router DOM
- Axios
- Day.js para manejo de fechas

## 📁 Estructura del Proyecto

```
babysitter-rental-system/
├── backend/                 # API .NET Core
│   └── BabysitterApi/
│       ├── Controllers/     # Controladores REST (Auth, Bookings, Nannies, Reviews)
│       ├── Models/         # Modelos de datos (Usuario, Ninera, Reserva, Resena)
│       ├── Data/           # Contexto Entity Framework
│       ├── DTOs/           # Objetos de transferencia de datos
│       ├── Services/       # Servicios de negocio
│       └── Dockerfile
├── frontend/               # Aplicación React
│   └── babysitter-frontend/
│       ├── src/
│       │   ├── components/ # Componentes reutilizables
│       │   ├── pages/      # Páginas principales (Login, Dashboards)
│       │   ├── contexts/   # Contextos React (AuthContext)
│       │   └── services/   # Servicios API
│       ├── Dockerfile
│       └── nginx.conf
├── database/
│   └── schema.sql          # Esquema completo de base de datos
├── docker-compose.yml      # Configuración Docker para desarrollo
├── .env.example           # Template de variables de entorno
├── SECRETS.md             # 🔐 Guía de configuración de secretos
├── GITHUB_SETUP.md        # 📋 Setup de GitHub Secrets
├── DEPLOYMENT.md          # 🚀 Guía de deployment en producción
└── README.md
```

### 🚀 Quick Start

#### **Desarrollo Local**
```bash
# 1. Clonar repositorio
git clone <repository-url>
cd babysitter-rental-system

# 2. Configurar variables (ver SECRETS.md)
cp .env.example .env
# Editar .env con tus valores reales

# 3. Opción A: Docker (Recomendado)
docker-compose up --build

# 3. Opción B: Manual
# Backend
cd backend/BabysitterApi
dotnet restore
dotnet ef database update
dotnet run

# Frontend (nueva terminal)
cd frontend/babysitter-frontend
npm install
npm start
```

#### **Deployment en Producción**
```bash
# Ver DEPLOYMENT.md para opciones completas:
# - GitHub Actions + Azure/AWS
# - Vercel + Railway/Render  
# - Heroku + Netlify
# - Y más...
```

### 🌐 URLs de Acceso

- **Frontend**: http://localhost:3000 (desarrollo)
- **Backend API**: http://localhost:5000 (desarrollo)
- **Swagger UI**: http://localhost:5000/swagger (desarrollo)

### 👥 Usuarios de Prueba

#### Familia
- **Email**: familia@gmail.com
- **Password**: familia

#### Niñera
- **Email**: ninera@gmail.com
- **Password**: ninera
## 📖 API Documentation

La documentación completa de la API está disponible en `/swagger` cuando el backend está ejecutándose.

### 🔌 Endpoints Principales

#### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión

#### Niñeras
- `GET /api/nannies` - Listar niñeras (con filtros opcionales)
- `GET /api/nannies/{id}` - Detalle de niñera específica

#### Reservas
- `POST /api/bookings` - Crear nueva reserva
- `GET /api/bookings/user` - Obtener reservas del usuario autenticado

#### Reseñas (Nuevo Sistema)
- `POST /api/reviews` - Crear reseña para niñera
- `GET /api/reviews/nanny/{id}` - Obtener reseñas de niñera
- `GET /api/reviews/check/{nannyId}` - Verificar si puede reseñar

## ✨ Funcionalidades Implementadas

### 👨‍👩‍👧‍👦 Para Familias
- ✅ Registro y autenticación
- ✅ Búsqueda de niñeras con filtros (ciudad, disponibilidad)
- ✅ Visualización de perfiles de niñeras
- ✅ Creación de reservas con fechas específicas
- ✅ Gestión de reservas activas y pasadas
- ✅ **Sistema de reseñas**: Calificar niñeras (1-5 ⭐)
- ✅ **Ver reseñas**: Consultar opiniones de otras familias

### 👩‍🔬 Para Niñeras
- ✅ Registro con perfil profesional
- ✅ Visualización de reservas confirmadas
- ✅ Gestión de horarios de disponibilidad
- ✅ Información de contacto de familias
- ✅ **Ver reseñas recibidas**: Consultar calificaciones

### 🌟 Características Generales
- ✅ Autenticación JWT segura
- ✅ Validación de datos en frontend y backend
- ✅ Interfaz responsive con Material-UI
- ✅ Navegación protegida por roles
- ✅ Cálculo automático de costos por servicio
- ✅ **Sistema de reseñas completo**
- ✅ **Actualización automática de calificación promedio**

## 🔐 Seguridad Implementada

- ✅ Autenticación JWT
- ✅ Encriptación de contraseñas con BCrypt
- ✅ Variables de entorno para datos sensibles
- ✅ Validación de entrada
- ✅ Protección CORS
- ✅ .gitignore configurado para secretos
- ✅ **Listo para deployment en producción**

## 🧪 Testing

### Backend
```bash
cd backend/BabysitterApi
dotnet test
```

### Frontend
```bash
cd frontend/babysitter-frontend
npm test
```

## 🚀 **Ready for Production!**

Este proyecto está **completamente preparado** para deployment en producción:

- ✅ **Código limpio** sin credenciales hardcodeadas
- ✅ **Variables de entorno** configuradas correctamente
- ✅ **Documentación completa** de deployment
- ✅ **GitHub Secrets** preparados
- ✅ **Múltiples opciones** de hosting disponibles