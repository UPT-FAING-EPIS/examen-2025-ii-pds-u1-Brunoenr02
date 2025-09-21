# ============================================================================
# BABYSITTER RENTAL SYSTEM - TERRAFORM CONFIGURATION FOR GOOGLE CLOUD
# ============================================================================

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
# CLOUD SQL INSTANCE (MySQL) - Simplificado como tu PostgreSQL
# ============================================================================

resource "google_sql_database_instance" "babysitter_db_instance" {
  name             = "${var.app_name}-db-instance"
  database_version = "MYSQL_8_0"
  region           = var.region
  depends_on       = [google_project_service.services]

  settings {
    tier = var.db_tier # db-g1-small o db-f1-micro

    # Habilitar IP pública (como tu configuración)
    ip_configuration {
      ipv4_enabled = true
      # Permitir acceso desde cualquier IP - mismo estilo que tu proyecto
      authorized_networks {
        name  = "allow-all"
        value = "0.0.0.0/0"
      }
    }

    backup_configuration {
      enabled    = true
      start_time = "03:00"
    }
  }

  deletion_protection = var.enable_deletion_protection
}

# Creación de la base de datos dentro de la instancia
resource "google_sql_database" "babysitter_db" {
  name     = var.database_name
  instance = google_sql_database_instance.babysitter_db_instance.name
}

# Creación del usuario para la base de datos
resource "google_sql_user" "babysitter_user" {
  name     = var.database_user
  instance = google_sql_database_instance.babysitter_db_instance.name
  password = var.database_password # Contraseña desde variables
}

# ============================================================================
# ARTIFACT REGISTRY - Para imágenes Docker
# ============================================================================

resource "google_artifact_registry_repository" "babysitter_repo" {
  location      = var.region
  repository_id = "${var.app_name}-repo"
  description   = "Docker repository for Babysitter application"
  format        = "DOCKER"
  depends_on    = [google_project_service.services]
}

# ============================================================================
# CLOUD RUN SERVICES - Serverless como tu estilo
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
        
        ports {
          container_port = 8080
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
          name  = "Jwt__Key"
          value = var.jwt_secret_key
        }

        env {
          name  = "Jwt__Issuer"
          value = "BabysitterApi"
        }

        env {
          name  = "Jwt__Audience"
          value = "BabysitterApiUsers"
        }

        resources {
          limits = {
            cpu    = var.backend_cpu
            memory = var.backend_memory
          }
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = var.min_instances
        "autoscaling.knative.dev/maxScale" = var.max_instances
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
        
        ports {
          container_port = 80
        }

        env {
          name  = "REACT_APP_API_URL"
          value = google_cloud_run_service.backend.status[0].url
        }

        resources {
          limits = {
            cpu    = var.frontend_cpu
            memory = var.frontend_memory
          }
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = var.min_instances
        "autoscaling.knative.dev/maxScale" = var.max_instances
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# ============================================================================
# IAM POLICIES FOR CLOUD RUN - Acceso público
# ============================================================================

resource "google_cloud_run_service_iam_member" "backend_invoker" {
  service  = google_cloud_run_service.backend.name
  location = google_cloud_run_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "frontend_invoker" {
  service  = google_cloud_run_service.frontend.name
  location = google_cloud_run_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
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
    google_sql_database_instance.babysitter_db
  ]

  template {
    spec {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.babysitter_repo.repository_id}/backend:latest"
        
        ports {
          container_port = 8080
        }

        env {
          name  = "ASPNETCORE_ENVIRONMENT"
          value = "Production"
        }

        env {
          name  = "ConnectionStrings__DefaultConnection"
          value = "Server=${google_sql_database_instance.babysitter_db.ip_address.0.ip_address};Database=${var.database_name};Uid=${var.database_user};Pwd=${random_password.db_password.result};SslMode=Required;"
        }

        env {
          name  = "Jwt__Key"
          value = random_password.jwt_secret.result
        }

        env {
          name  = "Jwt__Issuer"
          value = "BabysitterApi"
        }

        env {
          name  = "Jwt__Audience"
          value = "BabysitterApiUsers"
        }

        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
      }

      container_concurrency = 80
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale"         = "0"
        "autoscaling.knative.dev/maxScale"         = "10"
        "run.googleapis.com/cloudsql-instances"    = google_sql_database_instance.babysitter_db.connection_name
        "run.googleapis.com/vpc-access-connector"  = google_vpc_access_connector.connector.id
        "run.googleapis.com/vpc-access-egress"     = "private-ranges-only"
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
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.babysitter_repo.repository_id}/frontend:latest"
        
        ports {
          container_port = 80
        }

        env {
          name  = "REACT_APP_API_URL"
          value = google_cloud_run_service.backend.status[0].url
        }

        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
      }

      container_concurrency = 100
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "10"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# ============================================================================
# IAM POLICIES FOR CLOUD RUN
# ============================================================================

resource "google_cloud_run_service_iam_member" "backend_invoker" {
  service  = google_cloud_run_service.backend.name
  location = google_cloud_run_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "frontend_invoker" {
  service  = google_cloud_run_service.frontend.name
  location = google_cloud_run_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ============================================================================
# FIREWALL RULES
# ============================================================================

resource "google_compute_firewall" "allow_mysql" {
  name    = "${var.app_name}-allow-mysql"
  network = google_compute_network.babysitter_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["3306"]
  }

  source_ranges = ["10.0.0.0/24"]
  target_tags   = ["mysql"]
}

resource "google_compute_firewall" "allow_http_https" {
  name    = "${var.app_name}-allow-http-https"
  network = google_compute_network.babysitter_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "8080"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["web"]
}