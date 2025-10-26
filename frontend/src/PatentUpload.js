import React, { useState } from 'react';
import { Button, Typography, Box, LinearProgress, Paper, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

function generateEncryptionKey() {
    // Generate a random 32-byte hex string
    return Array.from(window.crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function PatentUpload({ onIpfsHash }) {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState({ type: 'idle', message: '' });
    const [encryptionKey, setEncryptionKey] = useState('');
    const [ipfsHash, setIpfsHash] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setEncryptionKey(generateEncryptionKey());
            setStatus({ type: 'idle', message: '' });
        }
    };

    const handleUpload = async () => {
        if (!file || !encryptionKey) return;
        
        // Show immediate success UI feedback
        setStatus({ 
            type: 'success', 
            message: 'Starting file upload...',
            immediate: true // Flag to indicate this is an immediate success state
        });
        setIsUploading(true);
        setProgress(10);
        
        // Small delay to show the immediate success state
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update to show actual upload status
        setStatus({ type: 'uploading', message: 'Encrypting file...' });
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('encryptionKey', encryptionKey);
        
        try {
            setStatus({ type: 'uploading', message: 'Encrypting and uploading file...' });
            setProgress(30);
            
            const xhr = new XMLHttpRequest();
            
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setProgress(30 + Math.floor(percentComplete * 0.7)); // 30-100% for upload
                    setStatus({ 
                        type: 'uploading', 
                        message: `Uploading... ${percentComplete}%` 
                    });
                }
            };
            
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        if (data.ipfsHash) {
                            setIpfsHash(data.ipfsHash);
                            setStatus({ 
                                type: 'success', 
                                message: 'File successfully uploaded and encrypted!',
                                details: data
                            });
                            setProgress(100);
                            if (onIpfsHash) onIpfsHash(data.ipfsHash, encryptionKey);
                        } else {
                            throw new Error(data.error || 'No IPFS hash received');
                        }
                    } catch (err) {
                        setStatus({ 
                            type: 'error', 
                            message: 'Error processing upload',
                            details: err.message
                        });
                        setProgress(0);
                    }
                } else {
                    let errorMessage = 'Upload failed';
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        errorMessage = errorData.error || errorMessage;
                    } catch (e) {
                        errorMessage = `Server responded with status ${xhr.status}`;
                    }
                    setStatus({ 
                        type: 'error', 
                        message: 'Upload failed',
                        details: errorMessage
                    });
                    setProgress(0);
                }
                setIsUploading(false);
            };
            
            xhr.onerror = () => {
                setStatus({ 
                    type: 'error', 
                    message: 'Network error',
                    details: 'Could not connect to the server. Please check your connection.'
                });
                setProgress(0);
                setIsUploading(false);
            };
            
            xhr.open('POST', 'http://localhost:4000/upload-patent', true);
            xhr.send(formData);
            
        } catch (err) {
            console.error('Upload error:', err);
            setStatus({ 
                type: 'error', 
                message: 'Upload failed',
                details: err.message
            });
            setProgress(0);
            setIsUploading(false);
        }
    };

    return (
        <Paper 
            elevation={3} 
            sx={{ 
                p: 4, 
                maxWidth: 600, 
                mx: 'auto',
                mt: 4,
                bgcolor: 'background.paper'
            }}
        >
            <Typography variant="h5" gutterBottom>
                Upload Patent Document
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
                Upload your patent document to be encrypted and stored on IPFS. 
                The file will be encrypted with a secure key before uploading.
            </Typography>
            
            <Box sx={{ mt: 3, mb: 2 }}>
                <input
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    id="patent-upload"
                    type="file"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
                <label htmlFor="patent-upload">
                    <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        disabled={isUploading}
                        fullWidth
                        sx={{ py: 2 }}
                    >
                        {file ? file.name : 'Select Patent File'}
                    </Button>
                </label>
                
                {file && (
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                        {`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                    </Typography>
                )}
            </Box>
            
            {isUploading && (
                <Box sx={{ width: '100%', my: 2 }}>
                    <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 1 }}>
                        {status.message}
                    </Typography>
                </Box>
            )}
            
            {status.type === 'error' && (
                <Alert 
                    severity="error" 
                    icon={<ErrorIcon />}
                    sx={{ mt: 2 }}
                >
                    <Typography variant="subtitle2">{status.message}</Typography>
                    {status.details && (
                        <Typography variant="caption" component="div">
                            {status.details}
                        </Typography>
                    )}
                </Alert>
            )}
            
            {status.type === 'success' && (
                <Alert 
                    severity={status.immediate ? 'info' : 'success'}
                    icon={status.immediate ? null : <CheckCircleIcon />}
                    sx={{ mt: 2, ...(status.immediate && { bgcolor: 'info.light' }) }}
                >
                    <Typography variant="subtitle2">
                        {status.immediate ? 'Starting Upload...' : 'Upload Successful!'}
                    </Typography>
                    <Typography variant="caption" component="div">
                        {status.immediate 
                            ? 'Preparing your file for secure upload...' 
                            : 'Your file has been securely uploaded and encrypted.'
                        }
                    </Typography>
                </Alert>
            )}
            
            {encryptionKey && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Encryption Key (save this securely):
                    </Typography>
                    <Box 
                        component="pre" 
                        sx={{ 
                            p: 1.5, 
                            bgcolor: 'background.paper', 
                            borderRadius: 1,
                            overflowX: 'auto',
                            fontSize: '0.75rem',
                            fontFamily: 'monospace'
                        }}
                    >
                        {encryptionKey}
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        This key is required to decrypt your file. Store it securely as it cannot be recovered.
                    </Typography>
                </Box>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    startIcon={<CloudUploadIcon />}
                    sx={{ minWidth: 200 }}
                >
                    {isUploading ? 'Uploading...' : 'Encrypt & Upload'}
                </Button>
            </Box>
            
            {ipfsHash && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        IPFS Hash:
                    </Typography>
                    <Box 
                        component="pre" 
                        sx={{ 
                            p: 1.5, 
                            bgcolor: 'background.paper', 
                            borderRadius: 1,
                            overflowX: 'auto',
                            fontSize: '0.75rem',
                            fontFamily: 'monospace'
                        }}
                    >
                        {ipfsHash}
                    </Box>
                </Box>
            )}
        </Paper>
    );
}
