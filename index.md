# Documentación Babysitter App

Bienvenido a la documentación completa del sistema de gestión de niñeras.

## Arquitectura del Sistema

- **Backend**: .NET Core 8.0 + Entity Framework + MySQL
- **Frontend**: React 18 + TypeScript + Material-UI  
- **Infraestructura**: Google Cloud Platform + Terraform
- **CI/CD**: GitHub Actions

## Diagramas Disponibles

### Infraestructura
- [Diagrama de Infraestructura](diagrams/terraform-graph.png)
- [Documentación de Terraform](infra-docs.md)

### Código
- [Diagrama de Clases Backend](diagrams/backend-class-diagram.png)
- [Diagrama de Componentes Frontend](diagrams/frontend-component-diagram.png)

## 📖 Documentación API

### Backend (.NET Core)
- [Documentación API Backend](api/backend/)
- **Endpoints principales**:
  - `/api/auth` - Autenticación
  - `/api/users` - Gestión de usuarios
  - `/api/nannies` - Gestión de niñeras
  - `/api/bookings` - Sistema de reservas
  - `/api/reviews` - Sistema de reseñas

### Frontend (React)
- [Documentación Frontend](api/frontend/)
- **Componentes principales**:
  - Autenticación y registro
  - Búsqueda de niñeras
  - Sistema de reservas
  - Perfil de usuario

## Inicio Rápido

### Desarrollo Local

#### Backend
```bash
cd backend/BabysitterApi
dotnet restore
dotnet run
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

#### Base de Datos
```bash
docker-compose up mysql
```

### Despliegue en Producción

El sistema se despliega automáticamente en Google Cloud Platform cuando se hace push a la rama `main`.

## 📞 Enlaces Útiles

- [Repositorio GitHub](https://github.com/UPT-FAING-EPIS/examen-2025-ii-pds-u1-Brunoenr02)
- [Issues y Bugs](https://github.com/UPT-FAING-EPIS/examen-2025-ii-pds-u1-Brunoenr02/issues)
- [Wiki del Proyecto](https://github.com/UPT-FAING-EPIS/examen-2025-ii-pds-u1-Brunoenr02/wiki)

---

**Última actualización**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Generado automáticamente** por GitHub Actions
