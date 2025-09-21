# ============================================================================
# TERRAFORM VARIABLES - BABYSITTER RENTAL SYSTEM
# ============================================================================

variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "Google Cloud region"
  type        = string
  default     = "us-central1"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "babysitter-app"
}

variable "database_name" {
  description = "MySQL database name"
  type        = string
  default     = "BabysitterApp"
}

variable "database_user" {
  description = "MySQL database user"
  type        = string
  default     = "babysitter_user"
}

variable "database_password" {
  description = "MySQL database password"
  type        = string
  sensitive   = true
}

variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro"
}

variable "jwt_secret_key" {
  description = "JWT secret key for authentication"
  type        = string
  sensitive   = true
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for database"
  type        = bool
  default     = false
}

variable "backend_cpu" {
  description = "CPU limit for backend service"
  type        = string
  default     = "1000m"
}

variable "backend_memory" {
  description = "Memory limit for backend service"
  type        = string
  default     = "512Mi"
}

variable "frontend_cpu" {
  description = "CPU limit for frontend service"
  type        = string
  default     = "1000m"
}

variable "frontend_memory" {
  description = "Memory limit for frontend service"
  type        = string
  default     = "512Mi"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 10
}

variable "backend_image_tag" {
  description = "Docker image tag for backend"
  type        = string
  default     = "latest"
}

variable "frontend_image_tag" {
  description = "Docker image tag for frontend"
  type        = string
  default     = "latest"
}

variable "backup_start_time" {
  description = "Backup start time (HH:MM format)"
  type        = string
  default     = "03:00"
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/24"
}

variable "connector_cidr" {
  description = "CIDR block for VPC connector"
  type        = string
  default     = "10.8.0.0/28"
}

variable "allowed_ips" {
  description = "Allowed IP addresses for database access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "enable_autoscaling" {
  description = "Enable autoscaling"
  type        = bool
  default     = true
}

variable "enable_preemptible" {
  description = "Enable preemptible instances"
  type        = bool
  default     = false
}