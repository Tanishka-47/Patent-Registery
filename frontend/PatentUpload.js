import React, { useState } from 'react';

function generateEncryptionKey() {
    // Generate a random 32-byte hex string
    return Array.from(window.crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function PatentUpload({ onIpfsHash }) {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');
    const [encryptionKey, setEncryptionKey] = useState('');
    const [ipfsHash, setIpfsHash] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setEncryptionKey(generateEncryptionKey());
    };

    const handleUpload = async () => {
        if (!file || !encryptionKey) return;
        setStatus('Encrypting and uploading...');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('encryptionKey', encryptionKey);
        try {
            const res = await fetch('http://localhost:4000/upload-patent', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.ipfsHash) {
                setIpfsHash(data.ipfsHash);
                setStatus('Uploaded to IPFS: ' + data.ipfsHash);
                if (onIpfsHash) onIpfsHash(data.ipfsHash, encryptionKey);
            } else {
                setStatus('Upload failed: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            setStatus('Upload error: ' + err.message);
        }
    };

    return (
        <div style={{border: '1px solid #ccc', padding: 20, borderRadius: 8}}>
            <h3>Upload Patent Document (Encrypted & IPFS)</h3>
            <input type="file" onChange={handleFileChange} />
            {file && <>
                <div>Encryption Key: <code>{encryptionKey}</code></div>
                <button onClick={handleUpload}>Encrypt & Upload</button>
            </>}
            {status && <div style={{marginTop: 10}}>{status}</div>}
            {ipfsHash && <div>IPFS Hash: <code>{ipfsHash}</code></div>}
        </div>
    );
}
