import crypto from 'crypto';
const HASHING_ALGO = 'sha256';
const CIPHER_ALGO = 'aes256';

interface CipherIvEncrypt {
    IV: Buffer;
    cipher: crypto.Cipher;
}
export default class CipherCrypto {
    static generateCipher = (secretKey: string): CipherIvEncrypt => {
        const initVector = crypto.randomBytes(16);
        const cipherKey = crypto
            .createHash(HASHING_ALGO)
            .update(secretKey)
            .digest();
        const cipher = crypto.createCipheriv(
            CIPHER_ALGO,
            cipherKey,
            initVector
        );
        return {
            IV: initVector,
            cipher: cipher
        };
    };

    static generateDecipher = (secretKey: string, initVector: Buffer) => {
        const cipherKey = crypto
            .createHash(HASHING_ALGO)
            .update(secretKey)
            .digest();
        const decipher = crypto.createDecipheriv(
            CIPHER_ALGO,
            cipherKey,
            initVector
        );
        return decipher;
    };
}
