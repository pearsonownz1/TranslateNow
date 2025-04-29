import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES-GCM, the IV is typically 12 bytes, but 16 bytes is also common and supported by Node.js crypto
const AUTH_TAG_LENGTH = 16;

// Ensure the encryption key is set and is the correct length (32 bytes for AES-256)
const encryptionKeyString = process.env.TOKEN_ENCRYPTION_KEY;
if (!encryptionKeyString) {
    throw new Error('TOKEN_ENCRYPTION_KEY environment variable is not set.');
}
const encryptionKey = Buffer.from(encryptionKeyString, 'base64'); // Assuming the key is base64 encoded
if (encryptionKey.length !== 32) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be a 32-byte key (base64 encoded).');
}

/**
 * Encrypts text using AES-256-GCM.
 * @param text The text to encrypt.
 * @returns A string containing the IV, auth tag, and ciphertext, concatenated and base64 encoded.
 */
export function encrypt(text: string): string {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        // Concatenate IV, auth tag, and ciphertext, then encode
        const buffer = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]);
        return buffer.toString('base64');
    } catch (error) {
        console.error("Encryption failed:", error);
        throw new Error("Failed to encrypt data.");
    }
}

/**
 * Decrypts text encrypted with AES-256-GCM.
 * @param encryptedData The base64 encoded string containing IV, auth tag, and ciphertext.
 * @returns The original decrypted text.
 */
export function decrypt(encryptedData: string): string {
    try {
        const dataBuffer = Buffer.from(encryptedData, 'base64');

        // Extract IV, auth tag, and ciphertext
        const iv = dataBuffer.subarray(0, IV_LENGTH);
        const authTag = dataBuffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
        const ciphertext = dataBuffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

        const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(ciphertext.toString('hex'), 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error("Decryption failed:", error);
        // Avoid leaking specific crypto errors in production if possible
        throw new Error("Failed to decrypt data. Data might be corrupted or key mismatch.");
    }
}
