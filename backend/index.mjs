import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import { create } from 'ipfs-http-client';

const app = express();
const upload = multer({ dest: 'uploads/' });
const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });

app.use(cors());
app.use(bodyParser.json());

// Utility: AES-256 encryption
function encryptFile(filePath, encryptionKey) {
    const fileData = fs.readFileSync(filePath);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
    let encrypted = cipher.update(fileData);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return Buffer.concat([iv, encrypted]); // prepend IV for decryption
}

// POST /upload-patent
// Fields: file (multipart), encryptionKey (hex string)
app.post('/upload-patent', upload.single('file'), async (req, res) => {
    try {
        const { encryptionKey } = req.body;
        if (!encryptionKey || encryptionKey.length !== 64) {
            return res.status(400).json({ error: 'Invalid encryption key (must be 32 bytes hex)' });
        }
        const encryptedFile = encryptFile(req.file.path, encryptionKey);
        // Upload to IPFS
        const { path: ipfsHash } = await ipfs.add(encryptedFile);
        // Clean up
        fs.unlinkSync(req.file.path);
        res.json({ ipfsHash });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Health check
app.get('/', (req, res) => {
    res.send('Patent Registry Backend Running');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
