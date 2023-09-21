import {Types} from 'mongoose';
import User from '../model/User';
import KeyStore, {KeystoreModel} from '../model/KeyStore';
import {ClientSession} from 'mongoose';
class KeyStoreRepo {
    static create = async (newKeyStore: KeyStore): Promise<KeyStore> => {
        const now = new Date();
        newKeyStore.createdAt = newKeyStore.updatedAt = now;
        const keyStore = await KeystoreModel.create(newKeyStore);
        return keyStore.toObject();
    };

    static deleteAll = async () => {
        await KeystoreModel.deleteMany({}).exec();
    };
}

export default KeyStoreRepo;
