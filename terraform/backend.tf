# Configuración para guardar el estado de Terraform en un bucket de GCS
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  # Backend para guardar el estado en Google Cloud Storage
  # Descomenta y configura después de crear el bucket
  # backend "gcs" {
  #   bucket  = "tfstate-babysitter-tu-nombre-2025"
  #   prefix  = "terraform/state"
  # }
}