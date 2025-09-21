# ============================================================================
# BACKEND CONFIGURATION FOR TERRAFORM STATE
# ============================================================================
# Este archivo configura donde guardar el estado de Terraform
# Para producción, descomenta y configura el backend de GCS

# terraform {
#   backend "gcs" {
#     bucket  = "tfstate-babysitter-exapatrones-2025"
#     prefix  = "terraform/state"
#   }
# }