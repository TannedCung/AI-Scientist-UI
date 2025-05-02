#!/bin/bash

# Script to build and deploy the AI Scientist Paper Generator

set -e  # Exit on error

# Display help information
show_help() {
  echo "Usage: $0 [OPTIONS]"
  echo "Build and deploy the AI Scientist Paper Generator"
  echo ""
  echo "Options:"
  echo "  -h, --help       Show this help message"
  echo "  -b, --build      Build the Docker images"
  echo "  -d, --deploy     Deploy the application (run the containers)"
  echo "  -s, --stop       Stop the running application"
  echo "  -r, --restart    Restart the application"
  echo "  -c, --clean      Remove all containers and images"
  echo ""
  echo "Examples:"
  echo "  $0 --build --deploy  # Build and deploy the application"
  echo "  $0 --stop           # Stop the application"
}

# Check if Docker is installed
check_docker() {
  if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
  fi

  if ! command -v docker compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
  fi
}

# Build Docker images
build_images() {
  echo "Building Docker images..."
  docker compose build
  echo "Docker images built successfully!"
}

# Deploy application
deploy_app() {
  echo "Deploying application..."
  docker compose up -d
  echo "Application deployed successfully!"
  echo "Frontend: http://localhost:3000"
  echo "Backend API: http://localhost:8000/api"
  echo "API Documentation: http://localhost:8000/api/docs"
}

# Stop application
stop_app() {
  echo "Stopping application..."
  docker compose down
  echo "Application stopped successfully!"
}

# Restart application
restart_app() {
  echo "Restarting application..."
  docker compose restart
  echo "Application restarted successfully!"
}

# Clean up
clean_up() {
  echo "Cleaning up..."
  docker compose down --rmi all --volumes --remove-orphans
  echo "Cleanup completed successfully!"
}

# Main execution
main() {
  check_docker

  # Parse command line arguments
  if [ $# -eq 0 ]; then
    show_help
    exit 0
  fi

  while [ $# -gt 0 ]; do
    case "$1" in
      -h|--help)
        show_help
        exit 0
        ;;
      -b|--build)
        build_images
        ;;
      -d|--deploy)
        deploy_app
        ;;
      -s|--stop)
        stop_app
        ;;
      -r|--restart)
        restart_app
        ;;
      -c|--clean)
        clean_up
        ;;
      *)
        echo "Unknown option: $1"
        show_help
        exit 1
        ;;
    esac
    shift
  done
}

main "$@" 