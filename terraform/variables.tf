# ============================================================================
# VARIABLES FOR BABYSITTER RENTAL SYSTEM TERRAFORM CONFIGURATION
# ============================================================================

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "app_name" {
  description = "Name of the application (used for resource naming)"
  type        = string
  default     = "babysitter-app"
}

# ============================================================================
# DATABASE VARIABLES
# ============================================================================

variable "database_name" {
  description = "Name of the MySQL database"
  type        = string
  default     = "BabysitterApp"
}

variable "database_user" {
  description = "MySQL database username"
  type        = string
  default     = "babysitter_user"
}

variable "database_password" {
  description = "MySQL database password"
  type        = string
  sensitive   = true
}

variable "db_tier" {
  description = "The machine type for the Cloud SQL instance"
  type        = string
  default     = "db-f1-micro"
}

# ============================================================================
# SECURITY VARIABLES
# ============================================================================

variable "jwt_secret_key" {
  description = "JWT secret key for authentication"
  type        = string
  sensitive   = true
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for Cloud SQL instance"
  type        = bool
  default     = false
}

# ============================================================================
# CLOUD RUN VARIABLES
# ============================================================================

variable "backend_cpu" {
  description = "CPU allocation for backend Cloud Run service"
  type        = string
  default     = "1000m"
}

variable "backend_memory" {
  description = "Memory allocation for backend Cloud Run service"
  type        = string
  default     = "512Mi"
}

variable "frontend_cpu" {
  description = "CPU allocation for frontend Cloud Run service"
  type        = string
  default     = "1000m"
}

variable "frontend_memory" {
  description = "Memory allocation for frontend Cloud Run service"
  type        = string
  default     = "512Mi"
}

variable "min_instances" {
  description = "Minimum number of Cloud Run instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of Cloud Run instances"
  type        = number
  default     = 10
}

# ============================================================================
# DOCKER IMAGE VARIABLES
# ============================================================================

variable "backend_image_tag" {
  description = "Tag for the backend Docker image"
  type        = string
  default     = "latest"
}

variable "frontend_image_tag" {
  description = "Tag for the frontend Docker image"
  type        = string
  default     = "latest"
}

# ============================================================================
# CLOUD RUN VARIABLES
# ============================================================================

variable "backend_cpu" {
  description = "CPU allocation for backend Cloud Run service"
  type        = string
  default     = "1000m"
}

variable "backend_memory" {
  description = "Memory allocation for backend Cloud Run service"
  type        = string
  default     = "512Mi"
}

variable "frontend_cpu" {
  description = "CPU allocation for frontend Cloud Run service"
  type        = string
  default     = "1000m"
}

variable "frontend_memory" {
  description = "Memory allocation for frontend Cloud Run service"
  type        = string
  default     = "512Mi"
}

variable "min_instances" {
  description = "Minimum number of Cloud Run instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of Cloud Run instances"
  type        = number
  default     = 10
}

# ============================================================================
# NETWORKING VARIABLES
# ============================================================================

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/24"
}

variable "connector_cidr" {
  description = "CIDR block for VPC connector"
  type        = string
  default     = "10.8.0.0/28"
}

# ============================================================================
# SECURITY VARIABLES
# ============================================================================

variable "allowed_ips" {
  description = "List of IP addresses allowed to access the database"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for Cloud SQL instance"
  type        = bool
  default     = false
}

# ============================================================================
# DOCKER IMAGE VARIABLES
# ============================================================================

variable "backend_image_tag" {
  description = "Tag for the backend Docker image"
  type        = string
  default     = "latest"
}

variable "frontend_image_tag" {
  description = "Tag for the frontend Docker image"
  type        = string
  default     = "latest"
}

# ============================================================================
# BACKUP AND MAINTENANCE VARIABLES
# ============================================================================

variable "backup_start_time" {
  description = "Start time for automated backups (HH:MM format)"
  type        = string
  default     = "03:00"
}

variable "backup_retention_days" {
  description = "Number of days to retain automated backups"
  type        = number
  default     = 7
  
  validation {
    condition     = var.backup_retention_days >= 1 && var.backup_retention_days <= 365
    error_message = "Backup retention days must be between 1 and 365."
  }
}

# ============================================================================
# COST OPTIMIZATION VARIABLES
# ============================================================================

variable "enable_autoscaling" {
  description = "Enable autoscaling for Cloud Run services"
  type        = bool
  default     = true
}

variable "enable_preemptible" {
  description = "Use preemptible instances where possible for cost savings"
  type        = bool
  default     = false
}