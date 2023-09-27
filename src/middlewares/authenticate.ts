import JWT from 'jsonwebtoken';
import {asyncHandler} from '../helpers/asyncHandler';
import {NextFunction, Request, Response} from 'express';
import {AuthFailureError, BadRequestError} from '../core/ApiError';
import KeyStoreRepo from '../database/repository/KeyStoreRepo';
import User from '../database/model/User';
import mongoose from 'mongoose';
import {generateTokenPair, payloadToken} from '../helpers/keygen';
import KeyStore from '../database/model/KeyStore';
import {Types} from 'mongoose';
import {createCookiesAuthen} from '../cookies/createCookies';

interface decodeData {
    userId: Types.ObjectId;
    email: string;
    iat: number;
    exp: number;
}
export const authentication = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const accessToken = req.cookies['access-token'];
        const userIdStr = req.cookies['userId'];
        if (!userIdStr || !accessToken) {
            throw new AuthFailureError('Invalid request');
        }
        try {
            const userId = new mongoose.Types.ObjectId(userIdStr);
            const keyStore = await KeyStoreRepo.getKeyForUser(userId);
            if (keyStore == null) {
                throw new BadRequestError('Not Found User Id');
            }
            if (!accessToken) {
                throw new AuthFailureError('Invalid authentication');
            }
            const decodeUserByAcess = JWT.verify(
                accessToken,
                keyStore.publicKey
            ) as decodeData;

            if (userIdStr !== decodeUserByAcess.userId) {
                throw new AuthFailureError('Verify Access Token Failed');
            }

            const now = (new Date().getTime() + 1) / 1000;
            if (decodeUserByAcess.exp < now) {
                console.log('access token is expired');
                // try to use refresh token
                const refreshTokenCurrent = req.cookies['refresh-token'];
                const decodeUserByRefresh = JWT.verify(
                    refreshTokenCurrent,
                    keyStore.publicKey
                ) as decodeData;
                if (userIdStr !== decodeUserByRefresh.userId) {
                    throw new AuthFailureError('Verify Refresh Token Failed');
                }
                if (decodeUserByRefresh.exp < now) {
                    throw new AuthFailureError('All token expires');
                }
                const payloadNew: payloadToken = {
                    userId: decodeUserByRefresh.userId,
                    email: decodeUserByRefresh.email
                };
                const {accessToken, refreshToken} = generateTokenPair(
                    payloadNew,
                    keyStore.publicKey,
                    keyStore.privateKey
                );
                const newKeyStore = {
                    userId: decodeUserByRefresh.userId,
                    publicKey: keyStore.publicKey,
                    privateKey: keyStore.privateKey,
                    accessToken: accessToken,
                    refreshToken: refreshToken
                } as KeyStore;
                // create new keystore for user
                await KeyStoreRepo.upsertKeyForUser(newKeyStore);

                // reset cookies
                createCookiesAuthen(
                    res,
                    accessToken,
                    refreshToken,
                    decodeUserByRefresh.userId.toString()
                );
                const keyStoreNew = await KeyStoreRepo.getKeyForUser(userId);
                if (keyStoreNew == null) {
                    throw new BadRequestError('Not Found User Id');
                }
                req.keyStore = keyStoreNew;
                next();
            } else {
                req.keyStore = keyStore;
                next();
            }
        } catch (error) {
            throw new AuthFailureError(
                'Is there something wrong when verify key'
            );
        }
    }
);
