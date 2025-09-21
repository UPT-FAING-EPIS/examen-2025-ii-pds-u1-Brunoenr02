# ============================================================================
# TERRAFORM OUTPUTS - BABYSITTER RENTAL SYSTEM
# ============================================================================

# ============================================================================
# DATABASE OUTPUTS
# ============================================================================

output "database_connection_name" {
  description = "Cloud SQL instance connection name"
  value       = google_sql_database_instance.babysitter_db_instance.connection_name
}

output "database_ip_address" {
  description = "Cloud SQL instance IP address"
  value       = google_sql_database_instance.babysitter_db_instance.ip_address.0.ip_address
}

output "database_name" {
  description = "Database name"
  value       = google_sql_database.babysitter_database.name
}

output "database_user" {
  description = "Database user"
  value       = google_sql_user.babysitter_user.name
}

# ============================================================================
# CLOUD RUN OUTPUTS
# ============================================================================

output "backend_url" {
  description = "Backend service URL"
  value       = google_cloud_run_service.backend.status[0].url
}

output "frontend_url" {
  description = "Frontend service URL"
  value       = google_cloud_run_service.frontend.status[0].url
}

output "backend_service_name" {
  description = "Backend service name"
  value       = google_cloud_run_service.backend.name
}

output "frontend_service_name" {
  description = "Frontend service name"
  value       = google_cloud_run_service.frontend.name
}

# ============================================================================
# ARTIFACT REGISTRY OUTPUTS
# ============================================================================

output "artifact_registry_repository_url" {
  description = "Artifact Registry repository URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.babysitter_repo.repository_id}"
}

# ============================================================================
# PROJECT INFORMATION
# ============================================================================

output "project_id" {
  description = "Google Cloud Project ID"
  value       = var.project_id
}

output "region" {
  description = "Deployment region"
  value       = var.region
}

# ============================================================================
# USEFUL MANAGEMENT URLS
# ============================================================================

output "management_urls" {
  description = "Useful management URLs"
  value = {
    cloud_sql_console = "https://console.cloud.google.com/sql/instances/${google_sql_database_instance.babysitter_db_instance.name}/overview?project=${var.project_id}"
    cloud_run_console = "https://console.cloud.google.com/run?project=${var.project_id}"
    artifact_registry = "https://console.cloud.google.com/artifacts/docker/${var.project_id}/${var.region}/${google_artifact_registry_repository.babysitter_repo.repository_id}?project=${var.project_id}"
    logs_backend      = "https://console.cloud.google.com/logs/query;query=resource.type%3D%22cloud_run_revision%22%20resource.labels.service_name%3D%22${google_cloud_run_service.backend.name}%22?project=${var.project_id}"
    logs_frontend     = "https://console.cloud.google.com/logs/query;query=resource.type%3D%22cloud_run_revision%22%20resource.labels.service_name%3D%22${google_cloud_run_service.frontend.name}%22?project=${var.project_id}"
  }
}

# ============================================================================
# CONNECTION STRING FOR APPLICATION
# ============================================================================

output "connection_string" {
  description = "Database connection string for .NET application"
  value       = "Server=${google_sql_database_instance.babysitter_db_instance.ip_address.0.ip_address};Database=${var.database_name};Uid=${var.database_user};Pwd=${var.database_password};SslMode=Required;"
  sensitive   = true
}