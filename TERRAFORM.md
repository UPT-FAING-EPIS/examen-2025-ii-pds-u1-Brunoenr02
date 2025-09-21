# 🌩️ Infrastructure as Code (IaC) - Terraform + Google Cloud Platform

## 📋 **Terraform Infrastructure Overview**

Tu aplicación de **Sistema de Alquiler de Niñeras** ahora incluye **infraestructura como código** completa para Google Cloud Platform:

### 🏗️ **Infraestructura Creada Automáticamente**

```
Google Cloud Platform
├── 🌐 VPC Network (Red Privada Virtual)
├── 🗄️ Cloud SQL MySQL (Base de Datos Gestionada)
├── 🚀 Cloud Run Services (Backend .NET + Frontend React)
├── 📦 Artifact Registry (Repositorio Docker)
├── 🔌 VPC Connector (Comunicación Segura)
├── 🛡️ Firewall Rules (Seguridad de Red)
└── 🔐 IAM Policies (Permisos y Accesos)
```

### 💰 **Estimación de Costos Mensuales**
- **Cloud SQL (f1-micro)**: ~$10-15 USD
- **Cloud Run (2 servicios)**: ~$10-35 USD
- **Artifact Registry**: ~$1-5 USD
- **VPC Connector**: ~$5 USD
- **🎯 Total Estimado**: ~$26-60 USD/mes

## 🚀 **Quick Start - Deployment en 5 Pasos**

### **1. Configurar Google Cloud CLI**
```bash
# Instalar gcloud CLI (si no lo tienes)
# Descargar desde: https://cloud.google.com/sdk/docs/install

# Autenticar
gcloud auth login

# Configurar proyecto
gcloud config set project TU-PROJECT-ID
```

### **2. Instalar Terraform**
```bash
# Windows (Chocolatey)
choco install terraform

# Verificar instalación
terraform version
```

### **3. Configurar Variables**
```bash
cd terraform

# Crear archivo de configuración
cp terraform.tfvars.example terraform.tfvars

# Editar con tus valores reales
code terraform.tfvars
```

### **4. Desplegar Infraestructura**
```bash
# Inicializar Terraform
terraform init

# Ver plan de deployment
terraform plan

# Aplicar infraestructura
terraform apply
# Escribir 'yes' para confirmar
```

### **5. Desplegar Aplicaciones**
```bash
# Configurar Docker para GCP
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build y push imágenes
docker build -t us-central1-docker.pkg.dev/TU-PROJECT-ID/babysitter-app-repo/backend:latest ./backend
docker build -t us-central1-docker.pkg.dev/TU-PROJECT-ID/babysitter-app-repo/frontend:latest ./frontend

docker push us-central1-docker.pkg.dev/TU-PROJECT-ID/babysitter-app-repo/backend:latest
docker push us-central1-docker.pkg.dev/TU-PROJECT-ID/babysitter-app-repo/frontend:latest
```

## 📁 **Archivos Terraform Incluidos**

### **Configuración Principal**
- **`main.tf`**: Recursos principales (VPC, Cloud SQL, Cloud Run)
- **`variables.tf`**: Variables configurables con validaciones
- **`outputs.tf`**: URLs, conexiones y datos importantes
- **`versions.tf`**: Versiones de providers y Terraform

### **Configuración y Ejemplos**
- **`terraform.tfvars.example`**: Template de configuración
- **`README.md`**: Documentación completa paso a paso

### **Seguridad**
- **`.gitignore`**: Actualizado con protección para archivos Terraform
- **Passwords automáticas**: Generadas por Terraform
- **Variables sensibles**: Marcadas como `sensitive = true`

## 🔧 **Características Avanzadas**

### **🛡️ Seguridad Implementada**
- ✅ VPC privada con subredes dedicadas
- ✅ Firewall rules restrictivas
- ✅ SSL/TLS obligatorio para base de datos
- ✅ Variables sensibles protegidas
- ✅ IAM policies de menor privilegio

### **📈 Escalabilidad y Performance**
- ✅ Autoescalado de Cloud Run (0-10 instancias)
- ✅ Balanceador de carga automático
- ✅ Base de datos con backups automáticos
- ✅ Recursos optimizados por costos

### **🔄 Gestión y Mantenimiento**
- ✅ Infrastructure as Code versionada
- ✅ Outputs informativos para gestión
- ✅ Configuración por ambientes (dev/staging/prod)
- ✅ Estado de Terraform gestionado

## 🌍 **Ambientes Múltiples**

### **Desarrollo**
```bash
# terraform/dev.tfvars
project_id = "mi-proyecto-dev"
app_name = "babysitter-dev"
db_tier = "db-f1-micro"
min_instances = 0
max_instances = 3
```

### **Producción**
```bash
# terraform/prod.tfvars
project_id = "mi-proyecto-prod"
app_name = "babysitter-prod"
db_tier = "db-n1-standard-1"
min_instances = 1
max_instances = 10
enable_deletion_protection = true
```

## 📊 **Monitoreo y Gestión**

### **URLs de Gestión Automáticas**
```bash
# Ver URLs después del deployment
terraform output management_urls

# URLs incluidas:
# - Cloud SQL Console
# - Cloud Run Console  
# - Artifact Registry
# - VPC Console
```

### **Comandos de Información**
```bash
# Ver todas las salidas
terraform output

# URLs de las aplicaciones
terraform output frontend_url
terraform output backend_url

# Información de base de datos
terraform output database_connection_name
```

## 🚨 **Comandos de Emergencia**

### **Backup de Estado**
```bash
# Crear backup del estado
cp terraform.tfstate terraform.tfstate.backup.$(date +%Y%m%d-%H%M%S)
```

### **Rollback**
```bash
# Volver a versión anterior
terraform state pull > backup.tfstate
terraform apply
```

### **Destruir Todo** ⚠️
```bash
# CUIDADO: Esto elimina TODA la infraestructura
terraform destroy
```

## 🔗 **Integración con CI/CD**

### **GitHub Actions Ready**
```yaml
# .github/workflows/deploy-gcp.yml (ejemplo incluido)
name: Deploy to GCP
on:
  push:
    branches: [main]
jobs:
  deploy:
    steps:
    - name: Deploy Infrastructure
      run: |
        cd terraform
        terraform init
        terraform apply -auto-approve
```

## ✅ **Lo que ya está listo**

- ✅ **Infraestructura completa** definida en código
- ✅ **Documentación detallada** paso a paso
- ✅ **Seguridad implementada** desde el diseño
- ✅ **Escalabilidad automática** configurada
- ✅ **Costos optimizados** para diferentes ambientes
- ✅ **Backups automáticos** de base de datos
- ✅ **Monitoreo integrado** con Google Cloud

## 🎯 **Próximos Pasos Recomendados**

1. **Crear proyecto en Google Cloud**
2. **Configurar `terraform.tfvars`** con tus valores
3. **Ejecutar `terraform apply`**
4. **Hacer build y push de imágenes Docker**
5. **¡Tu aplicación estará en producción!**

**¡Tu Sistema de Alquiler de Niñeras ahora tiene infraestructura profesional nivel enterprise!** 🚀