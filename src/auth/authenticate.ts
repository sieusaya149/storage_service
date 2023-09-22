import JWT from 'jsonwebtoken';
import {asyncHandler} from '../helpers/asyncHandler';
import {NextFunction, Request, Response} from 'express';
import {AuthFailureError, BadRequestError} from '../core/ApiError';
import KeyStoreRepo from '../database/repository/KeyStoreRepo';
import User from '../database/model/User';
import mongoose from 'mongoose';
import {payloadToken} from '../helpers/keygen';
import KeyStore from '../database/model/KeyStore';

interface AuthenticateRequest extends Request {
    keyStore: KeyStore;
}

export const authentication = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey) as payloadToken;
        if (userIdStr !== decodeUser.userId) {
            throw new AuthFailureError('Verify Key Failed');
        }
        // should define in global variable
        req.keyStore = keyStore;
        next();
    } catch (error) {
        throw new AuthFailureError('Is there something wrong when verify key');
    }
});
