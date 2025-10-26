# Deployment Guide - Quantum-Resistant Patent Registry

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Development Environment Setup](#development-environment-setup)
3. [Testnet Deployment](#testnet-deployment)
4. [Production Deployment](#production-deployment)
5. [Testing & Validation](#testing--validation)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **OS**: Windows, macOS, or Linux
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 20GB available space

### Required Software
```bash
# Verify installations
node --version  # Should be v18+
npm --version   # Should be v9+
```

### Required Accounts
- QANplatform testnet account with test tokens
- IPFS service (local daemon or Infura/Pinata)
- MetaMask wallet configured for QAN testnet

---

## Development Environment Setup

### Step 1: Install Dependencies

```bash
# Navigate to project root
cd PatentRegiteryRPI

# Install blockchain dependencies
cd blockchain
npm install

# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables

**Create `blockchain/.env`:**
```env
# QAN Network Configuration
QAN_RPC_URL=https://testnet.qanx.link
QAN_MAINNET_RPC_URL=https://qanx.link
PRIVATE_KEY=your_private_key_without_0x_prefix

# IPFS Configuration
IPFS_API_URL=/ip4/127.0.0.1/tcp/5001
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/

# Quantum Cryptography
QUANTUM_ALGORITHM=CRYSTALS-Dilithium
QUANTUM_KEY_SIZE=2048
QUANTUM_SIGNATURE_SCHEME=Dilithium5

# Network Settings
CHAIN_ID=35442
GAS_PRICE=auto
GAS_LIMIT=10000000
```

**Create `backend/.env`:**
```env
# Server Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# IPFS Configuration
IPFS_API_URL=/ip4/127.0.0.1/tcp/5001
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/

# Quantum Cryptography
QUANTUM_ALGORITHM=CRYSTALS-Dilithium
QUANTUM_KEY_SIZE=2048

# Security
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# Logging
LOG_LEVEL=debug
ENABLE_DEBUG_LOGS=true
```

**Create `frontend/.env`:**
```env
REACT_APP_BACKEND_URL=http://localhost:4000
REACT_APP_BLOCKCHAIN_RPC=https://testnet.qanx.link
REACT_APP_CHAIN_ID=35442
REACT_APP_NETWORK_NAME=QAN Testnet
```

### Step 3: Start IPFS

**Option A: Local IPFS Daemon**
```bash
# Install IPFS
# Download from https://ipfs.io/
ipfs init
ipfs daemon
```

**Option B: Use Infura IPFS**
```env
IPFS_API_URL=https://ipfs.infura.io:5001/api/v0
```

### Step 4: Start Local Development

**Terminal 1 - Start Hardhat Node:**
```bash
cd blockchain
npx hardhat node
```

**Terminal 2 - Start Backend:**
```bash
cd backend
node index.js
```

**Terminal 3 - Start Frontend:**
```bash
cd frontend
npm start
```

**Access Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/

---

## Testnet Deployment

### Step 1: Prepare Smart Contracts

```bash
cd blockchain

# Compile contracts
npx hardhat compile

# Check contract size
npx hardhat size-contracts
```

### Step 2: Get QAN Testnet Tokens

1. Visit QAN testnet faucet: https://faucet.qanplatform.com
2. Enter your wallet address
3. Request test tokens
4. Verify balance:
```bash
npx hardhat run scripts/check-balance.js --network qanTestnet
```

### Step 3: Deploy to QAN Testnet

```bash
# Deploy QuantumPatentRegistry contract
npx hardhat run scripts/deploy.js --network qanTestnet

# Save the deployed contract address
# It will be displayed in the console
```

### Step 4: Verify Contract

```bash
# Verify on QAN explorer (if available)
npx hardhat verify --network qanTestnet DEPLOYED_CONTRACT_ADDRESS
```

### Step 5: Update Frontend Configuration

Update `frontend/src/config.js` with deployed contract address:
```javascript
export const CONTRACT_ADDRESS = "0x..."; // Your deployed address
export const NETWORK_ID = 35442; // QAN testnet
```

### Step 6: Deploy Backend to Cloud

**Option A: Deploy to Heroku**
```bash
cd backend

# Create Procfile
echo "web: node index.js" > Procfile

# Deploy
heroku create patent-registry-backend
heroku config:set NODE_ENV=production
heroku config:set PORT=4000
git push heroku main
```

**Option B: Deploy to AWS EC2**
```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Clone repository
git clone https://github.com/yourusername/patent-registry.git
cd patent-registry/backend

# Install dependencies
npm install --production

# Install PM2
npm install -g pm2

# Start backend
pm2 start index.js --name patent-backend
pm2 save
pm2 startup
```

### Step 7: Deploy Frontend

**Option A: Deploy to Vercel**
```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Option B: Deploy to Netlify**
```bash
cd frontend

# Build production
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=build
```

---

## Production Deployment

### Step 1: Security Audit

```bash
# Run security audit
cd blockchain
npm audit

cd ../backend
npm audit

cd ../frontend
npm audit

# Fix vulnerabilities
npm audit fix
```

### Step 2: Configure Production Environment

**Production `blockchain/.env`:**
```env
QAN_RPC_URL=https://qanx.link
PRIVATE_KEY=production_private_key
NODE_ENV=production
GAS_PRICE=auto
```

**Production `backend/.env`:**
```env
PORT=443
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
IPFS_API_URL=https://ipfs.infura.io:5001/api/v0
QUANTUM_ALGORITHM=CRYSTALS-Dilithium
JWT_SECRET=strong_random_secret
ENABLE_DEBUG_LOGS=false
```

### Step 3: Deploy Smart Contracts to Mainnet

```bash
cd blockchain

# IMPORTANT: Double-check all configurations
# Deploy to mainnet
npx hardhat run scripts/deploy.js --network qanMainnet

# Save contract address
echo "PRODUCTION_CONTRACT=0x..." >> ../.env.production
```

### Step 4: Configure SSL/TLS

```bash
# Install certbot for SSL
sudo apt-get install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com
```

### Step 5: Set Up Production Server

**Using Docker:**

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./backend:/app
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./frontend/build:/usr/share/nginx/html
    restart: always

  ipfs:
    image: ipfs/go-ipfs:latest
    ports:
      - "4001:4001"
      - "5001:5001"
      - "8080:8080"
    volumes:
      - ipfs-data:/data/ipfs
    restart: always

volumes:
  ipfs-data:
```

Deploy:
```bash
docker-compose up -d
```

### Step 6: Configure Monitoring

**Install monitoring tools:**
```bash
# Install PM2 for process monitoring
npm install -g pm2

# Start with PM2
pm2 start backend/index.js --name patent-backend
pm2 startup
pm2 save

# Monitor
pm2 monit
```

**Set up logging:**
```bash
# Install Winston for logging
cd backend
npm install winston

# Configure log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### Step 7: Database Backup Strategy

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/patent-registry"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup contract state
mkdir -p $BACKUP_DIR/$DATE

# Export patent registry data
curl http://localhost:4000/api/patents > $BACKUP_DIR/$DATE/patents.json

# Compress
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/$DATE
rm -rf $BACKUP_DIR/$DATE

# Keep only last 30 backups
ls -t $BACKUP_DIR/backup_*.tar.gz | tail -n +31 | xargs rm -f
EOF

chmod +x backup.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

---

## Testing & Validation

### Unit Tests

```bash
# Test smart contracts
cd blockchain
npx hardhat test

# Test with coverage
npx hardhat coverage

# Test backend
cd ../backend
npm test

# Test frontend
cd ../frontend
npm test
```

### Integration Tests

```bash
# Run end-to-end tests
cd frontend
npm run test:e2e
```

### Performance Testing

```bash
# Load testing with artillery
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:4000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
    - post:
        url: "/api/patent/register"
        json:
          title: "Test Patent"
          description: "Description"
EOF

# Run load test
artillery run load-test.yml
```

### Security Testing

```bash
# Install security testing tools
npm install -g snyk

# Run security scan
cd blockchain
snyk test

cd ../backend
snyk test
```

---

## Troubleshooting

### Common Issues

#### 1. Contract Deployment Fails
```bash
# Check gas price
npx hardhat run scripts/check-gas.js --network qanTestnet

# Increase gas limit in hardhat.config.js
gas: 10000000
```

#### 2. IPFS Connection Error
```bash
# Check IPFS daemon status
ipfs id

# Restart IPFS
ipfs shutdown
ipfs daemon
```

#### 3. MetaMask Connection Issues
- Clear MetaMask cache
- Reset account
- Check network configuration
- Verify chain ID matches

#### 4. Backend API Errors
```bash
# Check logs
pm2 logs patent-backend

# Restart backend
pm2 restart patent-backend

# Check environment variables
pm2 env patent-backend
```

### Performance Optimization

**1. Enable Caching:**
```javascript
// In backend/index.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 });
```

**2. Optimize IPFS:**
```bash
# Increase connection limits
ipfs config --json Swarm.ConnMgr.HighWater 900
ipfs config --json Swarm.ConnMgr.LowWater 600
```

**3. Database Indexing:**
- Add indexes for frequently queried fields
- Use connection pooling
- Implement query caching

### Monitoring & Alerts

**Set up alerts:**
```bash
# Install PM2 notification system
pm2 install pm2-slack
pm2 set pm2-slack:slack_url https://hooks.slack.com/services/YOUR/WEBHOOK
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Check system health
- Review error logs
- Monitor gas prices

**Weekly:**
- Update dependencies
- Review security alerts
- Backup data

**Monthly:**
- Security audit
- Performance review
- Update documentation

### Upgrade Procedure

```bash
# 1. Backup current state
./backup.sh

# 2. Deploy new contract version
cd blockchain
npx hardhat run scripts/upgrade.js --network qanMainnet

# 3. Update backend
cd ../backend
git pull
npm install
pm2 restart patent-backend

# 4. Update frontend
cd ../frontend
git pull
npm install
npm run build
```

---

## Support Contacts

- **Technical Support**: support@patentregistry.com
- **Security Issues**: security@patentregistry.com
- **Documentation**: https://docs.patentregistry.com
- **Discord**: https://discord.gg/patentregistry

---

**Last Updated**: 2025-10-22
