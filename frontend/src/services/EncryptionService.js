// src/services/EncryptionService.js
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

class EncryptionService {
  constructor() {
    this.keyPair = null;
    this.publicKeysCache = {}; // Cache of other users' public keys
  }

  // Initialize the encryption service
  async initialize() {
    // Try to load existing key pair from local storage
    const savedKeyPair = localStorage.getItem('e2ee_key_pair');
    
    if (savedKeyPair) {
      try {
        this.keyPair = JSON.parse(savedKeyPair);
      } catch (error) {
        console.error('Invalid saved key pair, generating new one', error);
        this.generateNewKeyPair();
      }
    } else {
      // Generate new key pair if none exists
      this.generateNewKeyPair();
    }
    
    return this.getPublicKey();
  }
  
  // Generate a new key pair
  generateNewKeyPair() {
    this.keyPair = nacl.box.keyPair();
    
    // Store as Uint8Array-serialized version for localStorage
    const serialized = {
      publicKey: Array.from(this.keyPair.publicKey),
      secretKey: Array.from(this.keyPair.secretKey)
    };
    
    localStorage.setItem('e2ee_key_pair', JSON.stringify(serialized));
    
    // Clear the cache when generating new keys
    this.publicKeysCache = {};
  }
  
  // Convert key to base64 for storage/transmission
  getPublicKey() {
    if (!this.keyPair) {
      throw new Error('Encryption not initialized');
    }
    
    return util.encodeBase64(this.keyPair.publicKey);
  }
  
  // Fetch and cache another user's public key
  async getPublicKeyForUser(userId, fetchFunc) {
    // Return from cache if available
    if (this.publicKeysCache[userId]) {
      return this.publicKeysCache[userId];
    }
    
    // Fetch from server
    const publicKeyBase64 = await fetchFunc(userId);
    
    if (!publicKeyBase64) {
      throw new Error(`No public key available for user ${userId}`);
    }
    
    // Convert from base64 and cache
    const publicKey = util.decodeBase64(publicKeyBase64);
    this.publicKeysCache[userId] = publicKey;
    
    return publicKey;
  }
  
  // Encrypt a message for a specific recipient
  async encryptMessage(message, recipientPublicKey) {
    if (!this.keyPair) {
      throw new Error('Encryption not initialized');
    }
    
    // Convert message to Uint8Array
    const messageUint8 = util.decodeUTF8(message);
    
    // Generate a one-time nonce
    const nonce = nacl.randomBytes(24);
    
    // Convert recipient's public key if it's base64
    const publicKey = typeof recipientPublicKey === 'string' 
      ? util.decodeBase64(recipientPublicKey) 
      : recipientPublicKey;
    
    // Encrypt the message
    const encryptedMessage = nacl.box(
      messageUint8,
      nonce,
      publicKey,
      this.keyPair.secretKey
    );
    
    // Return encrypted message and nonce as base64 strings
    return {
      encrypted: util.encodeBase64(encryptedMessage),
      nonce: util.encodeBase64(nonce)
    };
  }
  
  // Decrypt a message from a specific sender
  async decryptMessage(encryptedData, senderPublicKey) {
    if (!this.keyPair) {
      throw new Error('Encryption not initialized');
    }
    
    try {
      // Convert encrypted message and nonce from base64
      const encryptedMessage = util.decodeBase64(encryptedData.encrypted);
      const nonce = util.decodeBase64(encryptedData.nonce);
      
      // Convert sender's public key if it's base64
      const publicKey = typeof senderPublicKey === 'string' 
        ? util.decodeBase64(senderPublicKey) 
        : senderPublicKey;
      
      // Decrypt the message
      const decryptedMessage = nacl.box.open(
        encryptedMessage,
        nonce,
        publicKey,
        this.keyPair.secretKey
      );
      
      if (!decryptedMessage) {
        throw new Error('Decryption failed');
      }
      
      // Convert decrypted message from Uint8Array to string
      return util.encodeUTF8(decryptedMessage);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }
}

// Create a singleton instance
const encryptionService = new EncryptionService();
export default encryptionService;