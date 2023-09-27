import {Types} from 'mongoose';
import User from '../model/User';
import KeyStore, {KeyStoreData, KeystoreModel} from '../model/KeyStore';
import {ClientSession} from 'mongoose';
import Logger from '~/helpers/Logger';
class KeyStoreRepo {
    static existingKeyForUser = async (
        user: Types.ObjectId
    ): Promise<KeyStore | null> => {
        return KeystoreModel.findOne({userId: user}).lean().exec();
    };

    static getKeyForUser = async (
        userId: Types.ObjectId
    ): Promise<KeyStore | null> => {
        return KeystoreModel.findOne({userId: userId}).lean().exec();
    };

    static deleteKeyForUser = async (user: Types.ObjectId) => {
        return KeystoreModel.deleteOne({userId: user}).lean().exec();
    };

    static create = async (newKeyStore: KeyStore): Promise<KeyStore> => {
        // should check if the User of KeyStore is Existing or not
        if (await this.existingKeyForUser(newKeyStore.userId)) {
            Logger.warn('The keystore Existing Should Update');
            await this.deleteKeyForUser(newKeyStore.userId);
        }
        const now = new Date();
        newKeyStore.createdAt = newKeyStore.updatedAt = now;
        const keyStore = await KeystoreModel.create(newKeyStore);
        return keyStore.toObject();
    };

    static upsertKeyForUser = async (
        newKeyStore: KeyStore
    ): Promise<KeyStore | null> => {
        const now = new Date();
        newKeyStore.updatedAt = now;

        const filter = {userId: newKeyStore.userId};

        const update = {
            $set: {
                ...newKeyStore,
                createdAt: now // Set createdAt if it's a new document
            }
        };

        // Set the options to upsert (insert if not found) and return the new document
        const options = {upsert: true, new: true};

        // Use findOneAndUpdate to perform the upsert operation
        const keyStore = await KeystoreModel.findOneAndUpdate(
            filter,
            update,
            options
        )
            .lean()
            .exec();

        return keyStore;
    };

    static deleteAll = async () => {
        await KeystoreModel.deleteMany({}).exec();
    };
}

export default KeyStoreRepo;
