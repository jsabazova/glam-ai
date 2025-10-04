#!/bin/bash

# 🚀 GlamAI MVP Deployment Script
# Automates deployment preparation and testing

set -e  # Exit on any error

echo "🎨 GlamAI MVP Deployment Helper"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "DEPLOYMENT_GUIDE.md" ]; then
    log_error "Please run this script from the GlamAI root directory"
    exit 1
fi

echo
echo "What would you like to do?"
echo "1) 🔧 Setup environment files for local development"
echo "2) 🏗️  Prepare for production deployment"
echo "3) 🧪 Test local setup"
echo "4) 📦 Build for production"
echo "5) 🩺 Run deployment health checks"
echo "6) 🔐 Verify environment security"
echo
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo
        log_info "Setting up environment files for local development..."

        # Create backend .env if it doesn't exist
        if [ ! -f "backend/.env" ]; then
            log_info "Creating backend/.env from template..."
            if [ -f ".env.example" ]; then
                cp .env.example backend/.env
                log_warning "Please edit backend/.env and add your CLAUDE_API_KEY"
            else
                cat > backend/.env << 'EOF'
# GlamAI Backend Environment Configuration
CLAUDE_API_KEY=sk-ant-api03-your-claude-api-key-here

# Development settings
DEBUG=True
LOG_LEVEL=DEBUG
EOF
                log_warning "Created backend/.env - please add your CLAUDE_API_KEY"
            fi
        else
            log_success "backend/.env already exists"
        fi

        # Create frontend development environment
        if [ ! -f "frontend/.env.development" ]; then
            log_info "Creating frontend/.env.development..."
            cat > frontend/.env.development << 'EOF'
# GlamAI Frontend Development Environment
VITE_API_URL=http://localhost:8000
VITE_NODE_ENV=development
EOF
            log_success "Created frontend/.env.development"
        else
            log_success "frontend/.env.development already exists"
        fi

        # Create directories
        mkdir -p backend/uploads
        log_success "Created backend/uploads directory"

        log_success "Environment setup complete!"
        log_warning "Remember to add your CLAUDE_API_KEY to backend/.env"
        ;;

    2)
        echo
        log_info "Preparing for production deployment..."

        # Read backend URL from user
        echo
        read -p "Enter your Render backend URL (e.g., https://glamai-backend.onrender.com): " backend_url

        if [ -z "$backend_url" ]; then
            log_error "Backend URL is required"
            exit 1
        fi

        # Create frontend production environment
        log_info "Creating frontend/.env.production..."
        cat > frontend/.env.production << EOF
