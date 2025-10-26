const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import custom services
const IPFSService = require('./services/IPFSService');
const QuantumCrypto = require('../blockchain/utils/QuantumCrypto');
const ZKPValidator = require('../blockchain/utils/ZKPValidator');

const app = express();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// In-memory storage for patent hashes (in production, use a database)
const existingPatentHashes = new Set();
const patentRegistry = new Map();

// ============================================================================
// QUANTUM-RESISTANT KEY MANAGEMENT
// ============================================================================

/**
 * POST /api/quantum/generate-keypair
 * Generates a quantum-resistant key pair
 */
app.post('/api/quantum/generate-keypair', async (req, res) => {
    try {
        const { identifier } = req.body;
        
        if (!identifier) {
            return res.status(400).json({ error: 'Identifier is required' });
        }
        
        const keyPair = await QuantumCrypto.generateKeyPair(identifier);
        
        res.json({
            success: true,
            publicKey: keyPair.publicKey,
            algorithm: keyPair.algorithm,
            keySize: keyPair.keySize,
            message: 'Quantum-resistant key pair generated successfully',
        });
    } catch (error) {
        console.error('Error generating key pair:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/quantum/sign
 * Signs a message using quantum-resistant cryptography
 */
app.post('/api/quantum/sign', async (req, res) => {
    try {
        const { identifier, message } = req.body;
        
        if (!identifier || !message) {
            return res.status(400).json({ error: 'Identifier and message are required' });
        }
        
        const signatureData = await QuantumCrypto.signMessage(identifier, message);
        
        res.json({
            success: true,
            signature: signatureData.signature,
            publicKey: signatureData.publicKey,
            algorithm: signatureData.algorithm,
        });
    } catch (error) {
        console.error('Error signing message:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/quantum/verify
 * Verifies a quantum-resistant signature
 */
app.post('/api/quantum/verify', async (req, res) => {
    try {
        const { publicKey, message, signature, algorithm } = req.body;
        
        if (!publicKey || !message || !signature) {
            return res.status(400).json({ error: 'Public key, message, and signature are required' });
        }
        
        const isValid = await QuantumCrypto.verifySignature(publicKey, message, signature, algorithm);
        
        res.json({
            success: true,
            valid: isValid,
            message: isValid ? 'Signature is valid' : 'Signature is invalid',
        });
    } catch (error) {
        console.error('Error verifying signature:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// IPFS PATENT DOCUMENT MANAGEMENT
// ============================================================================

/**
 * POST /api/ipfs/upload-patent
 * Uploads a patent document to IPFS with encryption
 */
app.post('/api/ipfs/upload-patent', upload.single('file'), async (req, res) => {
    try {
        const { encrypt, password } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const shouldEncrypt = encrypt === 'true' || encrypt === true;
        const result = await IPFSService.uploadFile(req.file.path, shouldEncrypt, password);
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({
            success: true,
            ipfsHash: result.ipfsHash,
            cid: result.cid,
            size: result.size,
            encryptionKey: result.encryptionKey,
            encrypted: result.encrypted,
            url: result.url,
        });
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/ipfs/upload-metadata
 * Uploads patent metadata to IPFS
 */
app.post('/api/ipfs/upload-metadata', async (req, res) => {
    try {
        const { metadata, encrypt } = req.body;
        
        if (!metadata) {
            return res.status(400).json({ error: 'Metadata is required' });
        }
        
        const shouldEncrypt = encrypt === true;
        const result = await IPFSService.uploadPatentMetadata(metadata, shouldEncrypt);
        
        res.json({
            success: true,
            ipfsHash: result.ipfsHash,
            cid: result.cid,
            encryptionKey: result.encryptionKey,
            encrypted: result.encrypted,
        });
    } catch (error) {
        console.error('Error uploading metadata:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/ipfs/download/:hash
 * Downloads and decrypts data from IPFS
 */
app.get('/api/ipfs/download/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        const { password } = req.query;
        
        const data = await IPFSService.downloadData(hash, password);
        
        res.json({
            success: true,
            data: data.toString('base64'),
        });
    } catch (error) {
        console.error('Error downloading from IPFS:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/ipfs/stats/:hash
 * Gets file statistics from IPFS
 */
app.get('/api/ipfs/stats/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        const stats = await IPFSService.getFileStats(hash);
        
        res.json({
            success: true,
            stats,
        });
    } catch (error) {
        console.error('Error getting file stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// ZERO-KNOWLEDGE PROOF VALIDATION
// ============================================================================

/**
 * POST /api/zkp/prove-originality
 * Generates a zero-knowledge proof of patent originality
 */
app.post('/api/zkp/prove-originality', async (req, res) => {
    try {
        const { patentHash } = req.body;
        
        if (!patentHash) {
            return res.status(400).json({ error: 'Patent hash is required' });
        }
        
        // Check against existing patents
        const existingHashes = Array.from(existingPatentHashes);
        const proof = ZKPValidator.proveOriginality(patentHash, existingHashes);
        
        // Add to registry if original
        if (proof.isOriginal) {
            existingPatentHashes.add(patentHash);
        }
        
        res.json({
            success: true,
            proof,
            isOriginal: proof.isOriginal,
        });
    } catch (error) {
        console.error('Error proving originality:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/zkp/verify-originality
 * Verifies a zero-knowledge proof of originality
 */
app.post('/api/zkp/verify-originality', async (req, res) => {
    try {
        const { proof } = req.body;
        
        if (!proof) {
            return res.status(400).json({ error: 'Proof is required' });
        }
        
        const existingHashes = Array.from(existingPatentHashes);
        const isValid = ZKPValidator.verifyOriginalityProof(proof, existingHashes);
        
        res.json({
            success: true,
            valid: isValid,
        });
    } catch (error) {
        console.error('Error verifying originality:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/zkp/generate-commitment
 * Generates a cryptographic commitment for patent data
 */
app.post('/api/zkp/generate-commitment', async (req, res) => {
    try {
        const { patentData } = req.body;
        
        if (!patentData) {
            return res.status(400).json({ error: 'Patent data is required' });
        }
        
        const commitment = ZKPValidator.generateCommitment(patentData);
        
        res.json({
            success: true,
            commitment: commitment.commitment,
            randomness: commitment.randomness,
            timestamp: commitment.timestamp,
        });
    } catch (error) {
        console.error('Error generating commitment:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/zkp/verify-commitment
 * Verifies a cryptographic commitment
 */
app.post('/api/zkp/verify-commitment', async (req, res) => {
    try {
        const { patentData, commitment, randomness } = req.body;
        
        if (!patentData || !commitment || !randomness) {
            return res.status(400).json({ error: 'Patent data, commitment, and randomness are required' });
        }
        
        const isValid = ZKPValidator.verifyCommitment(patentData, commitment, randomness);
        
        res.json({
            success: true,
            valid: isValid,
        });
    } catch (error) {
        console.error('Error verifying commitment:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/zkp/create-merkle-tree
 * Creates a Merkle tree for selective disclosure
 */
app.post('/api/zkp/create-merkle-tree', async (req, res) => {
    try {
        const { fields } = req.body;
        
        if (!fields || !Array.isArray(fields)) {
            return res.status(400).json({ error: 'Fields array is required' });
        }
        
        const merkleData = ZKPValidator.createMerkleTree(fields);
        
        res.json({
            success: true,
            root: merkleData.root,
            leaves: merkleData.leaves,
        });
    } catch (error) {
        console.error('Error creating Merkle tree:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// PATENT REGISTRY ENDPOINTS
// ============================================================================

/**
 * POST /api/patent/register
 * Registers a new patent with all security features
 */
app.post('/api/patent/register', async (req, res) => {
    try {
        const { 
            title, 
            description, 
            inventor, 
            ipfsHash, 
            encryptionKey, 
            quantumSignature,
            patentData 
        } = req.body;
        
        if (!title || !description || !ipfsHash) {
            return res.status(400).json({ error: 'Title, description, and IPFS hash are required' });
        }
        
        // Generate patent hash
        const patentHash = IPFSService.generateContentHash(JSON.stringify(patentData || { title, description, inventor }));
        
        // Prove originality
        const existingHashes = Array.from(existingPatentHashes);
        const originalityProof = ZKPValidator.proveOriginality(patentHash, existingHashes);
        
        if (!originalityProof.isOriginal) {
            return res.status(400).json({ error: 'Patent is not original' });
        }
        
        // Generate commitment
        const commitment = ZKPValidator.generateCommitment(patentData || { title, description, inventor });
        
        // Store patent
        const patentId = Date.now().toString();
        patentRegistry.set(patentId, {
            id: patentId,
            title,
            description,
            inventor,
            ipfsHash,
            patentHash,
            commitment: commitment.commitment,
            originalityProof,
            quantumSignature,
            timestamp: Date.now(),
            status: 'filed',
        });
        
        existingPatentHashes.add(patentHash);
        
        res.json({
            success: true,
            patentId,
            patentHash,
            commitment: commitment.commitment,
            originalityProof,
            message: 'Patent registered successfully',
        });
    } catch (error) {
        console.error('Error registering patent:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/patent/:id
 * Retrieves patent information
 */
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

/**
 * GET /api/patents
 * Lists all patents
 */
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

// ============================================================================
// HEALTH CHECK & SYSTEM INFO
// ============================================================================

app.get('/', (req, res) => {
    res.json({
        service: 'Quantum-Resistant Patent Registry Backend',
        version: '1.0.0',
        status: 'running',
        features: [
            'Quantum-resistant cryptography (CRYSTALS-Dilithium)',
            'IPFS document storage with encryption',
            'Zero-knowledge proof validation',
            'Patent lifecycle management',
            'Cross-chain compatibility',
        ],
        endpoints: {
            quantum: '/api/quantum/*',
            ipfs: '/api/ipfs/*',
            zkp: '/api/zkp/*',
            patents: '/api/patent/*',
        },
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✅ Quantum-Resistant Patent Registry Backend running on port ${PORT}`);
    console.log(`📡 IPFS: ${process.env.IPFS_API_URL || 'Local'}`);
    console.log(`🔐 Quantum Algorithm: ${process.env.QUANTUM_ALGORITHM || 'CRYSTALS-Dilithium'}`);
    console.log(`🌐 API Documentation: http://localhost:${PORT}/`);
});
