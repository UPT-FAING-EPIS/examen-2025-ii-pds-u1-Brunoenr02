# ============================================================================
# DOCKERFILE PARA FRONTEND - REACT 18 + NGINX
# ============================================================================

# Multi-stage build para optimizar tamaño de imagen

# Etapa 1: Build de la aplicación React
FROM node:18-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY babysitter-frontend/package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY babysitter-frontend/ ./

# Construir aplicación para producción
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine AS production

# Copiar build de React a nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Crear directorio para logs
RUN mkdir -p /var/log/nginx

# Exponer puerto 80
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]