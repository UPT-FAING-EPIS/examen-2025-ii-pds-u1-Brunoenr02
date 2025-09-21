# ============================================================================
# OUTPUTS FOR BABYSITTER RENTAL SYSTEM TERRAFORM CONFIGURATION
# ============================================================================

# ============================================================================
# PROJECT INFORMATION
# ============================================================================

output "project_id" {
  description = "The GCP project ID"
  value       = var.project_id
}

output "region" {
  description = "The GCP region used for resources"
  value       = var.region
}

# ============================================================================
# DATABASE OUTPUTS
# ============================================================================

output "database_instance_name" {
  description = "The name of the Cloud SQL instance"
  value       = google_sql_database_instance.babysitter_db_instance.name
}

output "database_connection_name" {
  description = "The connection name of the Cloud SQL instance"
  value       = google_sql_database_instance.babysitter_db_instance.connection_name
}

output "database_ip_address" {
  description = "The IP address of the Cloud SQL instance"
  value       = google_sql_database_instance.babysitter_db_instance.ip_address.0.ip_address
}

output "database_name" {
  description = "The name of the database"
  value       = google_sql_database.babysitter_db.name
}

# ============================================================================
# CLOUD RUN OUTPUTS
# ============================================================================

output "backend_url" {
  description = "The URL of the backend Cloud Run service"
  value       = google_cloud_run_service.backend.status[0].url
}

output "frontend_url" {
  description = "The URL of the frontend Cloud Run service"
  value       = google_cloud_run_service.frontend.status[0].url
}

output "backend_service_name" {
  description = "The name of the backend Cloud Run service"
  value       = google_cloud_run_service.backend.name
}

output "frontend_service_name" {
  description = "The name of the frontend Cloud Run service"
  value       = google_cloud_run_service.frontend.name
}

# ============================================================================
# ARTIFACT REGISTRY OUTPUTS
# ============================================================================

output "artifact_registry_repository_url" {
  description = "The URL of the Artifact Registry repository"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.babysitter_repo.repository_id}"
}

# ============================================================================
# CONNECTION STRING
# ============================================================================

output "database_connection_string" {
  description = "Complete connection string for the backend application"
  value       = "Server=${google_sql_database_instance.babysitter_db_instance.ip_address.0.ip_address};Database=${var.database_name};Uid=${var.database_user};Pwd=${var.database_password};SslMode=Required;"
  sensitive   = true
}

# ============================================================================
# DEPLOYMENT COMMANDS
# ============================================================================

output "docker_commands" {
  description = "Commands to build and push Docker images"
  value = {
    configure_docker = "gcloud auth configure-docker ${var.region}-docker.pkg.dev"
    build_backend    = "docker build -t ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.babysitter_repo.repository_id}/backend:latest ./backend"
    build_frontend   = "docker build -t ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.babysitter_repo.repository_id}/frontend:latest ./frontend"
    push_backend     = "docker push ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.babysitter_repo.repository_id}/backend:latest"
    push_frontend    = "docker push ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.babysitter_repo.repository_id}/frontend:latest"
  }
}

# ============================================================================
# USEFUL URLS FOR MANAGEMENT
# ============================================================================

output "management_urls" {
  description = "Useful URLs for managing resources in Google Cloud Console"
  value = {
    cloud_sql_console   = "https://console.cloud.google.com/sql/instances/${google_sql_database_instance.babysitter_db_instance.name}/overview?project=${var.project_id}"
    cloud_run_console   = "https://console.cloud.google.com/run?project=${var.project_id}"
    artifact_registry   = "https://console.cloud.google.com/artifacts/docker/${var.project_id}/${var.region}/${google_artifact_registry_repository.babysitter_repo.repository_id}?project=${var.project_id}"
  }
}

# ============================================================================
# SUMMARY
# ============================================================================