# GlamAI Frontend Production Environment
VITE_API_URL=${backend_url}
VITE_NODE_ENV=production
EOF
        log_success "Created frontend/.env.production with backend URL: $backend_url"

        # Check .gitignore
        if ! grep -q ".env" .gitignore 2>/dev/null; then
            log_warning "Adding .env files to .gitignore..."
            echo "" >> .gitignore
            echo "# Environment files" >> .gitignore
            echo ".env" >> .gitignore
            echo ".env.*" >> .gitignore
            echo "backend/.env" >> .gitignore
            echo "frontend/.env*" >> .gitignore
        fi

        log_success "Production deployment preparation complete!"
        echo
        log_info "Next steps:"
        echo "1. Deploy backend to Render.com with environment variables"
        echo "2. Deploy frontend to Netlify with VITE_API_URL=$backend_url"
        echo "3. Update backend CORS settings with your Netlify URL"
        ;;

    3)
        echo
        log_info "Testing local setup..."

        # Check if backend dependencies are installed
        if [ ! -d "backend/venv" ] && [ ! -f "backend/.venv/pyvenv.cfg" ]; then
            log_warning "Python virtual environment not found. Creating one..."
            cd backend
            python3 -m venv venv
            source venv/bin/activate
            pip install -r requirements.txt
            cd ..
            log_success "Python environment created and dependencies installed"
        fi

        # Check if frontend dependencies are installed
        if [ ! -d "frontend/node_modules" ]; then
            log_warning "Frontend dependencies not found. Installing..."
            cd frontend
            npm install
            cd ..
            log_success "Frontend dependencies installed"
        fi

        # Test backend environment
        log_info "Testing backend environment..."
        cd backend
        if [ -f ".env" ]; then
            if grep -q "CLAUDE_API_KEY=sk-ant-api03-" .env; then
                log_success "Backend environment file looks good"
            else
                log_error "CLAUDE_API_KEY not properly set in backend/.env"
                exit 1
            fi
        else
            log_error "backend/.env not found. Run option 1 first."
            exit 1
        fi
        cd ..

        # Test frontend environment
        log_info "Testing frontend environment..."
        if [ -f "frontend/.env.development" ]; then
            log_success "Frontend development environment file exists"
        else
            log_error "frontend/.env.development not found. Run option 1 first."
            exit 1
        fi

        log_success "Local setup test complete!"
        echo
        log_info "To start the application:"
        echo "1. Terminal 1: cd backend && source venv/bin/activate && python main.py"
        echo "2. Terminal 2: cd frontend && npm run dev"
        ;;

    4)
        echo
        log_info "Building for production..."

        # Build frontend
        if [ ! -f "frontend/.env.production" ]; then
            log_error "frontend/.env.production not found. Run option 2 first."
            exit 1
        fi

        cd frontend
        log_info "Installing frontend dependencies..."
        npm install

        log_info "Building frontend for production..."
        npm run build

        if [ $? -eq 0 ]; then
            log_success "Frontend build successful!"
            log_info "Build output in frontend/dist/"

            # Check build size
            if [ -d "dist" ]; then
                size=$(du -sh dist | cut -f1)
                log_info "Build size: $size"
            fi
        else
            log_error "Frontend build failed!"
            exit 1
        fi
        cd ..

        log_success "Production build complete!"
        ;;

    5)
        echo
        log_info "Running deployment health checks..."

        # Check if required files exist
        checks_passed=0
        total_checks=8

        log_info "Checking deployment files..."

        if [ -f "DEPLOYMENT_GUIDE.md" ]; then
            log_success "Deployment guide exists"
            ((checks_passed++))
        else
            log_error "DEPLOYMENT_GUIDE.md missing"
        fi

        if [ -f "backend/render.yaml" ]; then
            log_success "Render configuration exists"
            ((checks_passed++))
        else
            log_error "backend/render.yaml missing"
        fi

        if [ -f "frontend/netlify.toml" ]; then
            log_success "Netlify configuration exists"
            ((checks_passed++))
        else
            log_error "frontend/netlify.toml missing"
        fi

        if [ -f ".gitignore" ] && grep -q ".env" .gitignore; then
            log_success ".gitignore properly configured"
            ((checks_passed++))
        else
            log_error ".gitignore missing or doesn't exclude .env files"
        fi

        if [ -f "backend/requirements.txt" ]; then
            log_success "Backend dependencies defined"
            ((checks_passed++))
        else
            log_error "backend/requirements.txt missing"
        fi

        if [ -f "frontend/package.json" ]; then
            log_success "Frontend dependencies defined"
            ((checks_passed++))
        else
            log_error "frontend/package.json missing"
        fi

        # Check backend structure
        if [ -f "backend/main.py" ] && [ -f "backend/face_analyzer.py" ] && [ -f "backend/claude_client.py" ]; then
            log_success "Backend code structure complete"
            ((checks_passed++))
        else
            log_error "Backend code files missing"
        fi

        # Check frontend structure
        if [ -f "frontend/src/App.jsx" ] && [ -d "frontend/src/components" ] && [ -f "frontend/src/services/api.js" ]; then
            log_success "Frontend code structure complete"
            ((checks_passed++))
        else
            log_error "Frontend code files missing"
        fi

        echo
        log_info "Health check results: $checks_passed/$total_checks checks passed"

        if [ $checks_passed -eq $total_checks ]; then
            log_success "All health checks passed! Ready for deployment 🚀"
        else
            log_warning "Some health checks failed. Please review the issues above."
        fi
        ;;

    6)
        echo
        log_info "Verifying environment security..."

        security_issues=0

        # Check for API keys in source code
        log_info "Scanning for hardcoded API keys..."
        if grep -r "sk-ant-api03-" backend/ frontend/ --exclude-dir=node_modules --exclude-dir=venv --exclude="*.env*" 2>/dev/null; then
            log_error "Found hardcoded API keys in source code!"
            ((security_issues++))
        else
            log_success "No hardcoded API keys found in source code"
        fi

        # Check .gitignore
        if [ -f ".gitignore" ]; then
            if grep -q ".env" .gitignore && grep -q "backend/.env" .gitignore; then
                log_success ".gitignore properly excludes environment files"
            else
                log_error ".gitignore doesn't exclude all environment files"
                ((security_issues++))
            fi
        else
            log_error ".gitignore file missing"
            ((security_issues++))
        fi

        # Check if .env files exist in git
        if git ls-files | grep -E "\.env$|\.env\." > /dev/null 2>&1; then
            log_error "Environment files are tracked by git!"
            log_warning "Run: git rm --cached backend/.env frontend/.env*"
            ((security_issues++))
        else
            log_success "No environment files tracked by git"
        fi

        # Check environment file permissions
        for env_file in backend/.env frontend/.env.development frontend/.env.production; do
            if [ -f "$env_file" ]; then
                perms=$(stat -f "%A" "$env_file" 2>/dev/null || stat -c "%a" "$env_file" 2>/dev/null)
                if [ "$perms" = "600" ] || [ "$perms" = "644" ]; then
                    log_success "$env_file has appropriate permissions"
                else
                    log_warning "$env_file has permissions $perms (consider 600 for better security)"
                fi
            fi
        done

        echo
        if [ $security_issues -eq 0 ]; then
            log_success "Security verification passed! 🔐"
        else
            log_error "Found $security_issues security issues. Please fix them before deployment."
        fi
        ;;

    *)
        log_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo
log_info "For more detailed instructions, see:"
log_info "📋 DEPLOYMENT_GUIDE.md - Complete deployment walkthrough"
log_info "🔐 ENV_SETUP.md - Environment variable management"
log_info "📖 README.md - Project overview and setup"

echo
log_success "Done! 🎉"