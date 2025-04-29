import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES-GCM
const AUTH_TAG_LENGTH = 16;

// Ensure the encryption key is set and is the correct length (32 bytes for AES-256)
const encryptionKeyString = process.env.TOKEN_ENCRYPTION_KEY;
if (!encryptionKeyString) {
    // Log error but don't throw here, let calling function handle missing key if needed
    console.error('TOKEN_ENCRYPTION_KEY environment variable is not set.');
    // Consider throwing if encryption is absolutely mandatory for the app to function
    // throw new Error('TOKEN_ENCRYPTION_KEY environment variable is not set.');
}
// Initialize key buffer only if the string exists
const encryptionKey = encryptionKeyString ? Buffer.from(encryptionKeyString, 'base64') : null;

/**
 * Encrypts text using AES-256-GCM.
 * @param text The text to encrypt.
 * @returns A string containing the IV, auth tag, and ciphertext, concatenated and base64 encoded.
 * @throws Error if encryption key is missing or invalid, or if encryption fails.
 */
export function encrypt(text: string): string {
    if (!encryptionKey || encryptionKey.length !== 32) {
        console.error('Encryption failed: TOKEN_ENCRYPTION_KEY is missing or invalid.');
        throw new Error('Encryption key is not configured correctly.');
    }
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
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
 * @throws Error if encryption key is missing or invalid, or if decryption fails.
 */
export function decrypt(encryptedData: string): string {
     if (!encryptionKey || encryptionKey.length !== 32) {
        console.error('Decryption failed: TOKEN_ENCRYPTION_KEY is missing or invalid.');
        throw new Error('Encryption key is not configured correctly.');
    }
    try {
        const dataBuffer = Buffer.from(encryptedData, 'base64');
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
        throw new Error("Failed to decrypt data. Data might be corrupted or key mismatch.");
    }
}
