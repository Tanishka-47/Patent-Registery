# Quick Start Guide

## Prerequisites
- Node.js v18+ installed
- npm installed

## Step-by-Step Instructions

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Start Backend Server
Open a terminal and run:
```bash
cd backend
node index-simple.js
```

You should see:
```
✅ Patent Registry Backend running on port 4000
🌐 API Documentation: http://localhost:4000/
📊 Health Check: http://localhost:4000/health
```

### 4. Start Frontend Application
Open a NEW terminal and run:
```bash
cd frontend
npm start
```

The browser will automatically open at http://localhost:3000

## Verification

1. Backend health check: http://localhost:4000/health
2. Frontend: http://localhost:3000

## Troubleshooting

### Port Already in Use
If port 4000 or 3000 is already in use:

**For Backend:**
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Change port in backend/index-simple.js
const PORT = process.env.PORT || 5000;
```

**For Frontend:**
Create `.env` file in frontend folder:
```
PORT=3001
```

### Missing Dependencies
```bash
# Backend
cd backend
npm install express cors body-parser multer

# Frontend
cd frontend
npm install
```

### Module Not Found Errors
Delete node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

Once running:
1. Connect MetaMask wallet
2. Upload a patent document
3. Register a patent
4. View registered patents

Enjoy using the Patent Registry! 🎉
