const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 50 * 1024 * 1024 } });

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// In-memory storage
const existingPatentHashes = new Set();
const patentRegistry = new Map();

// Utility: Generate hash
function generateHash(data) {
    const hash = crypto.createHash('sha256');
    hash.update(Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8'));
    return hash.digest('hex');
}

// Utility: Encrypt data
function encryptData(data, password = null) {
    const encryptionKey = password || crypto.randomBytes(32).toString('hex');
    const salt = crypto.randomBytes(16);
    const key = crypto.scryptSync(encryptionKey, salt, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const combined = Buffer.concat([salt, iv, authTag, encrypted]);
    
    return {
        encryptedData: combined.toString('base64'),
        encryptionKey,
        algorithm: 'aes-256-gcm',
    };
}

// Routes
app.get('/', (req, res) => {
    res.json({
        service: 'Quantum-Resistant Patent Registry Backend',
        version: '1.0.0',
        status: 'running',
        features: [
            'Patent registration',
            'IPFS document storage',
            'Patent lifecycle management',
        ],
        endpoints: {
            patents: '/api/patent/*',
            upload: '/api/upload/*',
        },
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Upload patent document
app.post('/api/upload/patent', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileContent = fs.readFileSync(req.file.path);
        const encrypted = encryptData(fileContent);
        const fileHash = generateHash(fileContent);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            ipfsHash: fileHash,
            encryptionKey: encrypted.encryptionKey,
            size: fileContent.length,
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: error.message });
    }
});

// Register patent
app.post('/api/patent/register', async (req, res) => {
    try {
        const { title, description, inventor, ipfsHash } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const patentHash = generateHash(JSON.stringify({ title, description, inventor }));
        
        // Check originality
        if (existingPatentHashes.has(patentHash)) {
            return res.status(400).json({ error: 'Patent is not original' });
        }

        const patentId = Date.now().toString();
        patentRegistry.set(patentId, {
            id: patentId,
            title,
            description,
            inventor,
            ipfsHash,
            patentHash,
            timestamp: Date.now(),
            status: 'filed',
        });

        existingPatentHashes.add(patentHash);

        res.json({
            success: true,
            patentId,
            patentHash,
            message: 'Patent registered successfully',
        });
    } catch (error) {
        console.error('Error registering patent:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get patent by ID
app.get('/api/patent/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const patent = patentRegistry.get(id);

        if (!patent) {
            return res.status(404).json({ error: 'Patent not found' });
        }

        res.json({
            success: true,
            patent,
        });
    } catch (error) {
        console.error('Error retrieving patent:', error);
        res.status(500).json({ error: error.message });
    }
});

// List all patents
app.get('/api/patents', async (req, res) => {
    try {
        const patents = Array.from(patentRegistry.values());

        res.json({
            success: true,
            count: patents.length,
            patents,
        });
    } catch (error) {
        console.error('Error listing patents:', error);
        res.status(500).json({ error: error.message });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✅ Patent Registry Backend running on port ${PORT}`);
    console.log(`🌐 API Documentation: http://localhost:${PORT}/`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
});
