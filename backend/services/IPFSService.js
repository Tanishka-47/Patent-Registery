const { create } = require('ipfs-http-client');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class IPFSService {
  constructor() {
    // Initialize IPFS client
    this.ipfs = create({
      url: process.env.IPFS_API_URL || '/ip4/127.0.0.1/tcp/5001',
      timeout: '5m',
    });
    
    this.gatewayUrl = process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/';
  }

  /**
   * Encrypts data using AES-256-GCM encryption
   * @param {Buffer|string} data - Data to encrypt
   * @param {string} password - Password for encryption (optional, generates if not provided)
   * @returns {Object} Encrypted data and encryption key
   */
  encryptData(data, password = null) {
    try {
      // Generate a random password if not provided
      const encryptionKey = password || crypto.randomBytes(32).toString('hex');
      
      // Derive key from password using scrypt
      const salt = crypto.randomBytes(16);
      const key = crypto.scryptSync(encryptionKey, salt, 32);
      
      // Create initialization vector
      const iv = crypto.randomBytes(16);
      
      // Create cipher
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
      
      // Convert data to buffer if it's a string
      const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
      
      // Encrypt data
      const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
      
      // Get auth tag
      const authTag = cipher.getAuthTag();
      
      // Combine all components
      const combined = Buffer.concat([
        salt,
        iv,
        authTag,
        encrypted
      ]);
      
      return {
        encryptedData: combined.toString('base64'),
        encryptionKey,
        algorithm: 'aes-256-gcm',
      };
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error;
    }
  }

  /**
   * Decrypts data using AES-256-GCM encryption
   * @param {string} encryptedData - Base64 encoded encrypted data
   * @param {string} password - Password used for encryption
   * @returns {Buffer} Decrypted data
   */
  decryptData(encryptedData, password) {
    try {
      // Convert encrypted data from base64
      const combined = Buffer.from(encryptedData, 'base64');
      
      // Extract components
      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 32);
      const authTag = combined.slice(32, 48);
      const encrypted = combined.slice(48);
      
      // Derive key from password
      const key = crypto.scryptSync(password, salt, 32);
      
      // Create decipher
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);
      
      // Decrypt data
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      
      return decrypted;
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  }

  /**
   * Uploads a file to IPFS with encryption
   * @param {string} filePath - Path to the file to upload
   * @param {boolean} encrypt - Whether to encrypt the file
   * @param {string} password - Password for encryption (optional)
   * @returns {Object} IPFS hash and encryption key
   */
  async uploadFile(filePath, encrypt = true, password = null) {
    try {
      // Read file
      const fileContent = fs.readFileSync(filePath);
      
      let dataToUpload = fileContent;
      let encryptionKey = null;
      
      // Encrypt if requested
      if (encrypt) {
        const encrypted = this.encryptData(fileContent, password);
        dataToUpload = Buffer.from(encrypted.encryptedData, 'base64');
        encryptionKey = encrypted.encryptionKey;
      }
      
      // Upload to IPFS
      const result = await this.ipfs.add(dataToUpload, {
        pin: true,
        progress: (bytes) => console.log(`Uploading: ${bytes} bytes`),
      });
      
      return {
        ipfsHash: result.path,
        cid: result.cid.toString(),
        size: result.size,
        encryptionKey: encrypt ? encryptionKey : null,
        encrypted: encrypt,
        url: `${this.gatewayUrl}${result.path}`,
      };
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw error;
    }
  }

  /**
   * Uploads data (buffer or string) to IPFS with encryption
   * @param {Buffer|string} data - Data to upload
   * @param {boolean} encrypt - Whether to encrypt the data
   * @param {string} password - Password for encryption (optional)
   * @returns {Object} IPFS hash and encryption key
   */
  async uploadData(data, encrypt = true, password = null) {
    try {
      let dataToUpload = data;
      let encryptionKey = null;
      
      // Encrypt if requested
      if (encrypt) {
        const encrypted = this.encryptData(data, password);
        dataToUpload = Buffer.from(encrypted.encryptedData, 'base64');
        encryptionKey = encrypted.encryptionKey;
      }
      
      // Upload to IPFS
      const result = await this.ipfs.add(dataToUpload, {
        pin: true,
      });
      
      return {
        ipfsHash: result.path,
        cid: result.cid.toString(),
        size: result.size,
        encryptionKey: encrypt ? encryptionKey : null,
        encrypted: encrypt,
        url: `${this.gatewayUrl}${result.path}`,
      };
    } catch (error) {
      console.error('Error uploading data to IPFS:', error);
      throw error;
    }
  }

  /**
   * Downloads and decrypts data from IPFS
   * @param {string} ipfsHash - IPFS hash of the file
   * @param {string} password - Password for decryption (optional)
   * @returns {Buffer} Downloaded (and decrypted if password provided) data
   */
  async downloadData(ipfsHash, password = null) {
    try {
      // Download from IPFS
      const chunks = [];
      for await (const chunk of this.ipfs.cat(ipfsHash)) {
        chunks.push(chunk);
      }
      const data = Buffer.concat(chunks);
      
      // Decrypt if password provided
      if (password) {
        return this.decryptData(data.toString('base64'), password);
      }
      
      return data;
    } catch (error) {
      console.error('Error downloading data from IPFS:', error);
      throw error;
    }
  }

  /**
   * Pins a file to IPFS to ensure it's not garbage collected
   * @param {string} ipfsHash - IPFS hash to pin
   * @returns {boolean} Success status
   */
  async pinFile(ipfsHash) {
    try {
      await this.ipfs.pin.add(ipfsHash);
      return true;
    } catch (error) {
      console.error('Error pinning file:', error);
      throw error;
    }
  }

  /**
   * Unpins a file from IPFS
   * @param {string} ipfsHash - IPFS hash to unpin
   * @returns {boolean} Success status
   */
  async unpinFile(ipfsHash) {
    try {
      await this.ipfs.pin.rm(ipfsHash);
      return true;
    } catch (error) {
      console.error('Error unpinning file:', error);
      throw error;
    }
  }

  /**
   * Gets file statistics from IPFS
   * @param {string} ipfsHash - IPFS hash
   * @returns {Object} File statistics
   */
  async getFileStats(ipfsHash) {
    try {
      const stats = await this.ipfs.files.stat(`/ipfs/${ipfsHash}`);
      return {
        cid: stats.cid.toString(),
        size: stats.size,
        cumulativeSize: stats.cumulativeSize,
        blocks: stats.blocks,
        type: stats.type,
      };
    } catch (error) {
      console.error('Error getting file stats:', error);
      throw error;
    }
  }

  /**
   * Uploads patent metadata to IPFS
   * @param {Object} metadata - Patent metadata object
   * @param {boolean} encrypt - Whether to encrypt the metadata
   * @returns {Object} IPFS hash and encryption details
   */
  async uploadPatentMetadata(metadata, encrypt = true) {
    try {
      const metadataString = JSON.stringify(metadata, null, 2);
      return await this.uploadData(metadataString, encrypt);
    } catch (error) {
      console.error('Error uploading patent metadata:', error);
      throw error;
    }
  }

  /**
   * Downloads and parses patent metadata from IPFS
   * @param {string} ipfsHash - IPFS hash of the metadata
   * @param {string} password - Password for decryption (optional)
   * @returns {Object} Patent metadata
   */
  async downloadPatentMetadata(ipfsHash, password = null) {
    try {
      const data = await this.downloadData(ipfsHash, password);
      return JSON.parse(data.toString('utf8'));
    } catch (error) {
      console.error('Error downloading patent metadata:', error);
      throw error;
    }
  }

  /**
   * Generates a content hash for verification
   * @param {Buffer|string} data - Data to hash
   * @returns {string} SHA-256 hash
   */
  generateContentHash(data) {
    const hash = crypto.createHash('sha256');
    hash.update(Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8'));
    return hash.digest('hex');
  }

  /**
   * Verifies the integrity of downloaded data
   * @param {Buffer|string} data - Downloaded data
   * @param {string} expectedHash - Expected hash
   * @returns {boolean} True if hash matches
   */
  verifyContentIntegrity(data, expectedHash) {
    const actualHash = this.generateContentHash(data);
    return actualHash === expectedHash;
  }
}

module.exports = new IPFSService();
