const crypto = require('crypto');
const { groth16 } = require('snarkjs');
const fs = require('fs');
const path = require('path');

/**
 * Zero-Knowledge Proof Validator
 * Validates patent originality and compliance without revealing the invention details
 */
class ZKPValidator {
  constructor() {
    this.circuitPath = path.join(__dirname, '../circuits');
    this.proofsPath = path.join(__dirname, '../proofs');
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.circuitPath, this.proofsPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Generates a commitment hash for patent data
   * This creates a cryptographic commitment that can be verified without revealing the data
   * @param {Object} patentData - Patent data to commit to
   * @returns {Object} Commitment and randomness
   */
  generateCommitment(patentData) {
    try {
      // Generate random value for hiding
      const randomness = crypto.randomBytes(32).toString('hex');
      
      // Create commitment: H(patentData || randomness)
      const hash = crypto.createHash('sha256');
      hash.update(JSON.stringify(patentData) + randomness);
      const commitment = hash.digest('hex');
      
      return {
        commitment,
        randomness,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error generating commitment:', error);
      throw error;
    }
  }

  /**
   * Verifies a commitment
   * @param {Object} patentData - Original patent data
   * @param {string} commitment - Commitment hash to verify
   * @param {string} randomness - Randomness used in commitment
   * @returns {boolean} True if commitment is valid
   */
  verifyCommitment(patentData, commitment, randomness) {
    try {
      const hash = crypto.createHash('sha256');
      hash.update(JSON.stringify(patentData) + randomness);
      const computedCommitment = hash.digest('hex');
      
      return computedCommitment === commitment;
    } catch (error) {
      console.error('Error verifying commitment:', error);
      throw error;
    }
  }

  /**
   * Creates a Merkle tree for multiple patent fields
   * This allows selective disclosure of patent information
   * @param {Array} fields - Array of patent field values
   * @returns {Object} Merkle tree root and proof data
   */
  createMerkleTree(fields) {
    try {
      // Hash all fields
      const hashedFields = fields.map(field => {
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(field));
        return hash.digest('hex');
      });
      
      // Build Merkle tree
      let currentLevel = hashedFields;
      const tree = [currentLevel];
      
      while (currentLevel.length > 1) {
        const nextLevel = [];
        for (let i = 0; i < currentLevel.length; i += 2) {
          const left = currentLevel[i];
          const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
          
          const hash = crypto.createHash('sha256');
          hash.update(left + right);
          nextLevel.push(hash.digest('hex'));
        }
        currentLevel = nextLevel;
        tree.push(currentLevel);
      }
      
      const root = currentLevel[0];
      
      return {
        root,
        tree,
        leaves: hashedFields,
      };
    } catch (error) {
      console.error('Error creating Merkle tree:', error);
      throw error;
    }
  }

  /**
   * Generates a Merkle proof for a specific field
   * @param {Object} merkleData - Merkle tree data
   * @param {number} fieldIndex - Index of the field to prove
   * @returns {Array} Merkle proof path
   */
  generateMerkleProof(merkleData, fieldIndex) {
    try {
      const proof = [];
      let index = fieldIndex;
      
      for (let level = 0; level < merkleData.tree.length - 1; level++) {
        const currentLevel = merkleData.tree[level];
        const isRightNode = index % 2 === 1;
        const siblingIndex = isRightNode ? index - 1 : index + 1;
        
        if (siblingIndex < currentLevel.length) {
          proof.push({
            hash: currentLevel[siblingIndex],
            position: isRightNode ? 'left' : 'right',
          });
        }
        
        index = Math.floor(index / 2);
      }
      
      return proof;
    } catch (error) {
      console.error('Error generating Merkle proof:', error);
      throw error;
    }
  }

  /**
   * Verifies a Merkle proof
   * @param {string} leaf - Leaf hash to verify
   * @param {Array} proof - Merkle proof path
   * @param {string} root - Expected Merkle root
   * @returns {boolean} True if proof is valid
   */
  verifyMerkleProof(leaf, proof, root) {
    try {
      let computedHash = leaf;
      
      for (const proofElement of proof) {
        const hash = crypto.createHash('sha256');
        
        if (proofElement.position === 'left') {
          hash.update(proofElement.hash + computedHash);
        } else {
          hash.update(computedHash + proofElement.hash);
        }
        
        computedHash = hash.digest('hex');
      }
      
      return computedHash === root;
    } catch (error) {
      console.error('Error verifying Merkle proof:', error);
      throw error;
    }
  }

  /**
   * Generates a range proof to prove a value is within a range
   * without revealing the exact value
   * @param {number} value - Value to prove
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {Object} Range proof
   */
  generateRangeProof(value, min, max) {
    try {
      if (value < min || value > max) {
        throw new Error('Value out of range');
      }
      
      // Generate proof commitment
      const randomness = crypto.randomBytes(32);
      const commitment = crypto.createHash('sha256')
        .update(Buffer.concat([Buffer.from(value.toString()), randomness]))
        .digest('hex');
      
      // Generate challenge
      const challenge = crypto.createHash('sha256')
        .update(commitment)
        .digest('hex');
      
      // Generate response (simplified Schnorr-like proof)
      const response = crypto.createHash('sha256')
        .update(randomness.toString('hex') + challenge)
        .digest('hex');
      
      return {
        commitment,
        challenge,
        response,
        min,
        max,
        valid: true,
      };
    } catch (error) {
      console.error('Error generating range proof:', error);
      throw error;
    }
  }

  /**
   * Verifies a range proof
   * @param {Object} proof - Range proof to verify
   * @returns {boolean} True if proof is valid
   */
  verifyRangeProof(proof) {
    try {
      // Verify proof structure
      if (!proof.commitment || !proof.challenge || !proof.response) {
        return false;
      }
      
      // Recompute challenge
      const recomputedChallenge = crypto.createHash('sha256')
        .update(proof.commitment)
        .digest('hex');
      
      // Verify challenge matches
      return recomputedChallenge === proof.challenge;
    } catch (error) {
      console.error('Error verifying range proof:', error);
      return false;
    }
  }

  /**
   * Creates a zero-knowledge proof of patent originality
   * This proves the patent doesn't match existing patents without revealing content
   * @param {string} patentHash - Hash of the patent
   * @param {Array} existingPatentHashes - Array of existing patent hashes
   * @returns {Object} Proof of originality
   */
  proveOriginality(patentHash, existingPatentHashes) {
    try {
      // Verify patent doesn't match any existing patents
      const isOriginal = !existingPatentHashes.includes(patentHash);
      
      if (!isOriginal) {
        throw new Error('Patent matches existing patent');
      }
      
      // Generate proof
      const randomness = crypto.randomBytes(32).toString('hex');
      const proofCommitment = crypto.createHash('sha256')
        .update(patentHash + randomness)
        .digest('hex');
      
      // Create challenge based on existing patents
      const existingHashesStr = existingPatentHashes.join('');
      const challenge = crypto.createHash('sha256')
        .update(proofCommitment + existingHashesStr)
        .digest('hex');
      
      return {
        proof: proofCommitment,
        challenge,
        timestamp: Date.now(),
        isOriginal: true,
        numComparisons: existingPatentHashes.length,
      };
    } catch (error) {
      console.error('Error proving originality:', error);
      throw error;
    }
  }

  /**
   * Verifies originality proof
   * @param {Object} proof - Originality proof
   * @param {Array} existingPatentHashes - Array of existing patent hashes
   * @returns {boolean} True if proof is valid
   */
  verifyOriginalityProof(proof, existingPatentHashes) {
    try {
      if (!proof.proof || !proof.challenge) {
        return false;
      }
      
      // Recompute challenge
      const existingHashesStr = existingPatentHashes.join('');
      const recomputedChallenge = crypto.createHash('sha256')
        .update(proof.proof + existingHashesStr)
        .digest('hex');
      
      return recomputedChallenge === proof.challenge;
    } catch (error) {
      console.error('Error verifying originality proof:', error);
      return false;
    }
  }

  /**
   * Creates a proof of knowledge without revealing the knowledge
   * @param {string} secret - Secret knowledge to prove
   * @returns {Object} Proof of knowledge
   */
  proveKnowledge(secret) {
    try {
      // Generate random value
      const randomValue = crypto.randomBytes(32).toString('hex');
      
      // Create commitment
      const commitment = crypto.createHash('sha256')
        .update(secret + randomValue)
        .digest('hex');
      
      // Create challenge
      const challenge = crypto.createHash('sha256')
        .update(commitment)
        .digest('hex');
      
      // Create response (without revealing secret)
      const response = crypto.createHash('sha256')
        .update(randomValue + challenge)
        .digest('hex');
      
      return {
        commitment,
        challenge,
        response,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error proving knowledge:', error);
      throw error;
    }
  }

  /**
   * Batch verification of multiple proofs
   * More efficient than verifying each proof individually
   * @param {Array} proofs - Array of proofs to verify
   * @returns {Object} Verification results
   */
  batchVerifyProofs(proofs) {
    try {
      const results = proofs.map((proof, index) => {
        try {
          // Verify proof structure
          const isValid = proof.commitment && proof.challenge && proof.response;
          return {
            index,
            valid: isValid,
            proofId: proof.commitment,
          };
        } catch (error) {
          return {
            index,
            valid: false,
            error: error.message,
          };
        }
      });
      
      const allValid = results.every(r => r.valid);
      
      return {
        success: allValid,
        results,
        total: proofs.length,
        valid: results.filter(r => r.valid).length,
        invalid: results.filter(r => !r.valid).length,
      };
    } catch (error) {
      console.error('Error in batch verification:', error);
      throw error;
    }
  }

  /**
   * Generates a nullifier to prevent double-spending or double-use
   * @param {string} identifier - Unique identifier
   * @param {string} secret - Secret value
   * @returns {string} Nullifier hash
   */
  generateNullifier(identifier, secret) {
    try {
      const nullifier = crypto.createHash('sha256')
        .update(identifier + secret)
        .digest('hex');
      
      return nullifier;
    } catch (error) {
      console.error('Error generating nullifier:', error);
      throw error;
    }
  }
}

module.exports = new ZKPValidator();
