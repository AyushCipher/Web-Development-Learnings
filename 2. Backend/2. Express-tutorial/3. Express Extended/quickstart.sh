#!/bin/bash
# Quick Start Script for Express Extended Project

echo "======================================"
echo "Express Extended - Quick Start"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker found: $(docker --version)${NC}"
else
    echo -e "${YELLOW}⚠ Docker not found. Docker Compose setup will not work.${NC}"
fi

echo ""
echo -e "${BLUE}Select startup mode:${NC}"
echo "1) Single Server (npm start on port 3000)"
echo "2) Load Balanced (Docker Compose - 3 servers + NGINX)"
echo "3) Manual Multi-Server (Run 3 instances manually)"
echo ""

read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo -e "${BLUE}Starting single server...${NC}"
        echo "Installing dependencies..."
        npm install
        echo ""
        echo -e "${GREEN}✓ Dependencies installed${NC}"
        echo -e "${YELLOW}Starting server on port 3000...${NC}"
        PORT=3000 npm start
        ;;
    2)
        echo -e "${BLUE}Starting with Docker Compose...${NC}"
        if ! command -v docker-compose &> /dev/null; then
            echo -e "${RED}Docker Compose not found. Please install Docker Desktop.${NC}"
            exit 1
        fi
        echo -e "${YELLOW}Building images...${NC}"
        docker-compose build
        echo -e "${YELLOW}Starting services...${NC}"
        docker-compose up -d
        echo ""
        echo -e "${GREEN}✓ Services started!${NC}"
        echo ""
        echo -e "${BLUE}Access points:${NC}"
        echo "  NGINX Load Balancer: http://localhost"
        echo "  Server 1: http://localhost:3000"
        echo "  Server 2: http://localhost:3001"
        echo "  Server 3: http://localhost:3002"
        echo ""
        echo -e "${YELLOW}View logs:${NC}"
        echo "  docker-compose logs -f"
        echo ""
        echo -e "${YELLOW}Stop services:${NC}"
        echo "  docker-compose down"
        ;;
    3)
        echo -e "${BLUE}Manual multi-server setup${NC}"
        echo "Installing dependencies..."
        npm install
        echo ""
        echo -e "${GREEN}✓ Dependencies installed${NC}"
        echo ""
        echo -e "${YELLOW}Instructions for manual setup:${NC}"
        echo "1. Open Terminal 1:"
        echo "   PORT=3000 npm start"
        echo ""
        echo "2. Open Terminal 2:"
        echo "   PORT=3001 npm start"
        echo ""
        echo "3. Open Terminal 3:"
        echo "   PORT=3002 npm start"
        echo ""
        echo "4. Install and run NGINX:"
        echo "   - Copy nginx/nginx.conf to /etc/nginx/nginx.conf"
        echo "   - Run: sudo nginx"
        echo ""
        echo -e "${BLUE}Access via NGINX: http://localhost${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Review SETUP_GUIDE.md for detailed documentation"
echo "2. Check QUICK_REFERENCE.md for common commands"
echo "3. Read COMPLETE_SETUP_SUMMARY.md for overview"
echo ""
echo -e "${BLUE}Documentation files:${NC}"
echo "  docs/LOAD_BALANCING_NGINX.js - Load balancing guide"
echo "  docs/DATABASE_SHARDING.js - Sharding patterns"
echo "  docs/DATABASE_REPLICATION.js - Replication patterns"
echo "  middleware/rateLimiting.js - Rate limiting examples"
echo "  middleware/apiVersioning.js - API versioning examples"
echo ""