output "deployment_summary" {
  description = "Summary of deployed resources"
  value = {
    application_name = var.app_name
    backend_url     = google_cloud_run_service.backend.status[0].url
    frontend_url    = google_cloud_run_service.frontend.status[0].url
    database_tier   = var.db_tier
    status         = "Infrastructure deployed successfully!"
  }
}

# ============================================================================
# CLOUD RUN OUTPUTS
# ============================================================================

output "backend_url" {
  description = "The URL of the backend Cloud Run service"
  value       = google_cloud_run_service.backend.status[0].url
}

output "frontend_url" {
  description = "The URL of the frontend Cloud Run service"
  value       = google_cloud_run_service.frontend.status[0].url
}

output "backend_service_name" {
  description = "The name of the backend Cloud Run service"
  value       = google_cloud_run_service.backend.name
}

output "frontend_service_name" {
  description = "The name of the frontend Cloud Run service"
  value       = google_cloud_run_service.frontend.name
}

# ============================================================================
# ARTIFACT REGISTRY OUTPUTS
# ============================================================================

output "artifact_registry_repository_id" {
  description = "The ID of the Artifact Registry repository"
  value       = google_artifact_registry_repository.babysitter_repo.repository_id
}

output "artifact_registry_repository_url" {
  description = "The URL of the Artifact Registry repository"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.babysitter_repo.repository_id}"
}

# ============================================================================
# CONNECTION STRINGS AND SECRETS
# ============================================================================

output "backend_connection_string" {
  description = "Complete connection string for the backend application"
  value       = "Server=${google_sql_database_instance.babysitter_db.ip_address.0.ip_address};Database=${var.database_name};Uid=${var.database_user};Pwd=${random_password.db_password.result};SslMode=Required;"
  sensitive   = true
}

output "jwt_secret_key" {
  description = "Generated JWT secret key"
  value       = random_password.jwt_secret.result
  sensitive   = true
}

# ============================================================================
# DEPLOYMENT INFORMATION
# ============================================================================

output "docker_push_commands" {
  description = "Commands to push Docker images to Artifact Registry"
  value = {
    configure_docker = "gcloud auth configure-docker ${var.region}-docker.pkg.dev"
    build_backend    = "docker build -t ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.babysitter_repo.repository_id}/backend:latest ./backend"
    build_frontend   = "docker build -t ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.babysitter_repo.repository_id}/frontend:latest ./frontend"
    push_backend     = "docker push ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.babysitter_repo.repository_id}/backend:latest"
    push_frontend    = "docker push ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.babysitter_repo.repository_id}/frontend:latest"
  }
}

# ============================================================================
# COST MONITORING
# ============================================================================

output "estimated_monthly_cost" {
  description = "Estimated monthly cost breakdown (approximate)"
  value = {
    cloud_sql_micro     = "~$10-15 USD/month"
    cloud_run_backend   = "~$5-20 USD/month (depends on traffic)"
    cloud_run_frontend  = "~$5-15 USD/month (depends on traffic)"
    artifact_registry   = "~$1-5 USD/month (depends on image storage)"
    vpc_connector       = "~$5 USD/month"
    total_estimate      = "~$26-60 USD/month"
    note               = "Costs depend on usage, traffic, and scaling"
  }
}

# ============================================================================
# USEFUL URLs FOR MANAGEMENT
# ============================================================================

output "management_urls" {
  description = "Useful URLs for managing resources"
  value = {
    cloud_sql_console   = "https://console.cloud.google.com/sql/instances/${google_sql_database_instance.babysitter_db.name}/overview?project=${var.project_id}"
    cloud_run_console   = "https://console.cloud.google.com/run?project=${var.project_id}"
    artifact_registry   = "https://console.cloud.google.com/artifacts/docker/${var.project_id}/${var.region}/${google_artifact_registry_repository.babysitter_repo.repository_id}?project=${var.project_id}"
    vpc_console        = "https://console.cloud.google.com/networking/networks/details/${google_compute_network.babysitter_vpc.name}?project=${var.project_id}"
  }
}