# ============================================================================
# BABYSITTER RENTAL SYSTEM - TERRAFORM CONFIGURATION FOR GOOGLE CLOUD
# ============================================================================
# Version: 1.0.0
# Deploy trigger: 2025-09-21

# Configuración del proveedor de Google Cloud
provider "google" {
  project = var.project_id
  region  = var.region
}

# ============================================================================
# ENABLE GOOGLE CLOUD APIS
# ============================================================================

resource "google_project_service" "services" {
  for_each = toset([
    "sqladmin.googleapis.com",
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com"
  ])

  project = var.project_id
  service = each.value

  disable_dependent_services = true
}

# ============================================================================
# CLOUD SQL INSTANCE (MySQL)
# ============================================================================

resource "google_sql_database_instance" "babysitter_db_instance" {
  name             = "${var.app_name}-db-instance"
  database_version = "MYSQL_8_0"
  region           = var.region
  depends_on       = [google_project_service.services]

  settings {
    tier = var.db_tier

    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "allow-all"
        value = "0.0.0.0/0"
      }
    }

    backup_configuration {
      enabled    = true
      start_time = var.backup_start_time
    }

    database_flags {
      name  = "sql_mode"
      value = "TRADITIONAL"
    }
  }

  deletion_protection = var.enable_deletion_protection
}

# Database
resource "google_sql_database" "babysitter_database" {
  name     = var.database_name
  instance = google_sql_database_instance.babysitter_db_instance.name
}

# Database User
resource "google_sql_user" "babysitter_user" {
  name     = var.database_user
  instance = google_sql_database_instance.babysitter_db_instance.name
  password = var.database_password
}

# ============================================================================
# ARTIFACT REGISTRY
# ============================================================================

resource "google_artifact_registry_repository" "babysitter_repo" {
  location      = var.region
  repository_id = "${var.app_name}-repo"
  description   = "Docker repository for Babysitter application"
  format        = "DOCKER"
  depends_on    = [google_project_service.services]
}

# ============================================================================
# CLOUD RUN SERVICES
# ============================================================================

# Backend API Service
resource "google_cloud_run_service" "backend" {
  name     = "${var.app_name}-backend"
  location = var.region
  depends_on = [
    google_project_service.services,
    google_sql_database_instance.babysitter_db_instance
  ]

  template {
    spec {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.babysitter_repo.repository_id}/backend:${var.backend_image_tag}"

        resources {
          limits = {
            cpu    = var.backend_cpu
            memory = var.backend_memory
          }
        }

        env {
          name  = "ASPNETCORE_ENVIRONMENT"
          value = "Production"
        }

        env {
          name  = "ConnectionStrings__DefaultConnection"
          value = "Server=${google_sql_database_instance.babysitter_db_instance.ip_address.0.ip_address};Database=${var.database_name};Uid=${var.database_user};Pwd=${var.database_password};SslMode=Required;"
        }

        env {
          name  = "JWT__SecretKey"
          value = var.jwt_secret_key
        }

        env {
          name  = "JWT__Issuer"
          value = "BabysitterApi"
        }

        env {
          name  = "JWT__Audience"
          value = "BabysitterApp"
        }

        ports {
          container_port = 5000
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = tostring(var.min_instances)
        "autoscaling.knative.dev/maxScale" = tostring(var.max_instances)
        "run.googleapis.com/client-name"   = "terraform"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Frontend Service
resource "google_cloud_run_service" "frontend" {
  name     = "${var.app_name}-frontend"
  location = var.region
  depends_on = [
    google_project_service.services,
    google_cloud_run_service.backend
  ]

  template {
    spec {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.babysitter_repo.repository_id}/frontend:${var.frontend_image_tag}"

        resources {
          limits = {
            cpu    = var.frontend_cpu
            memory = var.frontend_memory
          }
        }

        env {
          name  = "REACT_APP_API_URL"
          value = "${google_cloud_run_service.backend.status[0].url}/api"
        }

        env {
          name  = "REACT_APP_ENV"
          value = "production"
        }

        ports {
          container_port = 80
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = tostring(var.min_instances)
        "autoscaling.knative.dev/maxScale" = tostring(var.max_instances)
        "run.googleapis.com/client-name"   = "terraform"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# ============================================================================
# IAM POLICIES
# ============================================================================

# Make backend service publicly accessible
resource "google_cloud_run_service_iam_member" "backend_invoker" {
  service  = google_cloud_run_service.backend.name
  location = google_cloud_run_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Make frontend service publicly accessible
resource "google_cloud_run_service_iam_member" "frontend_invoker" {
  service  = google_cloud_run_service.frontend.name
  location = google_cloud_run_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}