import crypto from 'crypto';
import {Types} from 'mongoose';
import JWT from 'jsonwebtoken';
export const generateKeyPair = (): {privateKey: string; publicKey: string} => {
    // create key pair publickey and privatekey
    const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    });
    return {privateKey, publicKey};
};

export interface payloadToken {
    userId?: Types.ObjectId;
    email: string;
}

export const generateTokenPair = (
    payload: payloadToken,
    publicKey: string,
    privateKey: string
): {accessToken: string; refreshToken: string} => {
    // create access token by private key
    const accessToken = JWT.sign(payload, privateKey, {
        expiresIn: '2 days',
        algorithm: 'RS256'
    });
    // refresh access token by private key
    const refreshToken = JWT.sign(payload, privateKey, {
        expiresIn: '7 days',
        algorithm: 'RS256'
    });

    JWT.verify(accessToken, publicKey, (err, decode) => {
        if (err) {
            throw new Error('Issue When Generate KeyPair');
        }
    });
    return {accessToken, refreshToken};
};
