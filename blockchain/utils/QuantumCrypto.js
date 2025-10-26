const { KeyRing } = require('@qanplatform/keyring');
const { qanx } = require('@qanplatform/qanx.js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class QuantumCrypto {
  constructor() {
    this.algorithm = process.env.QUANTUM_ALGORITHM || 'CRYSTALS-Dilithium';
    this.keySize = parseInt(process.env.QUANTUM_KEY_SIZE) || 2048;
    this.signatureScheme = process.env.QUANTUM_SIGNATURE_SCHEME || 'Dilithium5';
    this.keyRing = new KeyRing({
      network: process.env.NETWORK || 'testnet',
      algorithm: this.algorithm,
      keySize: this.keySize,
    });
    this.keyStorePath = path.join(__dirname, '../.keystore');
    this.ensureKeyStore();
  }

  ensureKeyStore() {
    if (!fs.existsSync(this.keyStorePath)) {
      fs.mkdirSync(this.keyStorePath, { recursive: true });
    }
  }

  async generateKeyPair(identifier) {
    try {
      const keyPair = await this.keyRing.generateKeyPair({
        algorithm: this.algorithm,
        keySize: this.keySize,
        signatureScheme: this.signatureScheme,
      });

      // Save keys securely
      const keyPath = path.join(this.keyStorePath, `${identifier}.json`);
      const keyData = {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
        algorithm: this.algorithm,
        keySize: this.keySize,
        signatureScheme: this.signatureScheme,
        createdAt: new Date().toISOString(),
      };

      fs.writeFileSync(keyPath, JSON.stringify(keyData, null, 2), 'utf8');
      return keyData;
    } catch (error) {
      console.error('Error generating key pair:', error);
      throw error;
    }
  }

  async signMessage(identifier, message) {
    try {
      const keyPath = path.join(this.keyStorePath, `${identifier}.json`);
      if (!fs.existsSync(keyPath)) {
        throw new Error(`No key pair found for identifier: ${identifier}`);
      }

      const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      const signature = await this.keyRing.sign({
        privateKey: keyData.privateKey,
        message,
        algorithm: keyData.algorithm,
        signatureScheme: keyData.signatureScheme,
      });

      return {
        signature,
        publicKey: keyData.publicKey,
        algorithm: keyData.algorithm,
        signatureScheme: keyData.signatureScheme,
      };
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }

  async verifySignature(publicKey, message, signature, algorithm = this.algorithm) {
    try {
      const isValid = await this.keyRing.verify({
        publicKey,
        message,
        signature,
        algorithm,
      });
      return isValid;
    } catch (error) {
      console.error('Error verifying signature:', error);
      throw error;
    }
  }

  async generateQuantumResistantHash(data) {
    try {
      // Use a combination of traditional and quantum-resistant hashing
      const sha3Hash = crypto.createHash('sha3-512').update(data).digest('hex');
      const quantumHash = await this.keyRing.hash({
        data: sha3Hash,
        algorithm: this.algorithm,
      });
      return quantumHash;
    } catch (error) {
      console.error('Error generating quantum-resistant hash:', error);
      throw error;
    }
  }

  async encryptWithPublicKey(publicKey, data) {
    try {
      const encrypted = await this.keyRing.encrypt({
        publicKey,
        data,
        algorithm: this.algorithm,
      });
      return encrypted;
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error;
    }
  }

  async decryptWithPrivateKey(identifier, encryptedData) {
    try {
      const keyPath = path.join(this.keyStorePath, `${identifier}.json`);
      if (!fs.existsSync(keyPath)) {
        throw new Error(`No key pair found for identifier: ${identifier}`);
      }

      const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      const decrypted = await this.keyRing.decrypt({
        privateKey: keyData.privateKey,
        encryptedData,
        algorithm: keyData.algorithm,
      });

      return decrypted;
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  }

  // Key rotation functionality
  async rotateKeys(identifier) {
    try {
      // Generate new key pair
      const newKeyPair = await this.generateKeyPair(`${identifier}_${Date.now()}`);
      
      // In a real implementation, you would update all references to the old key
      // and re-encrypt any data encrypted with the old key
      
      return {
        success: true,
        message: 'Key rotation completed successfully',
        newPublicKey: newKeyPair.publicKey,
      };
    } catch (error) {
      console.error('Error rotating keys:', error);
      throw error;
    }
  }
}

// Export a singleton instance
module.exports = new QuantumCrypto();
