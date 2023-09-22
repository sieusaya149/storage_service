import {NextFunction, Request, Response} from 'express';
import UserRepo from '../database/repository/UserRepo';
import KeyStoreRepo from '../database/repository/KeyStoreRepo';
import {UserData} from '../database/model/User';
import {KeyStoreData} from '../database/model/KeyStore';

import User from '../database/model/User';
import KeyStore from '../database/model/KeyStore';

import bcrypt from 'bcrypt';
import mongoConnection from '../database/index';
import {
    AuthFailureError,
    InternalError,
    BadRequestError,
    NotFoundError,
    ForbiddenError,
    NoEntryError,
    BadTokenError,
    TokenExpiredError,
    NoDataError,
    AccessTokenError
} from '../core/ApiError';
import {generateKeyPair, generateTokenPair, payloadToken} from '../helpers/keygen';
import Logger from '../helpers/Logger';
import {createCookiesAuthen, createCookiesLogout} from '../cookies/createCookies';

export class AccessService {
    static signUp = async (req: Request, res: Response) => {
        const {userName, email, birthDay, password} = req.body;
        const emailExistence = await UserRepo.emailExist(email);
        const userNameExistence = await UserRepo.userNameExist(userName);

        if (emailExistence || userNameExistence) {
            throw new BadRequestError('UserName or Email already Registered');
        }

        // const session = await mongoConnection.startSession();
        try {
            // session.startTransaction();
            // hasing password
            const passwordHashed = await bcrypt.hash(password, 10);

            // generate synmatrickeys pair
            const {privateKey, publicKey} = generateKeyPair();

            // create new user
            const newUser = await UserRepo.create({
                userName: userName,
                email: email,
                birthDay: birthDay,
                password: passwordHashed
            } as User);

            // generate token pair
            const payload: payloadToken = {userId: newUser._id, email: newUser.email};

            const {accessToken, refreshToken} = generateTokenPair(payload, publicKey, privateKey);
            const newKeyStore = {
                userId: newUser,
                publicKey: publicKey,
                privateKey: privateKey,
                accessToken: accessToken,
                refreshToken: refreshToken
            } as KeyStore;
            // create new keystore for user
            const newKey = await KeyStoreRepo.create(newKeyStore);
            // add cookies for response
            createCookiesAuthen(res, accessToken, refreshToken, newUser._id?.toString());

            // await session.commitTransaction();

            // await session.endSession();
            Logger.info('New User and KeyStore Was Created Successfully');

            return {userData: new UserData(newUser).sanitize(), keyStore: new KeyStoreData(newKey).sanitize()};
        } catch (error) {
            // await session.abortTransaction();

            // await session.endSession();
            Logger.error('New User and KeyStore Was Created Failed', error);
            throw new InternalError('Issue Happen When Add Registering User');
        }
    };

    static logIn = async (req: Request, res: Response) => {
        const {email, userName, password} = req.body;
        let existingUser: User | null = null;
        try {
            if (email) {
                existingUser = await UserRepo.findByEmail(email);
            }
            if (userName) {
                existingUser = await UserRepo.findByUserName(userName);
            }
            if (!existingUser) {
                throw new BadRequestError('Your Credentials Invalid');
            }
            const match = await bcrypt.compare(password, existingUser.password);
            if (!match) {
                throw new AuthFailureError('Authentication Failed');
            }

            // generate synmatrickeys pair
            const {privateKey, publicKey} = generateKeyPair();
            // payload in JWT
            const payload: payloadToken = {userId: existingUser._id, email: existingUser.email};

            const {accessToken, refreshToken} = generateTokenPair(payload, publicKey, privateKey);
            const newKeyStore = {
                userId: existingUser,
                publicKey: publicKey,
                privateKey: privateKey,
                accessToken: accessToken,
                refreshToken: refreshToken
            } as KeyStore;
            // create new keystore for user
            const newKey = (await KeyStoreRepo.upsertKeyForUser(newKeyStore)) as KeyStore; // should not null
            // add cookies for response
            createCookiesAuthen(res, accessToken, refreshToken, existingUser._id?.toString());
            Logger.info('The KeyStore Was Updated Successfully');

            return {userData: new UserData(existingUser).sanitize(true), keyStore: new KeyStoreData(newKey).sanitize()};

            // Replace the previous key
        } catch (error) {
            // await session.endSession();
            Logger.error('Login Processing Failed', error);
            throw new InternalError('Issue Happen When Login User');
        }

        return {};
    };

    static logOut = async (req: Request, res: Response) => {
        if (req.keyStore) {
            const data = await KeyStoreRepo.deleteKeyForUser(req.keyStore.userId);
        }
        createCookiesLogout(res);
    };
}
